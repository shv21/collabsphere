import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getFileById, downloadFile, deleteFile } from '../controllers/fileController.js';

const router = Router();

router.use(protect);

router.get('/:fileId', getFileById);
router.get('/:fileId/download', downloadFile);
router.delete('/:fileId', deleteFile);

export default router;
