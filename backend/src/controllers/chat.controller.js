import ChatHistory from '../models/chatHistory.model.js';
import Workspace from '../models/workspace.model.js';
import Document from '../models/document.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import { similaritySearch } from '../services/vectorStore.service.js';
import { generateChatResponse } from '../services/gemini.service.js';

export const chat = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { message, chatId } = req.body;

  if (!message?.trim()) throw new AppError('Message is required.', 400);

  const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.userId });
  if (!workspace) throw new AppError('Workspace not found.', 404);

  // Check for indexed documents
  const indexedDocs = await Document.countDocuments({
    workspace: workspaceId,
    isIndexed: true,
  });

  if (indexedDocs === 0) {
    throw new AppError('No indexed documents found. Please upload and wait for documents to finish processing.', 400);
  }

  // Get or create chat session
  let chatSession;
  if (chatId) {
    chatSession = await ChatHistory.findOne({ _id: chatId, user: req.userId, workspace: workspaceId });
  }
  if (!chatSession) {
    chatSession = await ChatHistory.create({
      workspace: workspaceId,
      user: req.userId,
      title: message.substring(0, 50),
      messages: [],
    });
  }

  // Search for relevant context
  const searchResults = await similaritySearch(
    workspace.chromaCollectionId,
    message,
    5
  );

  // Build context from results
  const context = searchResults
    .map((r, i) => `[Source ${i + 1} - ${r.metadata.documentName}]:\n${r.content}`)
    .join('\n\n---\n\n');

  // Get chat history for context
  const recentHistory = chatSession.messages.slice(-10).map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Generate AI response
  const aiResponse = await generateChatResponse(message, context, recentHistory);

  // Map sources
  const sources = searchResults.slice(0, 3).map(r => ({
    documentName: r.metadata.documentName,
    excerpt: r.content.substring(0, 200),
    relevanceScore: r.score,
  }));

  // Save messages
  chatSession.messages.push(
    { role: 'user', content: message, timestamp: new Date() },
    { role: 'assistant', content: aiResponse, sources, timestamp: new Date() }
  );

  if (chatSession.messages.length === 2) {
    chatSession.title = message.substring(0, 60);
  }

  await chatSession.save();
  await Workspace.findByIdAndUpdate(workspaceId, { lastActivity: Date.now() });

  res.json({
    chatId: chatSession._id,
    message: aiResponse,
    sources,
    timestamp: new Date(),
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.userId });
  if (!workspace) throw new AppError('Workspace not found.', 404);

  const chats = await ChatHistory.find({ workspace: workspaceId, user: req.userId })
    .select('title messages createdAt updatedAt')
    .sort({ updatedAt: -1 });

  res.json({ chats });
});

export const getChatSession = asyncHandler(async (req, res) => {
  const chat = await ChatHistory.findOne({
    _id: req.params.chatId,
    user: req.userId,
  });

  if (!chat) throw new AppError('Chat session not found.', 404);
  res.json({ chat });
});

export const deleteChatSession = asyncHandler(async (req, res) => {
  const chat = await ChatHistory.findOneAndDelete({
    _id: req.params.chatId,
    user: req.userId,
  });

  if (!chat) throw new AppError('Chat session not found.', 404);
  res.json({ message: 'Chat deleted.' });
});

export const clearChatHistory = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.userId });
  if (!workspace) throw new AppError('Workspace not found.', 404);

  await ChatHistory.deleteMany({ workspace: workspaceId, user: req.userId });
  res.json({ message: 'Chat history cleared.' });
});
