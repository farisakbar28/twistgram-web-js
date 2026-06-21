# Audit Frontend Twistgram — 21 Juni 2026

## Ringkasan Eksekutif

- Total temuan: **Kritis (5), Sedang (32), Rendah (9), Sekadar Catatan (7)**.
- Total temuan per kategori: **A (15), B (4), C (6), D (10), E (10), F (8)**.
- Kondisi umum: UI demo sudah mencakup mayoritas layar Fase 0–7, tetapi belum dapat dinyatakan siap mengganti mock dengan backend Go. Hambatan utama adalah pemanggilan langsung ke `services/mock/*`, pengelolaan token/sesi API yang belum tersambung, beberapa flow MVP yang hanya bersifat visual, dan kontrak body/response API yang belum didefinisikan rinci.
- Verifikasi teknis:
  - `npx tsc --noEmit`: **lulus** tanpa error.
  - `npm run lint`: **gagal dijalankan dengan konfigurasi default** karena ESLint 9 tidak membaca `.eslintrc.json`.
  - Lint dengan mode konfigurasi legacy: **57 masalah (41 error, 16 warning)**.
  - Vite dev server: **berhasil merespons HTTP 200**.
  - Console browser tidak dapat diinspeksi penuh tanpa browser automation; audit menemukan **17 pemanggilan `console.*`** secara statis.
  - Worktree bersih sebelum laporan ini dibuat; tidak ada source code yang diubah.

### Rekomendasi urutan prioritas sebelum integrasi backend

1. Putus seluruh ketergantungan UI terhadap `services/mock/*`; jadikan `src/services/index.ts` satu-satunya entrypoint data.
2. Benahi lifecycle autentikasi API: penyimpanan access/refresh token, hydration user, refresh token, logout, dan format response.
3. Tetapkan kontrak request/response backend yang eksplisit, termasuk casing field, pagination, error envelope, upload media, serta endpoint helper yang saat ini tidak ada di SRS.
4. Selesaiki flow MVP yang saat ini palsu/belum lengkap: story reply ke DM, mulai percakapan, like komentar, tag/mention, share ke DM, unblock, report post/comment, dan recovery email.
5. Satukan model data/type dan mock store agar registrasi, profil, feed, notifikasi, dan relasi sosial memakai sumber data yang sama.
6. Pulihkan quality gate: migrasi konfigurasi ESLint, selesaikan lint errors, dan tambahkan test untuk business rule serta empat regression bug.
7. Rapikan README, showcase sementara, struktur folder, dan dokumentasi agar status project tidak menyesatkan proses integrasi backend.

---

## A. Kesesuaian Implementasi vs Roadmap Fase 0–7

