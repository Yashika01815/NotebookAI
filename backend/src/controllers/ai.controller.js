import Document from '../models/document.model.js';
import Workspace from '../models/workspace.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import {
  generateSummary,
  generateMindMap,
  generateFlashcards,
  generateQuiz,
  generateKnowledgeGraph,
} from '../services/gemini.service.js';

const getDocumentContent = async (req, workspaceId) => {
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.userId });
  if (!workspace) throw new AppError('Workspace not found.', 404);

  const { documentId } = req.query;
  let documents;

  if (documentId) {
    documents = await Document.find({
      _id: documentId,
      workspace: workspaceId,
      isIndexed: true,
    }).select('content name');
  } else {
    documents = await Document.find({
      workspace: workspaceId,
      isIndexed: true,
    }).select('content name').limit(5);
  }

  if (!documents.length) {
    throw new AppError('No indexed documents found. Please upload and wait for processing.', 400);
  }

  const combined = documents
    .map(d => `=== ${d.name} ===\n${d.content}`)
    .join('\n\n');

  return { content: combined.substring(0, 15000), documents };
};

export const generateDocumentSummary = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { type = 'short', documentId } = req.query;

  if (!['short', 'detailed', 'insights'].includes(type)) {
    throw new AppError('Invalid summary type. Use: short, detailed, or insights', 400);
  }

  const { content, documents } = await getDocumentContent(req, workspaceId);

  // Check cache
  if (documentId && type !== 'insights') {
    const doc = await Document.findById(documentId);
    if (doc?.summary?.[type] && doc.summary.generatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return res.json({ summary: doc.summary[type], cached: true });
    }
  }

  const summary = await generateSummary(content, type);

  // Cache single document summaries
  if (documentId) {
    const update = { [`summary.${type}`]: type === 'insights' ? undefined : summary };
    if (type === 'insights') {
      update['summary.keyInsights'] = summary;
    }
    update['summary.generatedAt'] = new Date();
    await Document.findByIdAndUpdate(documentId, { $set: update });
  }

  res.json({ summary, type, documentsAnalyzed: documents.length });
});

export const generateWorkspaceMindMap = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = await getDocumentContent(req, workspaceId);
  const mindMap = await generateMindMap(content);
  res.json({ mindMap });
});

export const generateWorkspaceFlashcards = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = await getDocumentContent(req, workspaceId);
  const flashcards = await generateFlashcards(content);
  res.json({ flashcards });
});

export const generateWorkspaceQuiz = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = await getDocumentContent(req, workspaceId);
  const quiz = await generateQuiz(content);
  res.json({ quiz });
});

export const generateWorkspaceKnowledgeGraph = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = await getDocumentContent(req, workspaceId);
  const knowledgeGraph = await generateKnowledgeGraph(content);
  res.json({ knowledgeGraph });
});
