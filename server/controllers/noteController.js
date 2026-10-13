import { Note } from '../models/Note.js';
import { Project } from '../models/Project.js';
import { logActivity } from '../services/activityService.js';
import { isValidObjectId } from '../utils/validators.js';

// Helper to check user membership in note's project
const verifyNoteProjectAccess = async (noteId, userId) => {
  if (!isValidObjectId(noteId)) return null;

  const note = await Note.findById(noteId).populate('project');
  if (!note || !note.project) return null;

  const project = note.project;
  const userIdStr = userId.toString();

  const isOwner = project.owner.toString() === userIdStr;
  const isMember = project.members.some(
    (m) => m.user && (m.user._id ? m.user._id.toString() === userIdStr : m.user.toString() === userIdStr)
  );

  if (!isOwner && !isMember) return null;

  return { note, project };
};

// @desc    Get all notes for a project
// @route   GET /api/projects/:projectId/notes
export const getProjectNotes = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    const notes = await Note.find({ project: projectId })
      .sort({ updatedAt: -1 })
      .populate('author', 'name email');

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new note in a project
// @route   POST /api/projects/:projectId/notes
export const createNote = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const { title, content } = req.body;

    const note = await Note.create({
      project: projectId,
      author: req.user._id,
      title: (title || 'Untitled Note').trim(),
      content: content || '',
    });

    // Update note count on project
    await Project.findByIdAndUpdate(projectId, { $inc: { notesCount: 1 } });

    await logActivity({
      projectId,
      actorId: req.user._id,
      type: 'note_created',
      message: `created note "${note.title}"`,
      metadata: { noteId: note._id, targetTitle: note.title },
    });

    res.status(201).json({
      success: true,
      note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single note by ID
// @route   GET /api/notes/:noteId
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const result = await verifyNoteProjectAccess(noteId, req.user._id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      note: result.note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a note
// @route   PATCH /api/notes/:noteId
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    const result = await verifyNoteProjectAccess(noteId, req.user._id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied.',
      });
    }

    const { note, project } = result;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;

    await note.save();

    await logActivity({
      projectId: project._id,
      actorId: req.user._id,
      type: 'note_updated',
      message: `updated note "${note.title}"`,
      metadata: { noteId: note._id, targetTitle: note.title },
    });

    res.status(200).json({
      success: true,
      note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:noteId
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const result = await verifyNoteProjectAccess(noteId, req.user._id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied.',
      });
    }

    const { note, project } = result;
    const noteTitle = note.title;

    await Note.findByIdAndDelete(noteId);
    await Project.findByIdAndUpdate(project._id, { $inc: { notesCount: -1 } });

    await logActivity({
      projectId: project._id,
      actorId: req.user._id,
      type: 'note_deleted',
      message: `deleted note "${noteTitle}"`,
      metadata: { targetTitle: noteTitle },
    });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