| Lokasi | Temuan | Urgensi | Rekomendasi |
|---|---|---:|---|
| `src/pages/CreatePostPage.tsx`, `src/services/mock/post.ts`, `src/types/index.ts` | MVP tag pengguna pada post belum tersedia. Tidak ada input tagged user, model `PostTag`, pemanggilan notifikasi mention, atau hak pengguna untuk menghapus tag sesuai CNT-05. | Sedang | ✅ Selesai — Fase A7 menambahkan input tagged usernames saat create post, model `PostTag` di mock store, notifikasi `mention`, serta aksi hapus tag untuk user yang ditag atau pemilik post. |
| `src/components/common/CommentSection.tsx`, `src/services/mock/post.ts`, `src/services/api/post.ts` | MVP like/unlike komentar belum diimplementasikan, walaupun endpoint `POST /comments/:id/like` tercantum di SRS. | Sedang | ✅ Selesai — Fase A6 menambahkan service `likeComment`/`unlikeComment`, menghitung `likes_count` + `is_liked` di mock comments, dan memasang toggle like langsung di UI komentar. |
| `src/components/common/PostCard.tsx`, `src/pages/PostDetailPage.tsx` | MVP share hanya menyalin link. Opsi share ke Direct Message internal belum ada. | Sedang | ✅ Selesai — Fase A7 menambahkan modal share ke Direct Message internal berbasis pencarian user dan pengiriman via chat service, dengan copy-link tetap tersedia sebagai fallback lokal. |
| `src/features/story/StoryViewer.tsx:151-158` | Reply story hanya menampilkan toast sukses; tidak memanggil `startConversation`/`sendMessage` dan tidak membuat message dengan `reply_to_story_id`. Ini melanggar CNT-02. | **Kritis** | ✅ Selesai — Fase A4 menghubungkan reply story ke `startConversation` + `sendMessage`, menyimpan `reply_to_story_id`, dan membuka thread chat hasilnya agar pesan langsung terlihat. |
| `src/services/mock/chat.ts`, `src/services/api/chat.ts`, `src/pages/ChatPage.tsx` | Riwayat chat belum paginated. `getMessages` selalu mengembalikan seluruh pesan dan UI tidak memiliki cursor/load-more. | Sedang | Gunakan `PaginatedResponse<Message>` dan tetapkan cursor/limit pada kontrak Go. |
| `src/pages/ProfilePage.tsx`, `src/services/mock/social.ts:546` | Service unblock tersedia tetapi tidak ada UI/route untuk melihat akun yang diblokir atau melakukan unblock. | Sedang | ✅ Selesai — Fase A6 menambahkan daftar akun diblokir pada profil sendiri beserta aksi `unblock` yang memakai service/store terpusat. |
| `src/pages/ProfilePage.tsx:356-359`, `src/services/mock/chat.ts:229` | Tombol **Pesan** tidak memiliki handler. `startConversation` tersedia tetapi tidak pernah dipakai oleh UI. | Sedang | ✅ Selesai — Fase A6 menghubungkan tombol `Pesan` ke `startConversation` lalu menavigasikan user ke thread chat hasilnya. |
| `src/pages/ProfilePage.tsx`, `src/pages/PostDetailPage.tsx`, `src/components/common/CommentSection.tsx` | Report hanya tersedia untuk target user. MVP report post dan comment belum memiliki UI. | Sedang | ✅ Selesai — Fase A6 mengekstrak modal report reusable dan memasangnya untuk `user`, `post`, serta `comment` di flow UI utama. |
| `src/pages/RecoverAccountPage.tsx:286-297` | Recovery email Skenario B hanya menampilkan email tersamarkan. SRS menyatakan pengguna dapat mengganti email setelah verifikasi. | Sedang | ✅ Selesai — Fase A7 menambahkan langkah set email baru setelah OTP, token pemulihan mock untuk update email, dan hasil akhir yang menampilkan email login baru pengguna. |
| `src/pages/EditProfilePage.tsx`, `src/services/mock/social.ts:243-281`, `src/pages/ProfilePage.tsx` | Link eksternal tersedia di form, tetapi tidak dimuat dari profil, diabaikan oleh mock update, tidak ada di `User`, dan tidak ditampilkan di halaman profil. | Sedang | ✅ Selesai — Fase A7 menambahkan `external_link` ke type user, memuat nilainya ke form edit, menyimpan lewat mock service, dan menampilkannya di header profil. |
| `src/pages/EditProfilePage.tsx:218-228`, `src/services/mock/social.ts:248-252`, `src/services/mock/social.ts:438-447` | SOC-05 hanya berupa peringatan; pembatasan username 1x/bulan tidak ditegakkan. SOC-04 cancel request tersedia melalui unfollow, tetapi expiry request tidak ada. | Sedang | Backend harus menjadi enforcement source; frontend menampilkan cooldown/expiry dari response. |
| `src/services/mock/auth.ts`, `src/services/mock/social.ts`, `src/features/auth/AuthContext.tsx` | User yang baru register hanya ditambahkan ke database mock auth, bukan database social. Session register juga tidak disimpan. Setelah verifikasi, profil user baru tidak ditemukan dan sesi hilang saat refresh. | **Kritis** | ✅ Selesai — Fase A1 menyatukan store mock dan Fase A2 menambahkan session adapter tunggal, persist pending session saat register, hydrate user dari storage, serta aktivasi sesi verified setelah OTP sukses. |
| `src/features/*`, `src/pages/*`, `src/components/common/*` | Struktur Fase 0 tidak dijalankan secara konsisten. Folder `features/chat`, `feed`, `notification`, `post`, `profile`, dan `search` tetap kosong, sedangkan logic besar berada di pages/common. | Sedang | Tetapkan ulang boundary feature atau perbarui arsitektur resmi; jangan mempertahankan struktur dokumentasi yang tidak nyata. |
| `src/components/common/Avatar.tsx`, `src/services/mock/chat.ts` | Tidak ditemukan fitur ADV lengkap yang aktif di produk. Yang ada berupa scaffolding seperti `Avatar.online`, `is_close_friend`, dan auto-reply bot non-SRS; belum setara implementasi online status/read receipt/Close Friends. | Sekadar Catatan | Tandai scaffolding sebagai non-production dan jangan masukkan sebagai status fitur ADV selesai. |
| `src/pages/CreatePostPage.tsx`, `src/features/story/CreateStoryModal.tsx`, `src/pages/ChatPage.tsx` | "Upload" media MVP masih berupa input URL, bukan pemilihan/upload file. Ini cukup untuk mock demo tetapi belum memenuhi flow upload nyata. | Sedang | Tentukan multipart/presigned-upload contract sebelum integrasi storage/backend. |

