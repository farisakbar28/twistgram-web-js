import { createBrowserRouter } from 'react-router-dom';

// Pages — Placeholder skeletons for Phase 0
// Each page will be fully implemented in its respective phase
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import SearchPage from '../pages/SearchPage';
import ChatPage from '../pages/ChatPage';
import NotificationPage from '../pages/NotificationPage';
import NotFoundPage from '../pages/NotFoundPage';

// NOTE: Protected route wrapper will be added in Phase 2 (Authentication)
// NOTE: Layout wrapper (Navbar/Sidebar) will be added in Phase 1 (Design System)

export const router = createBrowserRouter([
  // === Public routes (no auth required) ===
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // === Protected routes (auth required — guard added in Phase 2) ===
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/notifications',
    element: <NotificationPage />,
  },
  {
    path: '/profile/:username',
    element: <ProfilePage />,
  },

  // === Catch-all ===
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
