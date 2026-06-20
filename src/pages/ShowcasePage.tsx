import React, { useState } from 'react';
import {
  Lock,
  User,
  Plus,
  Trash,
  Eye,
  EyeOff,
  Bell,
  MessageSquare,
  FolderOpen,
  Share2,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import IconButton from '../components/common/IconButton';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

// ============================================================
// Component
// ============================================================

const ShowcasePage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'visuals' | 'forms' | 'avatars' | 'feedback'>('visuals');

  // Input states
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Empty state simulation state
  const [emptyStateActionLoading, setEmptyStateActionLoading] = useState(false);

  // Toast triggers
  const triggerToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Berhasil menyimpan perubahan profil!', 3000);
        break;
      case 'error':
        toast.error('Gagal mengunggah foto. Silakan coba lagi.', 4000);
        break;
      case 'warning':
        toast.warning('Sesi Anda akan segera berakhir dalam 5 menit.', 5000);
        break;
      case 'info':
        toast.info('Ada pesan baru dari Faris Akbar.', 3000);
        break;
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-surface-900 border border-surface-800 shadow-glow-sm">
        <div className="absolute inset-0 bg-glow-brand pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold self-start">
            Fase 1 — Design System & Global Components
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight mt-2 md:text-4xl">
            Twistgram <span className="text-transparent bg-clip-text bg-brand-gradient">UI Showcase</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed mt-1">
            Galeri interaktif untuk memverifikasi arah desain visual (violet → blue gradient, dark surfaces, premium typography) dan komponen global Twistgram.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-surface-900 overflow-x-auto pb-px scrollbar-none">
        {(['visuals', 'forms', 'avatars', 'feedback'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap capitalize cursor-pointer select-none',
              activeTab === tab
                ? 'border-brand-500 text-brand-400 font-bold bg-brand-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-surface-800',
            ].join(' ')}
          >
            {tab === 'visuals' && 'Visual & Tokens'}
            {tab === 'forms' && 'Form & Buttons'}
            {tab === 'avatars' && 'Avatars & Media'}
            {tab === 'feedback' && 'Overlays & Feedback'}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* ==================== VISUALS & TOKENS ==================== */}
        {activeTab === 'visuals' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Color Palette */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Warna & Gradien
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-brand-gradient border border-brand-500/20 text-white flex flex-col justify-end min-h-24 shadow-glow-sm">
                  <span className="text-xs font-bold">Brand Gradient</span>
                  <span className="text-[10px] opacity-75">violet → blue</span>
                </div>
                <div className="p-4 rounded-xl bg-brand-gradient-r border border-brand-500/20 text-white flex flex-col justify-end min-h-24">
                  <span className="text-xs font-bold">Brand Gradient (R)</span>
                  <span className="text-[10px] opacity-75">blue → violet</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-950 border border-surface-900 text-neutral-200 flex flex-col justify-end min-h-24">
                  <span className="text-xs font-bold bg-surface-900 px-1.5 py-0.5 rounded self-start mb-1 border border-surface-800 text-[9px]">#09090F</span>
                  <span className="text-xs text-neutral-400 font-semibold">Surface 950 (Bg)</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-900 border border-surface-800 text-neutral-200 flex flex-col justify-end min-h-24">
                  <span className="text-xs font-bold bg-surface-800 px-1.5 py-0.5 rounded self-start mb-1 border border-surface-700 text-[9px]">#111118</span>
                  <span className="text-xs text-neutral-400 font-semibold">Surface 900 (Cards)</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-800 border border-surface-700 text-neutral-200 flex flex-col justify-end min-h-24">
                  <span className="text-xs font-bold bg-surface-700 px-1.5 py-0.5 rounded self-start mb-1 border border-surface-600 text-[9px]">#1C1C27</span>
                  <span className="text-xs text-neutral-400 font-semibold">Surface 800 (Items)</span>
                </div>
                <div className="p-4 rounded-xl bg-success-500 text-white flex flex-col justify-end min-h-24">
                  <span className="text-xs font-bold">Success</span>
                  <span className="text-[10px] opacity-75">#22C55E</span>
                </div>
                <div className="p-4 rounded-xl bg-warning-500 text-white flex flex-col justify-end min-h-24">
                  <span className="text-xs font-bold">Warning</span>
                  <span className="text-[10px] opacity-75">#EAB308</span>
                </div>
                <div className="p-4 rounded-xl bg-danger-500 text-white flex flex-col justify-end min-h-24 shadow-glow-blue/20">
                  <span className="text-xs font-bold">Danger</span>
                  <span className="text-[10px] opacity-75">#EF4444</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Tipografi (Inter Font)
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono">Title ExtraBold (text-4xl font-extrabold tracking-tight)</span>
                  <p className="text-4xl font-extrabold text-neutral-100 tracking-tight">Kreativitas Tanpa Batas</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono">Heading Bold (text-2xl font-bold tracking-wide)</span>
                  <p className="text-2xl font-bold text-neutral-100 tracking-wide">Jelajahi Momen Terbaik</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono">Sub-heading Semibold (text-lg font-semibold)</span>
                  <p className="text-lg font-semibold text-neutral-200">Bagikan foto dan video seru</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono">Body Regular (text-sm leading-relaxed text-neutral-400)</span>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    Twistgram menggunakan standard font Inter yang diimpor dari Google Fonts. Memberikan visual modern yang bersih, readability yang tinggi di layar mobile maupun desktop, dan mendukung micro-spacing yang elegan.
                  </p>
                </div>
              </div>
            </div>

            {/* Empty States */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Empty States
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Empty State */}
                <EmptyState
                  title="Belum Ada Postingan"
                  description="Feed Anda saat ini kosong karena Anda belum mengikuti siapa pun. Cari kreator hebat untuk diikuti!"
                />
                
                {/* Custom Action Empty State */}
                <EmptyState
                  icon={<FolderOpen className="h-8 w-8" />}
                  title="Koleksi Tersimpan Kosong"
                  description="Simpan postingan yang menarik perhatian Anda untuk dilihat kembali di sini kapan saja."
                  actionLabel="Cari Postingan"
                  actionLoading={emptyStateActionLoading}
                  onAction={() => {
                    setEmptyStateActionLoading(true);
                    setTimeout(() => {
                      setEmptyStateActionLoading(false);
                      toast.info('Mengalihkan ke halaman pencarian...', 2000);
                    }, 1500);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== FORMS & BUTTONS ==================== */}
        {activeTab === 'forms' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Buttons variants */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Button Component
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 flex flex-col gap-6">
                {/* Standard variants */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-1">Varian Tombol (Variants)</span>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary (Gradient)</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-1">Ukuran Tombol (Sizes)</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="xs" variant="primary">Size XS</Button>
                    <Button size="sm" variant="secondary">Size SM</Button>
                    <Button size="md" variant="outline">Size MD (Default)</Button>
                    <Button size="lg" variant="danger">Size LG</Button>
                  </div>
                </div>

                {/* Loading and states */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-1">Kondisi Khusus (States)</span>
                  <div className="flex flex-wrap gap-3">
                    <Button loading variant="primary">Primary Loading</Button>
                    <Button loading variant="secondary">Secondary Loading</Button>
                    <Button disabled variant="outline">Disabled State</Button>
                    <Button variant="primary" leftIcon={<Plus className="h-4.5 w-4.5" />}>
                      Left Icon
                    </Button>
                    <Button variant="secondary" rightIcon={<Share2 className="h-4.5 w-4.5" />}>
                      Right Icon
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Component */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Input Component & Validasi
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  {/* Basic text */}
                  <Input
                    id="showcase-username"
                    label="Username"
                    placeholder="Masukkan username Anda"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (e.target.value.length < 3) {
                        setInputError('Username minimal harus 3 karakter.');
                      } else {
                        setInputError('');
                      }
                    }}
                    variant={inputError ? 'error' : inputText ? 'success' : 'default'}
                    helperText={inputError || 'Masukkan nama pengguna tanpa spasi.'}
                    leftIcon={<User className="h-4 w-4" />}
                  />

                  {/* Password with toggle rightAction */}
                  <Input
                    id="showcase-password"
                    label="Kata Sandi"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password minimum 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-neutral-400 hover:text-neutral-200 p-1"
                        aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex flex-col gap-4 justify-between bg-surface-950/40 p-4 rounded-xl border border-surface-800">
                  <div className="text-xs text-neutral-400 flex flex-col gap-2">
                    <p className="font-bold text-neutral-300">Penjelasan Fitur Input:</p>
                    <ul className="list-disc pl-4 flex flex-col gap-1 text-[11px] leading-relaxed">
                      <li><strong>Status Otomatis:</strong> Berubah warna ring (Merah untuk error, Hijau untuk success, Ungu untuk focus).</li>
                      <li><strong>Ikon Terintegrasi:</strong> Mendukung slot ikon di sebelah kiri (`leftIcon`) untuk kemudahan identifikasi tipe input.</li>
                      <li><strong>Aksi Kanan:</strong> Tombol khusus di sebelah kanan (`rightAction`), ideal untuk menampilkan/menyembunyikan kata sandi.</li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => {
                      setInputText('farisakbar28');
                      setInputError('');
                      setPassword('MySecretP@ss123');
                    }}
                  >
                    Isi Form Contoh
                  </Button>
                </div>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                IconButton Component (Navigasi & Toolbar)
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 flex flex-wrap gap-8 items-center justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Ghost Variant</span>
                  <IconButton icon={<MessageSquare className="h-5 w-5" />} label="Pesan" variant="ghost" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Surface Variant</span>
                  <IconButton icon={<User className="h-5 w-5" />} label="Profil" variant="surface" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Primary Gradient</span>
                  <IconButton icon={<Plus className="h-5 w-5" />} label="Buat Baru" variant="primary" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Danger Hover</span>
                  <IconButton icon={<Trash className="h-5 w-5" />} label="Hapus" variant="danger" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">With Badge (Bell)</span>
                  <IconButton icon={<Bell className="h-5 w-5" />} label="Notifikasi" variant="ghost" badge={7} />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Badge Overflow</span>
                  <IconButton icon={<Bell className="h-5 w-5" />} label="Notifikasi" variant="ghost" badge={120} />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Active State</span>
                  <IconButton icon={<MessageSquare className="h-5 w-5" />} label="Pesan" variant="ghost" active />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== AVATARS & MEDIA ==================== */}
        {activeTab === 'avatars' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Avatars */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Avatar Component
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 flex flex-col gap-6">
                
                {/* Sizes and initials */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-2">Ukuran & Inisial Fallback Otomatis (Deterministic Colors)</span>
                  <div className="flex flex-wrap items-end gap-5">
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Faris Akbar" size="xs" />
                      <span className="text-[10px] text-neutral-500">XS (24px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Clara Clarissa" size="sm" />
                      <span className="text-[10px] text-neutral-500">SM (32px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Budi Santoso" size="md" />
                      <span className="text-[10px] text-neutral-500">MD (40px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Dewi Lestari" size="lg" />
                      <span className="text-[10px] text-neutral-500">LG (56px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Zack Snyder" size="xl" />
                      <span className="text-[10px] text-neutral-500">XL (72px)</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Yusuf Habibi" size="2xl" />
                      <span className="text-[10px] text-neutral-500">2XL (96px)</span>
                    </div>
                  </div>
                </div>

                {/* Status indicator and Story rings */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-2">Status Ring Cerita (Story Rings) & Indikator Online</span>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Faris Akbar" size="lg" hasStory />
                      <span className="text-[10px] text-neutral-400">Story Baru</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Clara Clarissa" size="lg" hasStory />
                      <span className="text-[10px] text-neutral-400">Sudah Dilihat</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Budi Santoso" size="lg" online />
                      <span className="text-[10px] text-neutral-400">Sedang Aktif</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar name="Dewi Lestari" size="lg" hasStory online />
                      <span className="text-[10px] text-neutral-400">Story + Aktif</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar
                        name="Faris Akbar"
                        size="lg"
                        hasStory
                        onClick={() => toast.info('Avatar diklik!')}
                      />
                      <span className="text-[10px] text-brand-400 font-medium">Bisa Diklik</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================== FEEDBACK & DIALOGS ==================== */}
        {activeTab === 'feedback' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Toast Boards */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Toast Notifications (Papan Penguji)
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
                <p className="text-sm text-neutral-400 mb-4">
                  Klik tombol di bawah untuk memicu notifikasi Toast dinamis dengan durasi tersendiri. Perhatikan progress bar di bagian bawah toast!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" className="border-success-500/20 hover:border-success-500/40 text-success-400" onClick={() => triggerToast('success')}>
                    Picu Success Toast
                  </Button>
                  <Button variant="secondary" className="border-danger-500/20 hover:border-danger-500/40 text-danger-400" onClick={() => triggerToast('error')}>
                    Picu Error Toast
                  </Button>
                  <Button variant="secondary" className="border-warning-500/20 hover:border-warning-500/40 text-warning-400" onClick={() => triggerToast('warning')}>
                    Picu Warning Toast
                  </Button>
                  <Button variant="secondary" className="border-accent-500/20 hover:border-accent-500/40 text-accent-400" onClick={() => triggerToast('info')}>
                    Picu Info Toast
                  </Button>
                </div>
              </div>
            </div>

            {/* Modals & Spinners */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-100 tracking-wide border-l-2 border-brand-500 pl-3">
                Modals & Spinners
              </h2>
              <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 flex flex-col gap-6">
                {/* Spinners sizes */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-2">Spinner Loading (Inherit Text Color)</span>
                  <div className="flex items-center gap-6 text-brand-400">
                    <Spinner size="xs" />
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner size="xl" />
                  </div>
                </div>

                {/* Modal triggers */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-mono mb-2">Modal Dialogs</span>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModalSize('sm');
                        setIsModalOpen(true);
                      }}
                    >
                      Buka Modal Kecil (SM)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModalSize('md');
                        setIsModalOpen(true);
                      }}
                    >
                      Buka Modal Sedang (MD)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModalSize('lg');
                        setIsModalOpen(true);
                      }}
                    >
                      Buka Modal Besar (LG)
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal instance */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              size={modalSize}
              title={`Contoh Modal Dialog (${modalSize.toUpperCase()})`}
              description="Ini adalah deskripsi pembantu modal untuk menyajikan instruksi yang lebih jelas kepada pengguna."
              footer={
                <div className="flex items-center justify-end gap-3 w-full">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Kembali
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsModalOpen(false);
                      toast.success('Aksi berhasil dijalankan!');
                    }}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              }
            >
              <div className="flex flex-col gap-4 text-sm text-neutral-300 py-2">
                <p>
                  Modal ini mendukung fitur keluar otomatis dengan mengetuk tombol <strong>Escape</strong> pada keyboard Anda atau mengeklik area buram (backdrop blur) di luar modal.
                </p>
                <p className="leading-relaxed bg-surface-950 p-3 rounded-lg border border-surface-800 text-xs font-mono text-neutral-400">
                  z-index dikelola dengan React Portal ke `document.body` agar aman dari stacking issues di CSS.
                </p>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowcasePage;
