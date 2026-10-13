# CollabSphere — Production-Quality Full-Stack Developer Collaboration Platform

> An independently designed, focused workspace for engineering teams and developers to organize projects, collaborate with team members, document architectural decisions, share code files, and leverage Google Gemini AI to analyze code and generate structured documentation.

---

## 1. Project Purpose & Vision

Modern engineering projects frequently struggle with fragmented technical context spread across disconnected chat channels, issue trackers, and personal scratchpads. **CollabSphere** unifies:
1. **Lightweight Project Management**: Workspace-centric project organization with strict role-based access control (Owner, Admin, Member).
2. **Markdown Technical Documentation**: Living technical specifications, architectural decision records (ADRs), and notes with safe live Markdown rendering.
3. **Code & File Storage**: Upload and preview source files (JavaScript, TypeScript, Python, JSON, Markdown, HTML, CSS, images) with syntax display and download controls.
4. **Pragmatic Gemini AI Tools**: Beginner-friendly yet technically precise code explanations, JSDoc/Markdown documentation generators, automated structured README creation, and note improvement suggestions.
5. **Real Activity Audit & Contribution Analytics**: Event-driven audit trail and genuine member contribution tracking derived entirely from verified database events.
6. **Public Read-Only Sharing**: Cryptographically unguessable share tokens allowing external stakeholders to view sanitized project documentation without leaking private notes, member emails, or internal files.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 with Vite 6
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS with custom developer-tool design system (Charcoal darks, high-contrast typography, focus rings)
- **Icons**: Lucide React
- **Markdown**: Custom safe AST block & inline renderer with code block copy utilities and table formatting
- **HTTP Client**: Native Fetch API with centralized request wrapper, token persistence, and cookie handling

### Backend
- **Runtime**: Node.js v20+ LTS
- **Framework**: Express.js
- **Database & ODM**: MongoDB Atlas / Mongoose 8 (with automated zero-config in-memory fallback for offline local execution)
- **Authentication**: JWT (`jsonwebtoken`) with support for Bearer headers and HttpOnly cookies; secure password hashing with `bcryptjs`
- **File Uploads**: `multer` with strict MIME/extension whitelisting, randomized safe filenames, and path traversal guards
- **AI Integration**: Official Google Generative AI SDK (`@google/generative-ai` with configurable models such as `gemini-1.5-flash`)
- **Security & Reliability**: `helmet` security headers, `express-rate-limit` (auth, AI, and API limiters), CORS origin verification, and centralized error handling middleware

---

## 3. Architecture & Project Structure

CollabSphere is designed with a clear separation of concerns between client and server:

