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
      const project = await Project.findById(projectId)
        .populate('members.user', 'name email')
        .populate('owner', 'name email');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.',
        });
      }

      const userIdStr = req.user._id.toString();
      const ownerIdStr = project.owner?._id
        ? project.owner._id.toString()
        : project.owner?.toString();

      // Check if user is owner
      if (ownerIdStr === userIdStr) {
        req.project = project;
        req.userRole = 'owner';
        return next();
      }

      // Check member list
      const memberEntry = project.members.find(
        (m) => m.user && (m.user._id ? m.user._id.toString() === userIdStr : m.user.toString() === userIdStr)
      );

      let role = null;
      if (memberEntry) {
        role = memberEntry.role || 'member';
      } else if (project.isPublic) {
        role = 'viewer';
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }

      req.project = project;
      req.userRole = role;

      const ROLE_HIERARCHY = {
        viewer: 1,
        member: 2,
        admin: 3,
        owner: 4,
      };

      const userLevel = ROLE_HIERARCHY[role] || 0;
      const requiredLevel = ROLE_HIERARCHY[requiredRole] || 2;

      if (userLevel < requiredLevel) {
        const messages = {
          owner: 'Action restricted to project owner only.',
          admin: 'Action restricted to project admins or owner.',
          member: 'Action restricted to project members only.',
          viewer: 'Access denied.',
        };
        return res.status(403).json({
          success: false,
          message: messages[requiredRole] || 'Access denied.',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