---

## B. Hasil Bug Fixing Sebelumnya

| Bug | Status Verifikasi | Temuan | Urgensi | Rekomendasi |
|---|---|---|---:|---|
| Avatar persegi | **Terverifikasi selesai** | Root cause pada wrapper `Avatar` sudah diperbaiki dengan `rounded-full overflow-hidden`. Pencarian seluruh `<img>` tidak menemukan avatar user lain yang dirender sebagai `<img>` langsung; `<img>` tersisa adalah media post/story/chat/preview. | Sekadar Catatan | Tambahkan visual regression test untuk seluruh ukuran avatar dan story ring. |
| Tombol Detail → Follow di Beranda | **Selesai untuk mock, belum backend-ready** | `FollowButton` sekarang menggantikan link Detail dan state di-refresh. Namun handler masih dynamic-import langsung ke mock dan seluruh error ditelan, sehingga gagal follow dapat terlihat seperti tidak terjadi apa-apa. | Sedang | Gunakan service entrypoint dan tampilkan feedback error/sukses yang konsisten. |
| Spinner flicker di chat | **Root cause utama terselesaikan** | Dependency fetch message dipersempit ke `activeConv?.id`; polling tidak lagi memicu spinner setiap object conversation berubah. Masih ada warning dependency lint dan potensi race antara polling conversation dengan fetch message. | Rendah | Pertahankan loading hanya saat conversation ID berubah dan tambahkan request cancellation/race guard. |
| Notifikasi follow tidak update | **✅ Selesai untuk mock-level (Fase A3)** | Seed follow request kini direkonsiliasi terhadap relasi `mockFollows` yang benar-benar `pending`, notifikasi `follow_request` memakai `reference_id = follow.id`, dan aksi Setujui/Tolak memproses request berdasarkan identifier itu alih-alih menebak dari actor. Manipulasi localStorage langsung dari social service juga sudah dihapus. | **Kritis** | Untuk backend asli nanti, response notifikasi/follow request tetap perlu dibuat atomik di server, tetapi blocker mock/frontend-nya sudah selesai. |

---

## C. Konsistensi UI/Komponen