```
collabsphere/
├── client/                     # Frontend Vite + React SPA
│   ├── public/                 # Static assets and icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Badge, Card, Alert, EmptyState, LoadingSpinner
│   │   │   └── layout/         # Navbar, Sidebar, AppLayout
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── features/
│   │   │   ├── ai/             # AIToolsTab (README generator & Code documenter)
│   │   │   ├── activity/       # ActivityTab (Audit timeline & contribution analytics)
│   │   │   ├── files/          # FilesTab (Explorer, code preview, download)
│   │   │   ├── notes/          # NotesTab (Markdown editor, live preview, AI actions)
│   │   │   └── projects/       # OverviewTab, MembersTab
│   │   ├── pages/              # LoginPage, RegisterPage, DashboardPage, NewProjectPage, ProjectWorkspacePage, PublicSharePage, NotFoundPage
│   │   ├── services/           # api.js (unified fetch client)
│   │   ├── App.jsx             # React Router routing definition
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind design tokens, typography, and scrollbars
│   ├── package.json
│   ├── tailwind.config.js      # Palette and typography tokens
│   └── vite.config.js          # Dev server and API proxy configuration
│
├── server/                     # Backend Express.js REST API
│   ├── config/
│   │   └── db.js               # Mongoose connection with automated memory fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, login, logout, getMe
│   │   ├── projectController.js# Project CRUD, cascade delete, public share token toggle
│   │   ├── memberController.js # Add by email, role assignments, remove member
│   │   ├── noteController.js   # Notes CRUD and project authorization
│   │   ├── fileController.js   # File upload, code preview reading, download, delete
│   │   ├── geminiController.js # AI endpoints: explain, docs, readme, improve
│   │   └── activityController.js# Real audit timeline and member analytics
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & req.user attachment
│   │   ├── projectAuth.js      # Role-based access control (owner > admin > member)
│   │   ├── errorHandler.js     # Centralized status codes and error JSON
│   │   ├── rateLimiter.js      # Auth, AI, and general endpoint rate limits
│   │   └── upload.js           # Multer file validation and safe disk storage
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt pre-save hook
│   │   ├── Project.js          # Project schema with members array, roles, shareToken
│   │   ├── Note.js             # Markdown note schema
│   │   ├── File.js             # Uploaded file metadata schema
│   │   └── Activity.js         # Real event audit logging schema
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── projectRoutes.js    # /api/projects
│   │   ├── noteRoutes.js       # /api/notes
│   │   ├── fileRoutes.js       # /api/files
│   │   ├── geminiRoutes.js     # /api/gemini
│   │   └── publicRoutes.js     # /api/public/share/:shareToken
│   ├── services/
│   │   ├── activityService.js  # Event logger and project timestamp touch
│   │   └── geminiService.js    # Google GenAI prompt engineering and SDK calls
│   ├── utils/
│   │   ├── tokenUtils.js       # JWT generation and cookie helpers
│   │   └── validators.js       # ObjectId checks and file type filters
│   ├── test/
│   │   └── integration.test.js # End-to-end automated API verification suite
│   ├── uploads/                # Local file storage directory
│   ├── package.json
│   ├── server.js               # Express application entry point
│   ├── .env                    # Local environment variables
│   └── .env.example
│
├── .gitignore
├── .env.example
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended).
- **npm**: v9.0.0 or higher.
- *(Optional)* **MongoDB Atlas cluster URI**: If omitted, CollabSphere automatically initializes an in-memory MongoDB instance for seamless local testing.
- *(Optional)* **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/). If omitted, all core platform features (auth, projects, notes, files, sharing) work uninterrupted, and AI endpoints return informative configuration instructions.

---

## 5. Installation and Setup

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/collabsphere.git
cd collabsphere
```

### Step 2: Install dependencies
Install dependencies for both backend and frontend:
```bash
# Using the root convenience script
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/collabsphere
JWT_SECRET=your_jwt_secret_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
UPLOAD_STORAGE_TYPE=local
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

---

## 6. Running the Application

### Development Mode

Run the backend and frontend in separate terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Starts backend API on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Starts Vite development server on http://localhost:5173
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 7. Running the Automated Test Suite

A comprehensive integration test suite verifies:
- Health check
- User registration and authentication
- Token verification via `/api/auth/me`
- Project creation with metadata
- Backend authorization blocking non-members (403 Forbidden)
- Adding registered members by email
- Member role enforcement
- Notes CRUD and Markdown updates
- File uploads, text code detection, and disk reading
- File download endpoints
- Strict sanitization on public read-only share routes
- Real activity timeline and member contribution analytics

To execute the test suite:
```bash
cd server
npm test
```

---

## 8. API Overview

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (name, email, password) | No |
| `POST` | `/api/auth/login` | Login with credentials | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### Projects
| Method | Endpoint | Description | Auth Required | Role Required |
|---|---|---|---|---|
| `GET` | `/api/projects` | List user's projects with real counts | Yes | Any |
| `POST` | `/api/projects` | Create a new project | Yes | Any |
| `GET` | `/api/projects/:projectId` | Get project workspace details | Yes | Member |
| `PATCH` | `/api/projects/:projectId` | Update project metadata or README | Yes | Admin / Owner |
| `DELETE` | `/api/projects/:projectId` | Delete project and cascade resources | Yes | Owner |
| `POST` | `/api/projects/:projectId/share` | Enable public sharing (generate token) | Yes | Owner |
| `DELETE` | `/api/projects/:projectId/share` | Disable public sharing (revoke token) | Yes | Owner |

### Members
| Method | Endpoint | Description | Auth Required | Role Required |
|---|---|---|---|---|
| `POST` | `/api/projects/:projectId/members` | Add member by registered email | Yes | Admin / Owner |
| `DELETE` | `/api/projects/:projectId/members/:userId` | Remove member from project | Yes | Admin / Owner |

### Notes
| Method | Endpoint | Description | Auth Required | Role Required |
|---|---|---|---|---|
| `GET` | `/api/projects/:projectId/notes` | List notes for project | Yes | Member |
| `POST` | `/api/projects/:projectId/notes` | Create Markdown note | Yes | Member |
| `GET` | `/api/notes/:noteId` | Get single note content | Yes | Member |
| `PATCH` | `/api/notes/:noteId` | Update note title or Markdown | Yes | Member |
| `DELETE` | `/api/notes/:noteId` | Delete note | Yes | Member |

### Files & Code Preview
| Method | Endpoint | Description | Auth Required | Role Required |
|---|---|---|---|---|
| `GET` | `/api/projects/:projectId/files` | List uploaded files | Yes | Member |
| `POST` | `/api/projects/:projectId/files` | Upload supported file (multipart) | Yes | Member |
| `GET` | `/api/files/:fileId` | Get file metadata & code content | Yes | Member |
| `GET` | `/api/files/:fileId/download` | Download physical file | Yes | Member |
| `DELETE` | `/api/files/:fileId` | Delete file from storage & DB | Yes | Member |

### Google Gemini AI
| Method | Endpoint | Description | Auth Required | Rate Limited |
|---|---|---|---|---|
| `POST` | `/api/gemini/explain` | Explain code snippet or file | Yes | Yes (40 / 15m) |
| `POST` | `/api/gemini/docs` | Generate technical documentation | Yes | Yes (40 / 15m) |
| `POST` | `/api/gemini/readme` | Generate structured README.md | Yes | Yes (40 / 15m) |
| `POST` | `/api/gemini/improve` | Suggest Markdown note improvements | Yes | Yes (40 / 15m) |

### Activity & Public Sharing
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/activity` | Fetch real event audit trail | Yes (Member) |
| `GET` | `/api/projects/:projectId/analytics` | Fetch real member contribution summary | Yes (Member) |
| `GET` | `/api/public/share/:shareToken` | Public read-only project documentation | No |

