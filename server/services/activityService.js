import { Activity } from '../models/Activity.js';
import { Project } from '../models/Project.js';

export const logActivity = async ({
  projectId,
  actorId,
  type,
  message,
  metadata = {},
}) => {
  try {
    const activity = await Activity.create({
      project: projectId,
      actor: actorId,
      type,
      message,
      metadata,
    });

    // Touch project updatedAt
    await Project.findByIdAndUpdate(projectId, { updatedAt: new Date() });

    return activity;
  } catch (err) {
    console.error('[ActivityService] Failed to log activity:', err.message);
    // Non-fatal, do not throw to break main operations
    return null;
  }
};
