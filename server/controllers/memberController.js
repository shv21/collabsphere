import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { logActivity } from '../services/activityService.js';
import { isValidObjectId } from '../utils/validators.js';

// @desc    Add member to project by email
// @route   POST /api/projects/:projectId/members
export const addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const project = req.project;

    // Check authorization: only owner or admin can add members
    if (req.userRole !== 'owner' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project owners and admins can invite new members.',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the user email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userToAdd = await User.findOne({ email: normalizedEmail });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: `No registered CollabSphere account found with email "${normalizedEmail}". The developer must first register.`,
      });
    }

    // Check if already in project
    const alreadyMember = project.members.some(
      (m) => m.user && (m.user._id ? m.user._id.toString() === userToAdd._id.toString() : m.user.toString() === userToAdd._id.toString())
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project.',
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'member';

    project.members.push({
      user: userToAdd._id,
      role: assignedRole,
      addedAt: new Date(),
    });

    await project.save();

    await logActivity({
      projectId: project._id,
      actorId: req.user._id,
      type: 'member_added',
      message: `added ${userToAdd.name} (${userToAdd.email}) as ${assignedRole}`,
      metadata: { targetUserId: userToAdd._id, role: assignedRole },
    });

    res.status(201).json({
      success: true,
      message: `Added ${userToAdd.name} to the project.`,
      member: {
        user: {
          _id: userToAdd._id,
          name: userToAdd.name,
          email: userToAdd.email,
        },
        role: assignedRole,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:userId
export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member identifier.',
      });
    }

    // Check authorization: owner or admin
    if (req.userRole !== 'owner' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project owners and admins can remove members.',
      });
    }

    // Cannot remove project owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner from the project.',
      });
    }

    const memberIndex = project.members.findIndex(
      (m) => m.user && (m.user._id ? m.user._id.toString() === userId : m.user.toString() === userId)
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this project.',
      });
    }

    // If requester is admin (not owner), they cannot remove another admin
    if (req.userRole === 'admin' && project.members[memberIndex].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can remove other admins.',
      });
    }

    const removedEntry = project.members[memberIndex];
    project.members.splice(memberIndex, 1);
    await project.save();

    await logActivity({
      projectId: project._id,
      actorId: req.user._id,
      type: 'member_removed',
      message: `removed a member from the project`,
      metadata: { removedUserId: userId },
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from project successfully.',
    });
  } catch (err) {
    next(err);
  }
};
