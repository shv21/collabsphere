import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [memberSchema],
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    readme: {
      type: String,
      default: '',
    },
    notesCount: {
      type: Number,
      default: 0,
    },
    filesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ updatedAt: -1 });

export const Project = mongoose.model('Project', projectSchema);
export default Project;
