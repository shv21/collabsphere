import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: '',
    },
    extension: {
      type: String,
      lowercase: true,
    },
    isText: {
      type: Boolean,
      default: false,
    },
    isImage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ project: 1, createdAt: -1 });

export const File = mongoose.model('File', fileSchema);
export default File;
