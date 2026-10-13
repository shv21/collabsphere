import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getNoteById, updateNote, deleteNote } from '../controllers/noteController.js';

const router = Router();

router.use(protect);

router.get('/:noteId', getNoteById);
router.patch('/:noteId', updateNote);
router.delete('/:noteId', deleteNote);

export default router;
