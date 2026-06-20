import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Send } from 'lucide-react';
import IconButton from '../common/IconButton';

// ============================================================
// Component
// ============================================================

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock badge numbers for showcase purposes (will connect to real store in later phases)
  const notificationBadge = 3;
  const chatBadge = 5;

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface-950/80 backdrop-blur-md border-b border-surface-900/80 md:hidden flex items-center justify-between px-4 transition-all duration-200">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-1 select-none">
        <span className="font-sans font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-brand-gradient">
          Twistgram
        </span>
      </Link>

      {/* Quick Action Toolbar */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <IconButton
          icon={<Search className="h-5 w-5" />}
          label="Cari"
          variant="ghost"
          size="sm"
          active={location.pathname === '/search'}
          onClick={() => navigate('/search')}
        />

        {/* Notifications */}
        <IconButton
          icon={<Bell className="h-5 w-5" />}
          label="Notifikasi"
          variant="ghost"
          size="sm"
          badge={notificationBadge}
          active={location.pathname === '/notifications'}
          onClick={() => navigate('/notifications')}
        />

        {/* Messages / Chat */}
        <IconButton
          icon={<Send className="h-5 w-5 -rotate-12 mt-[-2px] ml-[-2px]" />}
          label="Pesan"
          variant="ghost"
          size="sm"
          badge={chatBadge}
          active={location.pathname === '/chat'}
          onClick={() => navigate('/chat')}
        />
      </div>
    </header>
  );
};

export default Navbar;