| Lokasi | Temuan | Urgensi | Rekomendasi |
|---|---|---:|---|
| Banyak file pages/features; contoh `ChatPage.tsx`, `NotificationPage.tsx`, `PostCard.tsx`, `CommentSection.tsx` | `Button`, `Input`, dan `IconButton` tidak dipakai konsisten. Terdapat banyak tombol/input manual dengan style berulang dan state disabled/focus yang berbeda. | Sedang | ⏳ Tuntas sebagian — Fase A8 memigrasikan aksi utama di `ChatPage.tsx` dan `NotificationPage.tsx` ke komponen common, tetapi konsistensi penuh lintas seluruh halaman contoh masih perlu dilanjutkan. |
| `NotificationPage.tsx`, `SearchPage.tsx`, `ChatPage.tsx`, `StoryViewersModal.tsx` | Empty state sering ditulis manual walau `EmptyState` tersedia, menghasilkan spacing/icon/copy yang berbeda. | Rendah | ✅ Selesai — Fase A8 mengganti empty state manual pada `NotificationPage.tsx`, `SearchPage.tsx`, `ChatPage.tsx`, dan `StoryViewersModal.tsx` agar memakai `EmptyState`. |
| `src/index.css`, `CreateStoryModal.tsx`, `StoryViewer.tsx`, `ChatPage.tsx`, `PostCard.tsx` | Mayoritas memakai token, tetapi masih ada hardcoded hex dan palette default `rose/purple/indigo/emerald/teal/slate` di luar token brand/surface/status Fase 1. | Rendah | Dokumentasikan palette tambahan atau pindahkan ke semantic tokens. |
| `HomePage.tsx`, `StoriesBar.tsx`, `ProfilePage.tsx`, `ChatPage.tsx`, `NotificationPage.tsx`, `SearchPage.tsx` | Error fetch umumnya hanya dicetak ke console lalu UI berubah menjadi empty state/blank state. Pengguna tidak dapat membedakan data kosong dari request gagal. | Sedang | ⏳ Tuntas sebagian — Fase A8 menambahkan error state + retry untuk Feed, Profil, Chat, Notification, dan Search sesuai scope fase ini; `StoriesBar.tsx` masih menyisakan perapihan error handling terpisah. |
| `src/components/layout/Navbar.tsx:14-16` | Badge mobile masih hardcoded `3` dan `5`, sedangkan Sidebar/BottomNav membaca mock count dinamis. UI dapat menampilkan angka berbeda pada device yang sama. | Sedang | ✅ Selesai — Fase A8 memindahkan badge mobile ke source unread count dinamis yang sama seperti layout lain. |
| Seluruh halaman utama | Loading dan empty state dasar sudah tersedia pada feed, profil, followers/following, requests, search, chat, notification, comment, dan story viewers. | Sekadar Catatan | Pertahankan coverage ini saat migrasi ke API; fokus berikutnya adalah error/retry state. |

---

## D. Kualitas Kode & TypeScript

