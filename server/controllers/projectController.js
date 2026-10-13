import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Project } from '../models/Project.js';
import { Note } from '../models/Note.js';
import { File } from '../models/File.js';
import { Activity } from '../models/Activity.js';
import { logActivity } from '../services/activityService.js';

// @desc    Get all projects for the authenticated user
// @route   GET /api/projects
export const getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find projects where user is owner OR listed in members
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email');

    // Attach current user's specific role to each returned project
    const formatted = projects.map((proj) => {
      let role = 'member';
      if (proj.owner._id.toString() === userId.toString()) {
        role = 'owner';
      } else {
        const mem = proj.members.find(
          (m) => m.user.toString() === userId.toString()
        );
        if (mem) role = mem.role;
      }

      return {
        _id: proj._id,
        name: proj.name,
        description: proj.description,
        isPublic: proj.isPublic,
        notesCount: proj.notesCount,
        filesCount: proj.filesCount,
        membersCount: proj.members.length,
        currentUserRole: role,
        createdAt: proj.createdAt,
        updatedAt: proj.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      projects: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required and must be at least 3 characters.',
      });
    }

    const shareToken = isPublic ? crypto.randomBytes(24).toString('hex') : undefined;

    const project = await Project.create({
      name: name.trim(),
      description: (description || '').trim(),
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          addedAt: new Date(),
        },
      ],
      isPublic: !!isPublic,
      shareToken,
    });

    await logActivity({
      projectId: project._id,
      actorId: req.user._id,
      type: 'project_created',
      message: `created project "${project.name}"`,
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:projectId
export const getProjectById = async (req, res, next) => {
  try {
    // req.project and req.userRole are attached by checkProjectAccess middleware
    const project = req.project;

    // Recalculate real counts
    const [notesCount, filesCount] = await Promise.all([
      Note.countDocuments({ project: project._id }),
      File.countDocuments({ project: project._id }),
    ]);

    project.notesCount = notesCount;
    project.filesCount = filesCount;
    await project.save();

    res.status(200).json({
      success: true,
      currentUserRole: req.userRole,
      currentUserId: req.user._id,
      project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project metadata (name, description, readme)
// @route   PATCH /api/projects/:projectId
export const updateProject = async (req, res, next) => {
  try {
    const { name, description, readme } = req.body;
    const project = req.project;

    let changesMade = false;

    if (name && name.trim().length >= 3) {
      project.name = name.trim();
      changesMade = true;
    }
    if (description !== undefined) {
      project.description = description.trim();
      changesMade = true;
    }
    if (readme !== undefined) {
      project.readme = readme;
      changesMade = true;
      await logActivity({
        projectId: project._id,
        actorId: req.user._id,
        type: 'readme_saved',
        message: 'updated project README documentation',
      });
    }

    if (changesMade) {
      await project.save();
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project and cascade delete all its resources
// @route   DELETE /api/projects/:projectId
export const deleteProject = async (req, res, next) => {
  try {
    const project = req.project;

    // Only owner can delete project
    if (req.userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project.',
      });
    }

    // Unlink any stored files on disk
    const files = await File.find({ project: project._id });
    for (const f of files) {
      if (f.path && fs.existsSync(f.path)) {
        try {
          fs.unlinkSync(f.path);
        } catch (e) {
          console.warn('[Storage] Failed to unlink file during deletion:', f.path);
        }
      }
    }

    // Cascade delete DB collections
    await Promise.all([
      Note.deleteMany({ project: project._id }),
      File.deleteMany({ project: project._id }),
      Activity.deleteMany({ project: project._id }),
      Project.findByIdAndDelete(project._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Project and all associated resources permanently deleted.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enable public share token
// @route   POST /api/projects/:projectId/share
export const enablePublicShare = async (req, res, next) => {
  try {
    if (req.userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can configure public sharing.',
      });
    }

    const project = req.project;
    if (!project.shareToken) {
      project.shareToken = crypto.randomBytes(24).toString('hex');
    }
    project.isPublic = true;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Public sharing enabled.',
      shareToken: project.shareToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Disable public share link and revoke token
// @route   DELETE /api/projects/:projectId/share
export const disablePublicShare = async (req, res, next) => {
  try {
    if (req.userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can configure public sharing.',
      });
    }

    const project = req.project;
    project.isPublic = false;
    project.shareToken = null;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Public sharing disabled and token revoked.',
    });
  } catch (err) {
    next(err);
  }
};
