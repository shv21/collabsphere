import fs from 'fs';
import path from 'path';
import { File } from '../models/File.js';
import { Project } from '../models/Project.js';
import { logActivity } from '../services/activityService.js';
import { isValidObjectId, isAllowedCodeFile, isAllowedImageFile } from '../utils/validators.js';

// Helper to check user membership in file's project
const verifyFileProjectAccess = async (fileId, userId, allowViewer = false) => {
  if (!isValidObjectId(fileId)) return null;

  const file = await File.findById(fileId).populate('project');
  if (!file || !file.project) return null;

  const project = file.project;
  const userIdStr = userId.toString();

  const isOwner = project.owner.toString() === userIdStr;
  const isMember = project.members.some(
    (m) => m.user && (m.user._id ? m.user._id.toString() === userIdStr : m.user.toString() === userIdStr)
  );

  if (!isOwner && !isMember && !(allowViewer && project.isPublic)) return null;

  return { file, project };
};

// @desc    Get all files for a project
// @route   GET /api/projects/:projectId/files
export const getProjectFiles = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    const files = await File.find({ project: projectId })
      .sort({ createdAt: -1 })
      .populate('uploader', 'name email');

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload a file to a project
// @route   POST /api/projects/:projectId/files
export const uploadFile = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded.',
      });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const isText = isAllowedCodeFile(ext);
    const isImage = isAllowedImageFile(ext);

    const fileDoc = await File.create({
      project: projectId,
      uploader: req.user._id,
      originalName: originalname,
      storedName: filename,
      mimeType: mimetype,
      size,
      path: filePath,
      url: `/uploads/${filename}`,
      extension: ext,
      isText,
      isImage,
    });

    await Project.findByIdAndUpdate(projectId, { $inc: { filesCount: 1 } });

    await logActivity({
      projectId,
      actorId: req.user._id,
      type: 'file_uploaded',
      message: `uploaded file "${originalname}"`,
      metadata: { fileId: fileDoc._id, targetTitle: originalname, size },
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      file: fileDoc,
    });
  } catch (err) {
    // Clean up uploaded file if DB operation fails
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // ignore
      }
    }
    next(err);
  }
};

// @desc    Get file details and text preview content
// @route   GET /api/files/:fileId
export const getFileById = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const result = await verifyFileProjectAccess(fileId, req.user._id, true);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied.',
      });
    }

    const { file } = result;
    let content = '';

    // If text file and exists, read content (up to 500KB)
    if (file.isText && file.path && fs.existsSync(file.path)) {
      try {
        const stats = fs.statSync(file.path);
        if (stats.size <= 500 * 1024) {
          content = fs.readFileSync(file.path, 'utf-8');
        } else {
          content = '// File exceeds 500KB preview limit. Please download to view full contents.';
        }
      } catch (readErr) {
        content = '// Failed to read file contents from disk.';
      }
    }

    res.status(200).json({
      success: true,
      file,
      content,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download file
// @route   GET /api/files/:fileId/download
export const downloadFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const result = await verifyFileProjectAccess(fileId, req.user._id, true);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied.',
      });
    }

    const { file } = result;

    if (!file.path || !fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on storage server.',
      });
    }

    res.download(file.path, file.originalName);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:fileId
export const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const result = await verifyFileProjectAccess(fileId, req.user._id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied.',
      });
    }

    const { file, project } = result;
    const originalName = file.originalName;

    // Unlink physical file
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.warn('[Storage] Could not delete physical file:', unlinkErr.message);
      }
    }

    await File.findByIdAndDelete(fileId);
    await Project.findByIdAndUpdate(project._id, { $inc: { filesCount: -1 } });

    await logActivity({
      projectId: project._id,
      actorId: req.user._id,
      type: 'file_deleted',
      message: `deleted file "${originalName}"`,
      metadata: { targetTitle: originalName },
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
