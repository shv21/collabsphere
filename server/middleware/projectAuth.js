import { Project } from '../models/Project.js';
import { isValidObjectId } from '../utils/validators.js';

export const checkProjectAccess = (requiredRole = 'member') => {
  return async (req, res, next) => {
    const projectId = req.params.projectId || req.body.projectId;

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project identifier.',
      });
    }

    try {
      const project = await Project.findById(projectId).populate('members.user', 'name email');
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.',
        });
      }

      const userIdStr = req.user._id.toString();

      // Check if user is owner
      if (project.owner.toString() === userIdStr) {
        req.project = project;
        req.userRole = 'owner';
        return next();
      }

      // Check member list
      const memberEntry = project.members.find(
        (m) => m.user && (m.user._id ? m.user._id.toString() === userIdStr : m.user.toString() === userIdStr)
      );

      if (!memberEntry) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }

      const role = memberEntry.role || 'member';
      req.project = project;
      req.userRole = role;

      // Role check: 'owner' > 'admin' > 'member'
      if (requiredRole === 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Action restricted to project owner only.',
        });
      }

      if (requiredRole === 'admin' && role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Action restricted to project admins or owner.',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
