import Workspace from '../models/workspace.model.js';
import Document from '../models/document.model.js';
import ChatHistory from '../models/chatHistory.model.js';
import User from '../models/user.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import { deleteChromaCollection } from '../services/vectorStore.service.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ owner: req.userId })
    .populate('documents', 'name type size isIndexed createdAt')
    .sort({ lastActivity: -1 });

  res.json({ workspaces });
});

export const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    owner: req.userId,
  }).populate('documents');

  if (!workspace) throw new AppError('Workspace not found.', 404);
  res.json({ workspace });
});

export const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description, color, icon } = req.body;
  if (!name) throw new AppError('Workspace name is required.', 400);

  const chromaCollectionId = `workspace_${uuidv4().replace(/-/g, '_')}`;

  const workspace = await Workspace.create({
    name: name.trim(),
    description: description?.trim() || '',
    color: color || '#6366f1',
    icon: icon || 'book',
    owner: req.userId,
    chromaCollectionId,
  });

  await User.findByIdAndUpdate(req.userId, { $inc: { workspacesCount: 1 } });

  res.status(201).json({ message: 'Workspace created.', workspace });
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description, color, icon } = req.body;

  const workspace = await Workspace.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { name, description, color, icon, lastActivity: Date.now() },
    { new: true, runValidators: true }
  );

  if (!workspace) throw new AppError('Workspace not found.', 404);
  res.json({ message: 'Workspace updated.', workspace });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    owner: req.userId,
  });

  if (!workspace) throw new AppError('Workspace not found.', 404);

  // Delete all documents from filesystem
  const documents = await Document.find({ workspace: workspace._id });
  for (const doc of documents) {
    try {
      await fs.unlink(path.resolve(doc.filePath));
    } catch (e) {
      console.warn(`Could not delete file: ${doc.filePath}`);
    }
  }

  // Delete ChromaDB collection
  try {
    await deleteChromaCollection(workspace.chromaCollectionId);
  } catch (e) {
    console.warn('ChromaDB collection deletion failed:', e.message);
  }

  // Delete all related data
  await Promise.all([
    Document.deleteMany({ workspace: workspace._id }),
    ChatHistory.deleteMany({ workspace: workspace._id }),
    workspace.deleteOne(),
    User.findByIdAndUpdate(req.userId, { $inc: { workspacesCount: -1 } }),
  ]);

  res.json({ message: 'Workspace deleted successfully.' });
});

export const getWorkspaceStats = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.userId });
  if (!workspace) throw new AppError('Workspace not found.', 404);

  const [docCount, chatCount, indexedCount] = await Promise.all([
    Document.countDocuments({ workspace: workspace._id }),
    ChatHistory.countDocuments({ workspace: workspace._id }),
    Document.countDocuments({ workspace: workspace._id, isIndexed: true }),
  ]);

  res.json({
    stats: {
      totalDocuments: docCount,
      indexedDocuments: indexedCount,
      totalChats: chatCount,
    },
  });
});
