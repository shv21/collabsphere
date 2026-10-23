import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { checkProjectAccess } from '../middleware/projectAuth.js';
import { uploadMiddleware } from '../middleware/upload.js';

import {
  getMyProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  enablePublicShare,
  disablePublicShare,
} from '../controllers/projectController.js';

import { addMember, removeMember } from '../controllers/memberController.js';
import { getProjectNotes, createNote } from '../controllers/noteController.js';
import { getProjectFiles, uploadFile } from '../controllers/fileController.js';
import { getProjectActivity, getProjectAnalytics } from '../controllers/activityController.js';

const router = Router();

// All project routes require authentication
router.use(protect);

// Projects collection
router.get('/', getMyProjects);
router.post('/', createProject);

// Single project
router.get('/:projectId', checkProjectAccess('viewer'), getProjectById);
router.patch('/:projectId', checkProjectAccess('admin'), updateProject);
router.delete('/:projectId', checkProjectAccess('owner'), deleteProject);

// Public share toggle
router.post('/:projectId/share', checkProjectAccess('owner'), enablePublicShare);
router.delete('/:projectId/share', checkProjectAccess('owner'), disablePublicShare);

// Members
router.post('/:projectId/members', checkProjectAccess('admin'), addMember);
router.delete('/:projectId/members/:userId', checkProjectAccess('admin'), removeMember);

// Notes nested routes
router.get('/:projectId/notes', checkProjectAccess('viewer'), getProjectNotes);
router.post('/:projectId/notes', checkProjectAccess('member'), createNote);

// Files nested routes
router.get('/:projectId/files', checkProjectAccess('viewer'), getProjectFiles);
router.post(
  '/:projectId/files',
  checkProjectAccess('member'),
  uploadMiddleware.single('file'),
  uploadFile
);

// Activity & Analytics
router.get('/:projectId/activity', checkProjectAccess('viewer'), getProjectActivity);
router.get('/:projectId/analytics', checkProjectAccess('viewer'), getProjectAnalytics);

export default router;
