# Plan: Fase A9 — Dokumentasi & Kerapian Project

## Scope
Perbaiki dokumentasi dan kerapian project sesuai temuan audit kategori F.

## Tasks (urut)

### 1. Update README.md
- Perbarui tech stack: React 19, React Router 7
- Ganti `cd twistgram-web-js` → `cd twistgram-web-ts`
- Update status fase roadmap: 0-8 selesai, sisakan 9 untuk integrasi backend
- Perbarui struktur folder: hapus folder feature yang kosong, tambahkan service/API layer

### 2. Lengkapi TODO.md
- Tambah Bug 2 ke daftar bug fixes
- Update status semua fase yang sudah selesai

### 3. Hapus tsconfig.build-temp.json
- File tidak memiliki script pemakai, tidak diperlukan

### 4. Ubah ShowcasePage menjadi dev-only route
- Pindahkan route ke luar protected layout atau tambahkan guard dev-mode
- Hapus tombol settings profil yang mengarah ke showcase

### 5. Update komentar usang
- `src/services/apiClient.ts`: update komentar tentang Phase 7
- `src/types/index.ts`: update header komentar
- `src/types/auth.ts`: update komentar
- `src/types/social.ts`: sudah cukup baik
- `src/pages/ProfilePage.tsx`: hapus komentar "Grid post placeholder (diisi di Fase 4)"

## Validation
- Periksa semua link dokumentasi berfungsi
- Pastikan showcase tidak dapat diakses di production mode