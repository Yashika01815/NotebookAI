import { Router } from 'express';
import {
  getWorkspaces, getWorkspace, createWorkspace,
  updateWorkspace, deleteWorkspace, getWorkspaceStats,
} from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);
router.get('/:id/stats', getWorkspaceStats);

export default router;
