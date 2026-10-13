import { GoogleGenerativeAI } from '@google/generative-ai';

let genAIInstance = null;

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your server/.env file.');
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
};

const getModel = () => {
  const client = getGenAIClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return client.getGenerativeModel({ model: modelName });
};

// 1. Explain Code
export const explainCode = async ({ code, filename, language, context }) => {
  const model = getModel();

  const prompt = `You are a senior staff software engineer explaining code to a fellow developer.
Be clear, beginner-friendly, yet technically precise.

Filename: ${filename || 'Code Snippet'}
Language: ${language || 'Auto-detect'}
${context ? `Context: ${context}` : ''}

Code to explain:
\`\`\`${language || ''}
${code}
\`\`\`

Provide a well-structured Markdown response:
1. **Summary**: What this code does in 2-3 sentences.
2. **Key Components & Logic**: Breakdown of core functions, flow, and architecture.
3. **Important Nuances**: Performance, edge cases, error handling, or security aspects.
4. **Suggestions**: 1-2 practical ways it could be made more robust or idiomatic.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// 2. Generate Code Documentation
export const generateDocs = async ({ code, language, title }) => {
  const model = getModel();

  const prompt = `You are a technical documentation specialist.
Generate comprehensive, professional developer documentation in Markdown format for the following code snippet.

${title ? `Module/Component: ${title}` : ''}
Language: ${language || 'Auto-detect'}

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Include:
- **Module Overview**
- **Functions / Classes / Interfaces Specification** (Parameters, return types, exceptions)
- **Usage Example** with code snippet
- **Dependencies or Environment Requirements**`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// 3. Generate Structured README.md
export const generateReadme = async ({
  projectName,
  description,
  features,
  techStack,
  installSteps,
  codeContext,
}) => {
  const model = getModel();

  const prompt = `You are an expert open-source maintainer and engineering lead.
Generate a high-quality, comprehensive, production-grade \`README.md\` file in Markdown for a developer project.

Project Name: ${projectName}
Project Description: ${description || 'Developer collaboration workspace'}
Key Features: ${features || 'Project workspaces, Markdown notes, File sharing, AI assistant'}
Technology Stack: ${techStack || 'Node.js, Express, React, Vite, MongoDB'}
Installation & Run Instructions: ${installSteps || 'npm install && npm run dev'}
${codeContext ? `Additional Code/Architecture Context:\n${codeContext}` : ''}

CRITICAL RULES:
- Do NOT fabricate features, commands, or environment variables that are unrelated to the provided information.
- Provide clean, professional Markdown with headers, code blocks, lists, and tables where suitable.
- Generate standard sections:
  1. # ${projectName} (with clean one-line badge-style description)
  2. ## Overview
  3. ## Key Features
  4. ## Tech Stack
  5. ## Prerequisites
  6. ## Installation & Setup
  7. ## Environment Variables
  8. ## Project Structure
  9. ## Usage & Workflow
  10. ## Contributing
  11. ## License (MIT by default)`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// 4. Suggest Improvements to Notes/Documentation
export const improveNote = async ({ content, title }) => {
  const model = getModel();

  const prompt = `You are a technical editor and architect.
Improve the clarity, precision, formatting, and technical depth of the following developer note.
Keep the author's intent intact, but fix ambiguity, improve formatting, add structured headings or code blocks where appropriate, and correct grammar.

Note Title: ${title || 'Technical Note'}

Original Note Content:
${content}

Return the complete improved Markdown note content directly, ready to replace the draft.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
