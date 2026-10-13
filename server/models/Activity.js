import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'member_added',
        'member_removed',
        'note_created',
        'note_updated',
        'note_deleted',
        'file_uploaded',
        'file_deleted',
        'readme_saved',
      ],
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activitySchema.index({ project: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
