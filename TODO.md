# TODO - Bug Fix (Refs: Bug fixing sebelum integrasi backend)

## BUG 1 (done)

- [x] `src/components/common/Avatar.tsx`: benarkan border/ring persegi dengan menambahkan `rounded-full overflow-hidden` pada wrapper avatar

## BUG 3 (done)

- [x] `src/pages/ChatPage.tsx`: hentikan spinner flicker dengan mempersempit dependency `useEffect` pemuatan pesan menjadi `activeConv?.id` saja

## BUG 4 (done)

- [x] `src/pages/NotificationPage.tsx`: hilangkan notifikasi follow_request setelah Setujui/Tolak (tombol langsung menghilang, tanpa toast “sudah diproses sebelumnya” saat diklik ulang)
