import { Router } from 'express';
import {
  upload, uploadDocument, getDocuments,
  getDocument, deleteDocument, reindexDocument,
} from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.post('/workspace/:workspaceId/upload', upload.single('file'), uploadDocument);
router.get('/workspace/:workspaceId', getDocuments);
router.get('/:docId', getDocument);
router.delete('/:docId', deleteDocument);
router.post('/:docId/reindex', reindexDocument);

export default router;