| Lokasi | Temuan | Urgensi | Rekomendasi |
|---|---|---:|---|
| Seluruh `src/` | `npx tsc --noEmit` lulus; strict mode, unused locals, dan unused parameters aktif. | Sekadar Catatan | Jadikan type-check sebagai CI gate terpisah dari build output. |
| `package.json`, `.eslintrc.json` | `npm run lint` tidak dapat berjalan normal karena project memakai ESLint 9 tetapi konfigurasi masih format `.eslintrc`. | Sedang | ⏳ Tuntas sebagian — Fase A10 memigrasikan ke `eslint.config.js`. |
| Seluruh `src/` | Mode lint legacy menemukan 57 masalah: 41 error dan 16 warning, termasuk empty catch, state update in effect, ref access saat render, dependency hook, static component, dan manual memoization. | Sedang | Sisa Fase A10 — selesaikan error lint per kelompok. |
| 14 penggunaan eksplisit; contoh `ChatPage.tsx:61,177`, `SearchPage.tsx:57,68`, `services/mock/search.ts:32-50`, `services/api/post.ts:66` | Masih ada `any` untuk timer, error, DB helper, notification parsing, dan return service. | Sedang | Sisa Fase A10 — gunakan `ReturnType<typeof setInterval>`, `unknown`, serta entity/response types spesifik. |
| `src/types/index.ts` dibanding SRS §10 | Types belum 1:1. Field/tabel yang tidak terwakili antara lain post tags, hashtag entities, conversation participants, `location`, `comments_disabled`, `order_index`, `music_track_url`, `is_pinned`, `collection_name`, `visibility`, `is_group`, dan `messages.is_read`. | Sedang | Sisa Fase A10 — lengkapi types sesuai SRS §10. |
| `src/types/auth.ts`, `src/types/social.ts`, `src/types/index.ts` | Entity `User`, `Follow`, `AuthTokens`, `FollowStatus`, dan `ReportReason` didefinisikan lebih dari sekali dengan nullability/field berbeda. | Sedang | Sisa Fase A10 — tetapkan satu canonical domain type. |
| 17 lokasi `console.*` | Ada console error/info untuk fetch failure, OTP, report, share, dan bot. Dev server merespons 200, tetapi console browser interaktif belum dapat diverifikasi. | Rendah | Ganti dengan logger development-safe dan lakukan smoke test browser sebelum backend integration. |
| `package.json`, seluruh repo | Tidak ada script test atau file test untuk business rule, service contract, route guard, maupun regression empat bug. | Sedang | Sisa Fase A10 — tambahkan minimal unit/service tests. |
| `ShowcasePage.tsx`, `hasActiveStory`, `startConversation`, `unblockUser`, beberapa `.gitkeep` | Ada code/scaffolding yang tidak dipakai oleh flow produk atau hanya dapat dicapai sebagai halaman showcase internal. | Rendah | ✅ Selesai — Fase A9 menandai ShowcasePage sebagai dev-only route. |
| Banyak `catch {}` di mock services dan layout | Error sengaja ditelan, sehingga kegagalan cross-service notification/storage tidak terdeteksi dan UI bisa terlihat sukses. | Sedang | Tangani hanya error yang memang aman diabaikan; log terstruktur atau propagate error lainnya. |

---

## E. Service Layer & Kesiapan Integrasi Backend

| Lokasi | Temuan | Urgensi | Rekomendasi |
|---|---|---:|---|
| Hampir seluruh pages/components/features; lihat import `services/mock/*` | Switch mock/API Fase 7 tidak efektif. Hampir seluruh UI langsung mengimpor mock; hanya sebagian AuthContext memakai `src/services/index.ts`. Mengubah `VITE_USE_MOCK=false` tidak memindahkan aplikasi ke API asli. | **Kritis** | ✅ Selesai — Fase A5 memigrasikan consumer UI ke `src/services/index.ts` sehingga import langsung `services/mock/*` tidak lagi bocor di layer pages/components/features/routes. |
| `src/features/auth/AuthContext.tsx`, `src/services/apiClient.ts`, `src/services/mock/auth.ts` | API login response tidak disimpan. `apiClient` membaca key `access_token`, sedangkan mock menyimpan JSON pada `twistgram_tokens`; hydration/logout tetap memakai helper mock. Request API setelah login berpotensi tanpa Bearer token dan sesi hilang saat refresh. | **Kritis** | ✅ Selesai (mock-level) — Fase A2 memusatkan storage user/token di adapter sesi tunggal yang dipakai login, register, verify OTP, hydrate, logout, dan request interceptor. |
| `.env.example`, `src/services/index.ts` | `VITE_API_BASE_URL` sudah ada, tetapi `VITE_USE_MOCK` yang mengontrol switch tidak dicantumkan. | Sedang | ✅ Selesai — Fase A5 menambahkan `VITE_USE_MOCK` ke `.env.example` beserta penjelasan mode mock vs API. |
| `src/services/api/auth.ts`, `notification.ts`, `chat.ts`, `story.ts` | Ada endpoint yang tidak tercantum di SRS: `/auth/check-username`, `/auth/check-email`, `/notifications/read-all`, `POST /notifications`; unread count dan `hasActiveStory` juga tidak punya kontrak. | Sedang | Tambahkan endpoint resmi ke contract atau ubah helper agar diturunkan dari response endpoint yang sah. |
| `src/services/api/*.ts`, SRS §11 | SRS hanya mencantumkan method/path, belum request/response body. Implementasi mencampur camelCase dan snake_case serta selalu mengasumsikan `res.data` adalah entity langsung. Keselarasan response shape tidak dapat dikonfirmasi. | Sedang | Buat OpenAPI/contract document sebelum coding backend dan tetapkan envelope/error/pagination/upload shape. |
| `src/services/apiClient.ts:37-43` | Refresh token masih TODO. Tidak ada retry request, token rotation, atau forced logout saat refresh gagal. | Sedang | ⏳ Tuntas sebagian — Fase A2 sudah memindahkan pembacaan access token ke session adapter tunggal. `// TODO(backend):` retry/rotation tetap menunggu backend auth asli. |
| `ChatPage.tsx:24-34`, `SearchPage.tsx:12,35-47`, `social.ts:462-503` | Komponen/service membaca atau menulis localStorage dan internal mock arrays secara langsung. Abstraksi bocor sehingga tidak dapat diganti API tanpa rewrite UI. | Sedang | Pindahkan seluruh akses state ke service/repository layer. |
| `mock/auth.ts`, `mock/social.ts`, `mock/post.ts`, `mock/story.ts` | Data user diduplikasi di beberapa module dengan field dan lifecycle berbeda. Update/register pada satu store tidak otomatis sinkron ke store lain. | Sedang | ✅ Selesai — Fase A1 memindahkan entity mock ke `src/services/mock/database.ts` sebagai store terpusat dengan helper persist/sync legacy storage. |
| `src/services/api/chat.ts:43-47`, `src/services/api/story.ts:52-57` | Beberapa API helper mengembalikan nilai hardcoded (`0`, `false`), sehingga mode API akan menampilkan unread/story state yang salah walau backend hidup. | Sedang | Implementasikan dari endpoint nyata atau hapus helper dari kontrak UI. |
| `src/services/api/*.ts` dibanding SRS §11 | Method/path resource utama—auth, profile, follow, post, story, search, conversation, notification read, report—secara umum sudah mengikuti daftar endpoint SRS. | Sekadar Catatan | Pertahankan mapping path ini saat memperjelas body dan response contract. |

