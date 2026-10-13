import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.htm',
  '.css', '.scss', '.py', '.md', '.markdown', '.txt',
  '.sql', '.yaml', '.yml', '.xml', '.c', '.cpp', '.h',
  '.java', '.go', '.rs', '.php', '.rb',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf'
]);

// Block sensitive configuration and executable filenames
const BLOCKED_FILENAMES = new Set([
  '.env', '.env.local', '.env.production', 'id_rsa', 'id_ed25519',
  'config.json', 'credentials.json', 'package-lock.json', '.git'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeStoredName = `${Date.now()}-${randomHex}${ext}`;
    cb(null, safeStoredName);
  },
});

const fileFilter = (req, file, cb) => {
  const original = file.originalname.toLowerCase();
  const ext = path.extname(original);

  if (BLOCKED_FILENAMES.has(original) || original.startsWith('.env')) {
    return cb(new Error('Uploading sensitive environment configuration files is strictly forbidden.'), false);
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type "${ext || 'unknown'}" is not supported. Please upload code files, markdown, or standard images.`), false);
  }

  cb(null, true);
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024, // e.g. 10MB
  },
});
