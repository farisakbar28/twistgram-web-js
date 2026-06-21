# Twistgram Web

Aplikasi media sosial berbasis foto, video, dan teks — dibangun dengan React + Vite + TypeScript.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router 7 |
| HTTP Client | Axios |
| Linting | ESLint 9 (flat config)

## Prasyarat

- Node.js **v18+**
- npm v9+

## Cara Install & Menjalankan

```bash
# 1. Clone repository
git clone <repo-url>
cd twistgram-web-ts

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env sesuai kebutuhan (opsional untuk mode mock)

# 4. Jalankan dev server
npm run dev
# → http://localhost:5173
```

## Perintah Lain

```bash
# Lint
npm run lint

# Format kode
npm run format

# Build production
npm run build

# Preview build
npm run preview
```

## Struktur Folder

```
src/
├── assets/              # Gambar, ikon, font statis
├── components/
│   ├── common/          # Komponen reusable: Button, Input, Avatar, Modal, dll.
│   └── layout/          # Navbar, Sidebar, BottomNav, PageContainer
├── hooks/               # Custom React hooks
├── pages/               # Komponen halaman per route
├── routes/              # Konfigurasi React Router
├── services/
│   ├── index.ts         # Service facade entrypoint
│   ├── api/             # API services (axios-based)
│   └── mock/            # Mock data & service layer
├── styles/              # CSS global & design tokens
├── types/               # TypeScript interfaces
├── utils/               # Helper functions umum
└── features/
    └── auth/            # Auth context, protected route
```

## Roadmap Fase Pengembangan

| Fase | Scope | Status |
|------|-------|--------|
| 0 | Inisialisasi Proyek & Arsitektur Folder | ✅ Done |
| 1 | Design System & Komponen Global | ✅ Done |
| 2 | Modul Autentikasi (UI + Mock) | ✅ Done |
| 3 | Modul Profil & Relasi Sosial | ✅ Done |
| 4 | Modul Feed & Post | ✅ Done |
| 5 | Modul Story | ✅ Done |
| 6 | Modul Pencarian, Chat, Notifikasi | ✅ Done |
| 7 | Integrasi Layer Service ke API Contract | ✅ Done |
| 8 | Quality Gate & Finalisasi Mock (Lint, Types, Tests) | 🔜 

## Referensi

- [SRS & TDD Document](./docs/Twistgram_SRS_TDD.md) — sumber kebenaran tunggal untuk seluruh fitur & skema data
