import mongoose from 'mongoose';

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

export const isAllowedCodeFile = (extension) => {
  const allowed = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.htm',
    '.css', '.scss', '.json', '.md', '.markdown', '.txt',
    '.sh', '.yaml', '.yml', '.xml', '.sql', '.c', '.cpp', '.java', '.go', '.rs'
  ];
  return allowed.includes(extension.toLowerCase());
};

export const isAllowedImageFile = (extension) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  return allowed.includes(extension.toLowerCase());
};
