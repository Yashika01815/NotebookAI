import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import Document from '../models/document.model.js';
import Workspace from '../models/workspace.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import { parseDocument } from '../services/parser.service.js';
import { indexDocument, deleteDocumentFromChroma } from '../services/vectorStore.service.js';

// Multer setup
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = `uploads/${req.userId}`;
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];
  const allowedExts = ['.pdf', '.docx', '.txt', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, DOCX, TXT, and Markdown files are allowed.', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const map = { '.pdf': 'pdf', '.docx': 'docx', '.txt': 'txt', '.md': 'md' };
  return map[ext] || 'txt';
};

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);

  const { workspaceId } = req.params;
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.userId });
  if (!workspace) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new AppError('Workspace not found.', 404);
  }

  const fileType = getFileType(req.file.originalname);

  // Create document record
  const document = await Document.create({
    name: path.basename(req.file.originalname, path.extname(req.file.originalname)),
    originalName: req.file.originalname,
    type: fileType,
    size: req.file.size,
    filePath: req.file.path,
    workspace: workspaceId,
    owner: req.userId,
    indexingStatus: 'processing',
  });

  // Add to workspace
  await Workspace.findByIdAndUpdate(workspaceId, {
    $push: { documents: document._id },
    $inc: { totalDocuments: 1 },
    lastActivity: Date.now(),
  });

  // Parse and index asynchronously
  processDocument(document, workspace).catch(err => {
    console.error('Document processing failed:', err);
  });

  res.status(201).json({
    message: 'Document uploaded. Processing in background.',
    document: {
      id: document._id,
      name: document.name,
      type: document.type,
      size: document.size,
      indexingStatus: document.indexingStatus,
    },
  });
});

const processDocument = async (document, workspace) => {
  try {
    // Parse content
    const { content, metadata } = await parseDocument(document.filePath, document.type);
    
    if (!content || content.trim().length < 10) {
      throw new Error('Document appears to be empty or unreadable');
    }

    // Index in ChromaDB
    const { chunksIndexed } = await indexDocument(
      workspace.chromaCollectionId,
      document._id.toString(),
      document.name,
      content
    );

    // Update document record
    await Document.findByIdAndUpdate(document._id, {
      content: content.substring(0, 50000),
      chunksCount: chunksIndexed,
      isIndexed: true,
      indexingStatus: 'completed',
      metadata,
    });

  } catch (error) {
    await Document.findByIdAndUpdate(document._id, {
      indexingStatus: 'failed',
      indexingError: error.message,
    });
    console.error(`Failed to process document ${document._id}:`, error);
  }
};

export const getDocuments = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.userId });
  if (!workspace) throw new AppError('Workspace not found.', 404);

  const documents = await Document.find({ workspace: workspaceId, owner: req.userId })
    .select('-content')
    .sort({ createdAt: -1 });

  res.json({ documents });
});

export const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.docId,
    owner: req.userId,
  });

  if (!document) throw new AppError('Document not found.', 404);
  res.json({ document });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.docId,
    owner: req.userId,
  });

  if (!document) throw new AppError('Document not found.', 404);

  const workspace = await Workspace.findById(document.workspace);

  // Delete from ChromaDB
  if (workspace) {
    await deleteDocumentFromChroma(workspace.chromaCollectionId, document._id.toString());
    await Workspace.findByIdAndUpdate(document.workspace, {
      $pull: { documents: document._id },
      $inc: { totalDocuments: -1 },
    });
  }

  // Delete file
  try {
    await fs.unlink(path.resolve(document.filePath));
  } catch (e) {
    console.warn('Could not delete file:', e.message);
  }

  await document.deleteOne();
  res.json({ message: 'Document deleted.' });
});

export const reindexDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.docId, owner: req.userId });
  if (!document) throw new AppError('Document not found.', 404);

  const workspace = await Workspace.findById(document.workspace);
  if (!workspace) throw new AppError('Workspace not found.', 404);

  await Document.findByIdAndUpdate(document._id, { indexingStatus: 'processing', isIndexed: false });
  processDocument(document, workspace).catch(console.error);

  res.json({ message: 'Re-indexing started.' });
});
