import {
  explainCode,
  generateDocs,
  generateReadme,
  improveNote,
} from '../services/geminiService.js';

const MAX_PAYLOAD_CHARS = 30000;

// @desc    Explain code snippet
// @route   POST /api/gemini/explain
export const handleExplainCode = async (req, res, next) => {
  try {
    const { code, filename, language, context } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide code content to explain.',
      });
    }

    if (code.length > MAX_PAYLOAD_CHARS) {
      return res.status(400).json({
        success: false,
        message: `Code snippet exceeds maximum supported length of ${MAX_PAYLOAD_CHARS} characters.`,
      });
    }

    const explanation = await explainCode({
      code: code.trim(),
      filename,
      language,
      context,
    });

    res.status(200).json({
      success: true,
      explanation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate code documentation
// @route   POST /api/gemini/docs
export const handleGenerateDocs = async (req, res, next) => {
  try {
    const { code, language, title } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide code to document.',
      });
    }

    if (code.length > MAX_PAYLOAD_CHARS) {
      return res.status(400).json({
        success: false,
        message: 'Code payload exceeds limit.',
      });
    }

    const documentation = await generateDocs({
      code: code.trim(),
      language,
      title,
    });

    res.status(200).json({
      success: true,
      documentation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate structured README
// @route   POST /api/gemini/readme
export const handleGenerateReadme = async (req, res, next) => {
  try {
    const { projectName, description, features, techStack, installSteps, codeContext } = req.body;

    if (!projectName || projectName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project name is required to generate README.',
      });
    }

    const readme = await generateReadme({
      projectName: projectName.trim(),
      description,
      features,
      techStack,
      installSteps,
      codeContext,
    });

    res.status(200).json({
      success: true,
      readme,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Suggest improvements to notes
// @route   POST /api/gemini/improve
export const handleImproveNote = async (req, res, next) => {
  try {
    const { content, title } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide note content to improve.',
      });
    }

    if (content.length > MAX_PAYLOAD_CHARS) {
      return res.status(400).json({
        success: false,
        message: 'Note content exceeds character limit.',
      });
    }

    const improvedContent = await improveNote({
      content: content.trim(),
      title,
    });

    res.status(200).json({
      success: true,
      improvedContent,
    });
  } catch (err) {
    next(err);
  }
};
