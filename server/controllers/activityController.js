import { Activity } from '../models/Activity.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

// @desc    Get project activity timeline
// @route   GET /api/projects/:projectId/activity
export const getProjectActivity = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    const activities = await Activity.find({ project: projectId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actor', 'name email');

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get real member contribution analytics for project
// @route   GET /api/projects/:projectId/analytics
export const getProjectAnalytics = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const project = req.project;

    // Fetch all activities for this project
    const activities = await Activity.find({ project: projectId }).populate('actor', 'name email');

    // Aggregate contributions per member
    const memberMap = new Map();

    // Initialize with all current project members
    for (const m of project.members) {
      if (m.user) {
        const uId = m.user._id ? m.user._id.toString() : m.user.toString();
        const uName = m.user.name || 'Member';
        memberMap.set(uId, {
          userId: uId,
          userName: uName,
          role: m.role,
          totalActions: 0,
          notesCount: 0,
          filesCount: 0,
        });
      }
    }

    // Count real actions from activities
    for (const act of activities) {
      if (!act.actor) continue;
      const actorId = act.actor._id.toString();

      if (!memberMap.has(actorId)) {
        memberMap.set(actorId, {
          userId: actorId,
          userName: act.actor.name,
          role: 'former_member',
          totalActions: 0,
          notesCount: 0,
          filesCount: 0,
        });
      }

      const stats = memberMap.get(actorId);
      stats.totalActions += 1;

      if (act.type.startsWith('note_')) {
        stats.notesCount += 1;
      } else if (act.type.startsWith('file_')) {
        stats.filesCount += 1;
      }
    }

    const memberContributions = Array.from(memberMap.values()).sort(
      (a, b) => b.totalActions - a.totalActions
    );

    res.status(200).json({
      success: true,
      analytics: {
        totalEvents: activities.length,
        memberContributions,
      },
    });
  } catch (err) {
    next(err);
  }
};
