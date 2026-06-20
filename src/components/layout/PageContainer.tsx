import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

// ============================================================
// Types
// ============================================================

export interface PageContainerProps {
  children: React.ReactNode;
}

// ============================================================
// Component
// ============================================================

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-950 text-neutral-100 font-sans antialiased selection:bg-brand-500/30 selection:text-brand-300">
      {/* Top Navbar: only visible on mobile/tablet */}
      <Navbar />

      {/* Left Sidebar: only visible on desktop */}
      <Sidebar />

      {/* Main Page Content Wrapper */}
      <div className="min-h-screen md:pl-64 xl:pl-72 pb-16 md:pb-0 transition-all duration-200">
        <main className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col">
          {children}
        </main>
      </div>

      {/* Bottom Nav: only visible on mobile/tablet */}
      <BottomNav />
    </div>
  );
};

export default PageContainer;