---

## F. Dokumentasi & Kerapian Project

| Lokasi | Temuan | Urgensi | Rekomendasi |
|---|---|---:|---|
| `README.md` | README masih menyebut React 18 dan React Router v6, sedangkan package memakai React 19 dan React Router 7. Instruksi `cd twistgram-web-js` juga tidak sesuai nama repo. Status Fase 2–7 masih "akan datang". | Sedang | ✅ Selesai — Fase A9 memperbarui versi tech stack, nama folder, dan status roadmap fase 0-8. |
| `README.md:58-80` | Struktur folder terdokumentasi tidak sesuai keadaan nyata: sebagian besar feature/hook/style/assets kosong, service API tidak disebut, dan deskripsi mock "diganti API call di Phase 7" tidak terjadi. | Sedang | ✅ Selesai — Fase A9 memperbarui struktur folder aktual dan boundary service. |
| `src/pages/ShowcasePage.tsx`, `src/routes/index.tsx:111`, `src/pages/ProfilePage.tsx:337` | Component showcase Fase 1 masih menjadi protected product route dan tombol settings profil diarahkan ke showcase. | Rendah | ✅ Selesai — Fase A9 mengubah route menjadi dev-only dan menghapus tombol settings yang mengarah ke showcase. |
| `tsconfig.build-temp.json`, `TODO.md` | Ada config sementara tanpa script pemakai. TODO bug hanya mencatat Bug 1, 3, 4 dan melewatkan Bug 2, sehingga tidak menjadi histori pekerjaan yang utuh. | Rendah | ✅ Selesai — Fase A9 menghapus tsconfig.build-temp.json dan menambah Bug 2 ke TODO.md. |
| `.gitignore`, hasil `git ls-files`/`git check-ignore` | `.gitignore` sudah mencakup `node_modules`, `dist`, `.env*`, editor, log, dan TypeScript cache. `dist/` serta `node_modules/` tidak ter-track; `.env.example` tetap ter-track sebagaimana mestinya. | Sekadar Catatan | Pertahankan konfigurasi ini. |
| `git log` Fase 0–7 | Seluruh commit memakai bentuk Conventional Commit yang valid. Namun scope/bahasa fase tidak konsisten (`phase-1`, `auth`, `profile`, `routes`, `story`, `fase-6`, `services`) dan commit bug terakhir terlalu umum untuk empat regression berbeda. | Rendah | Standarkan scope dan buat subject yang menggambarkan domain/perubahan utama. |
| Root project dan tracked files | Tidak ditemukan `.env` asli yang ter-track. Hanya `.env.example` yang masuk repository. | Sekadar Catatan | Jangan commit secret saat base URL/backend credential mulai ditambahkan. |
| Komentar di `apiClient.ts`, `services/mock/*.ts`, `ProfilePage.tsx` | Beberapa komentar sudah usang/menyesatkan: mock disebut akan "diganti tanpa mengubah component", Fase 7 disebut selesai, dan grid profile masih disebut placeholder. | Rendah | ✅ Selesai — Fase A9 memperbarui komentar di apiClient.ts, types/index.ts, types/auth.ts, dan ProfilePage.tsx. |