---

## 9. Security Considerations

1. **Backend Authorization Enforcement**: Permissions are validated in middleware on the Express server (`checkProjectAccess`), not merely hidden on the frontend. Guessing IDs for unauthorized projects returns 403 or 404.
2. **Password Security**: Passwords are salted and hashed with `bcryptjs` (work factor 10) in a Mongoose pre-save hook. Password fields use `select: false` to avoid accidental exposure in queries.
3. **File Upload Hardening**:
   - Strictly whitelisted file extensions and blocked sensitive names (`.env`, `.git`, `id_rsa`).
   - Server-enforced file size limits (10MB max).
   - Random 32-character hexadecimal storage names prevent collisions and path traversal attacks.
   - Uploaded files are served with non-executable MIME types and safe headers.
4. **Public Data Sanitization**: Public share routes project strictly public metadata (`name`, `description`, `readme`, `updatedAt`). Member emails, user IDs, internal activity logs, and private code files are never returned.
5. **Rate Limiting**: Defends against brute-force credential stuffing (`/api/auth/*`), denial of service, and excessive AI token consumption (`/api/gemini/*`).
6. **Gemini Key Isolation**: The Gemini API key remains strictly on the server and is never passed to or exposed in client bundles.

---

## 10. Known Limitations

- **Cloud Storage**: In local development, files are stored on disk under `server/uploads/`. For production deployments spanning multi-instance containers, configure an S3-compatible or Cloudinary storage provider as noted in `.env.example`.
- **Text File Preview Size**: Text previews for uploaded code files are capped at 500KB to ensure fast browser rendering. Larger files must be downloaded locally.
- **AI Token Quotas**: AI requests depend on Google AI Studio quota limits for the configured model.

---

## 11. Production Deployment Guidelines

1. **Build Frontend**:
   ```bash
   cd client
   npm run build
   # Outputs optimized static bundle into client/dist/
   ```
2. **Serve with Reverse Proxy or CDN**:
   - Host `client/dist/` on Vercel, Netlify, or Nginx.
   - Host `server/` on Node.js runtime (e.g., Render, Railway, AWS ECS).
   - Configure `CLIENT_URL` in `server/.env` to the production domain.
3. **Database**:
   - Configure a production MongoDB Atlas cluster URI with connection pooling and IP whitelisting.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
