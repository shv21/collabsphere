import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [200, 'Note title cannot exceed 200 characters'],
      default: 'Untitled Note',
    },
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ project: 1, updatedAt: -1 });

export const Note = mongoose.model('Note', noteSchema);
export default Note;
