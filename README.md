# 🏛️ LexCore Pro

**Full-stack practice management system for ASALAW LP — a Nigerian law firm.**

Built with React 18 + TypeScript + Tailwind CSS (frontend) and Node.js + Express + Prisma + SQLite/PostgreSQL (backend).

---

## 📁 Project Structure

```
LexCorePro/
├── lexcore-backend/          # Express API + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma     # 19-table DB schema
│   │   └── seed.ts           # Realistic seed data
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts       # JWT auth + audit logging
│   │   │   └── upload.ts     # Multer file uploads
│   │   ├── routes/           # 52 API endpoints
│   │   └── server.ts         # Express app entry
│   ├── uploads/              # File storage (gitignored)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── lexcore-frontend/         # Vite + React + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── layout/       # Sidebar, AppLayout
    │   │   └── ui/           # Badge, Modal, Toast, etc.
    │   ├── context/          # AuthContext
    │   ├── pages/            # 16 pages
    │   ├── services/         # Axios API client
    │   ├── types/            # TypeScript interfaces
    │   └── utils/            # Formatters, helpers
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd lexcore-backend

# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env — the defaults work for local dev

# Generate Prisma client
npm run db:generate

# Push schema to SQLite
npm run db:push

# Seed with demo data
npm run db:seed

# Start dev server
npm run dev
```

Backend runs at **http://localhost:3000**

### 2. Frontend Setup

```bash
cd lexcore-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `localhost:3000` automatically.

---


## 🗄️ Database

### Local (SQLite)
```
DATABASE_URL="file:./dev.db"
```
The SQLite file is created at `lexcore-backend/dev.db`.

### Reset and Reseed
```bash
npm run db:reset
```

### View Database (Prisma Studio)
```bash
npm run db:studio
# Opens at http://localhost:5555
```

---

## 🔐 Staff Onboarding Flow

1. New staff visits `/signup` and submits access request
2. Admin sees request in **User Management** → **Pending Requests**
3. Admin clicks **Approve** → system generates 6-char code (e.g. `AB3X9K`)
4. Admin shares code with new staff (copy button provided)
5. Staff visits `/signup` → **Step 2** → enters email, code, and sets password
6. Account activated — staff can now log in

---

## ✨ Features

- **Dashboard** — KPIs, recent matters, upcoming deadlines, court diary, time entries
- **Matters** — Full CRUD, 7 types (Lit/Corp/Prop/Emp/Tax/Fam/Crim), 6-tab detail view
- **Matter Journal** — Real-time updates/notes per matter
- **Time Recording** — Live timer with billing value display, manual entry
- **Billing** — Invoice generation with 7.5% VAT, send/pay workflow
- **Documents** — File upload, categorisation, download
- **Calendar** — Visual monthly calendar with court dates and deadlines
- **Alerts** — Overdue, urgent and due-soon deadlines + court dates
- **Leave Management** — Request/approve/reject workflow
- **Reports** — Charts: revenue by status/type, hours by fee earner, matters by type
- **Staff & HR** — Staff cards with edit and deactivate
- **User Management** — Pending requests, activation codes, session tracking
- **Audit Log** — Every action logged with user, entity and IP
- **Settings** — Firm details, hourly rate, VAT rate, invoice prefix

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, date-fns, Lucide |
| Backend | Node.js, Express, TypeScript, Prisma ORM, bcryptjs, jsonwebtoken, Multer |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT Bearer tokens, session tracking in DB |
| File Uploads | Multer → local disk (swap for S3 in production) |

---

## 📝 License

Private — ASALAW LP internal use only.
