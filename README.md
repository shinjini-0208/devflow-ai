# ⚡ DevFlow AI — AI-Powered Engineering Workspace & Kanban Platform

DevFlow AI is a full-stack **MERN (MongoDB, Express, React, Node.js)** collaboration platform designed for software engineering teams. It combines multi-project Kanban workflows, role-based access control (RBAC), real-time activity auditing, and approval-gated Generative AI assistance.

## 🚀 Key Features
- **5-Stage Engineering Kanban Board:** Interactive task pipelines across *Backlog*, *To Do*, *In Progress*, *Review*, and *Done* with priority and assignee filtering.
- **Approval-Gated GenAI Copilot:**
  - **Grounded Project Summary:** Analyzes live MongoDB project tasks, completion velocity, and overdue blockers with explicit uncertainty caveats.
  - **Human-in-the-Loop Task Breakdown:** Converts high-level feature ideas into structured subtasks that require explicit user checkbox approval before database persistence.
- **Authentication & RBAC Security:** JWT authentication, `bcrypt` password hashing, and role enforcement across `Admin`, `Manager`, and `Developer` roles.
- **Live Collaboration & Audit Trail:** Task-level discussion comments, automated workspace activity logs, and unread notification alerts.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Custom Responsive CSS Grid/Flexbox
- **Backend:** Node.js, Express.js REST API
- **Database:** MongoDB & Mongoose ODM
- **Security:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS
- **AI Integration:** Google Gemini 2.5 Flash API with deterministic grounded fallback

## 💻 Local Setup Instructions

### 1. Clone & Start Backend
```bash
cd backend
npm install
# Create a .env file with PORT=5000, MONGO_URI, JWT_SECRET, and optional GEMINI_API_KEY
node --watch server.js