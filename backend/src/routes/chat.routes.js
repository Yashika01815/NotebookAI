import { Router } from 'express';
import {
  chat, getChatHistory, getChatSession,
  deleteChatSession, clearChatHistory,
} from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.post('/workspace/:workspaceId', chat);
router.get('/workspace/:workspaceId/history', getChatHistory);
router.delete('/workspace/:workspaceId/clear', clearChatHistory);
router.get('/session/:chatId', getChatSession);
router.delete('/session/:chatId', deleteChatSession);

export default router;
