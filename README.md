# Twistgram Web

Aplikasi media sosial berbasis foto, video, dan teks — dibangun dengan React + Vite + TypeScript.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP Client | Axios (aktif di Phase 7) |
| Linting | ESLint + Prettier |

## Prasyarat

- Node.js **v18+**
- npm v9+

## Cara Install & Menjalankan

```bash
# 1. Clone repository
git clone <repo-url>
cd twistgram-web-js

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
├── features/            # Logika & komponen per fitur
│   ├── auth/
│   ├── profile/
│   ├── feed/
│   ├── post/
│   ├── story/
│   ├── search/
│   ├── chat/
│   └── notification/
├── hooks/               # Custom React hooks
├── pages/               # Komponen halaman per route
├── routes/              # Konfigurasi React Router
├── services/
│   └── mock/            # Mock data & service layer (diganti API call di Phase 7)
├── styles/              # CSS global & design tokens tambahan
├── types/               # TypeScript interfaces (1:1 dengan skema DB di SRS §10)
└── utils/               # Helper functions umum
```

## Roadmap Fase Pengembangan

| Fase | Scope | Status |
|------|-------|--------|
| 0 | Inisialisasi Proyek & Arsitektur Folder | ✅ Done |
| 1 | Design System & Komponen Global | ✅ Done |
| 2 | Modul Autentikasi (UI + Mock) | 🔜 |
| 3 | Modul Profil & Relasi Sosial | 🔜 |
| 4 | Modul Feed & Post | 🔜 |
| 5 | Modul Story | 🔜 |
| 6 | Modul Pencarian, Chat, Notifikasi | 🔜 |
| 7 | Integrasi Layer Service ke API Contract | 🔜 |

## Referensi

- [SRS & TDD Document](./docs/Twistgram_SRS_TDD.md) — sumber kebenaran tunggal untuk seluruh fitur & skema data