---

## Kesimpulan Audit

Frontend saat ini layak sebagai demo UI berbasis mock, tetapi **telah selesai persiapan frontend** untuk integrasi backend Go. Blocker kritis telah tuntas:

1. Story reply tidak menghasilkan DM. ✅ Selesai di Fase A4.
2. Registrasi/session user baru terpecah antar mock store. ✅ Selesai di Fase A1 & A2.
3. Fix notifikasi follow masih bergantung pada data seed yang tidak konsisten dan manipulasi storage. ✅ Selesai di Fase A3 (mock-level).
4. UI melewati service switch dan mengimpor mock secara langsung. ✅ Selesai di Fase A5.
5. Token/session API tidak disimpan atau dipasang secara konsisten. ✅ Selesai di Fase A2 (mock-level); sisa refresh-token backend tetap terpisah.

Update tindak lanjut:
- Fase A1 (21 Juni 2026): store mock terpusat sudah dibuat di `src/services/mock/database.ts`; temuan duplikasi data mock selesai dan blocker registrasi lintas store turun menjadi sisa masalah session/hydration yang dijadwalkan ke Fase A2.
- Fase A2 (21 Juni 2026): session adapter tunggal sudah dipakai oleh mock auth, AuthContext, OTP verification, dan `apiClient`; register/verify/login/logout kini konsisten di atas storage yang sama.
- Fase A3 (21 Juni 2026): notifikasi follow request kini direferensikan ke `follow.id`, seed invalid direkonsiliasi, dan approve/decline tidak lagi menebak request dari kombinasi actor/recipient.
- Fase A4 (21 Juni 2026): reply story kini membuat DM sungguhan dengan `reply_to_story_id`, lalu mengarahkan user ke conversation terkait supaya pesan balasan langsung terlihat.
- Fase A5 (21 Juni 2026): import data UI dipusatkan ke `src/services/index.ts`, helper façade tambahan dipasang untuk kebutuhan login/search/chat/story, dan `.env.example` kini mendokumentasikan `VITE_USE_MOCK`.
- Fase A6 (21 Juni 2026): like komentar, tombol `Pesan` di profil, report `user/post/comment`, dan daftar unblock user kini aktif penuh di atas mock/frontend tanpa bergantung ke backend Go.
- Fase A7 (21 Juni 2026): tag user pada post, share ke DM internal, penggantian email baru pasca OTP recovery, dan `external_link` profil kini berjalan konsisten di layer frontend/mock.
- Fase A8 (21 Juni 2026): empty state manual utama sudah dipusatkan ke `EmptyState`, screen data penting kini punya error state + retry, dan badge unread mobile tidak lagi hardcoded; konsistensi komponen common lintas semua halaman masih berlanjut bertahap.
- Fase A9 (21 Juni 2026): README, TODO.md, komentar, dan showcase route telah diperbarui dan dikonsolidasi.