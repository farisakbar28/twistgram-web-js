/**
 * ProtectedRoute — wrapper untuk route yang butuh autentikasi
 * Ref: SRS AUTH-02 — akun belum verifikasi email tidak bisa akses fitur utama
 *
 * Behavior:
 * - isLoading → tampilkan spinner fullscreen (tunggu hydrate dari localStorage)
 * - belum auth → redirect ke /login
 * - sudah auth tapi email belum verified → redirect ke /verify-otp
 * - sudah auth & terverifikasi → render children
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Spinner from '../../components/common/Spinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Tunggu hydrate session dari localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-brand-500" />
          <p className="text-sm text-neutral-500 animate-pulse">Memuat...</p>
        </div>
      </div>
    );
  }

  // Belum login sama sekali → ke halaman login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // AUTH-02: sudah register tapi email belum diverifikasi → ke OTP
  if (!isAuthenticated && !currentUser.email_verified) {
    return (
      <Navigate
        to="/verify-otp"
        state={{ purpose: 'register', identifier: currentUser.email, from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
