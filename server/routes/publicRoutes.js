import { Router } from 'express';
import { Project } from '../models/Project.js';

const router = Router();

// @desc    Get public project documentation by secure share token
// @route   GET /api/public/share/:shareToken
router.get('/share/:shareToken', async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    if (!shareToken || shareToken.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Share token is required.',
      });
    }

    const project = await Project.findOne({
      shareToken: shareToken.trim(),
      isPublic: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Shared project not found or public access has been revoked.',
      });
    }

    // Return strictly sanitized public projection
    res.status(200).json({
      success: true,
      project: {
        name: project.name,
        description: project.description,
        readme: project.readme,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
