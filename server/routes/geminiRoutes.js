import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import {
  handleExplainCode,
  handleGenerateDocs,
  handleGenerateReadme,
  handleImproveNote,
} from '../controllers/geminiController.js';

const router = Router();

// Protect all AI endpoints and apply rate limiter
router.use(protect);
router.use(aiRateLimiter);

router.post('/explain', handleExplainCode);
router.post('/docs', handleGenerateDocs);
router.post('/readme', handleGenerateReadme);
router.post('/improve', handleImproveNote);

export default router;
