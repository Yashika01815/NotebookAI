import { Router } from 'express';
import {
  generateDocumentSummary,
  generateWorkspaceMindMap,
  generateWorkspaceFlashcards,
  generateWorkspaceQuiz,
  generateWorkspaceKnowledgeGraph,
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/workspace/:workspaceId/summary', generateDocumentSummary);
router.get('/workspace/:workspaceId/mindmap', generateWorkspaceMindMap);
router.get('/workspace/:workspaceId/flashcards', generateWorkspaceFlashcards);
router.get('/workspace/:workspaceId/quiz', generateWorkspaceQuiz);
router.get('/workspace/:workspaceId/knowledge-graph', generateWorkspaceKnowledgeGraph);

export default router;
