import { createBrowserRouter, Outlet } from 'react-router-dom';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import OtpVerifyPage from '../pages/OtpVerifyPage';
import RecoverAccountPage from '../pages/RecoverAccountPage';

import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import FollowersPage from '../pages/FollowersPage';
import FollowingPage from '../pages/FollowingPage';
import FollowRequestsPage from '../pages/FollowRequestsPage';
import SearchPage from '../pages/SearchPage';
import ChatPage from '../pages/ChatPage';
import NotificationPage from '../pages/NotificationPage';
import NotFoundPage from '../pages/NotFoundPage';
import ShowcasePage from '../pages/ShowcasePage';
import CreatePostPage from '../pages/CreatePostPage';
import PostDetailPage from '../pages/PostDetailPage';

// Layout & Route Guards
import PageContainer from '../components/layout/PageContainer';
import ProtectedRoute from '../features/auth/ProtectedRoute';

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
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-otp',
    element: <OtpVerifyPage />,
  },
  {
    path: '/recover-account',
    element: <RecoverAccountPage />,
  },

  // === Protected routes (auth required) ===
  {
    element: (
      <ProtectedRoute>
        <PageContainer>
          <Outlet />
        </PageContainer>
      </ProtectedRoute>
    ),
    children: [
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
        path: '/profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: '/profile/:username',
        element: <ProfilePage />,
      },
      {
        path: '/profile/:username/followers',
        element: <FollowersPage />,
      },
      {
        path: '/profile/:username/following',
        element: <FollowingPage />,
      },
      {
        path: '/follow-requests',
        element: <FollowRequestsPage />,
      },
      {
        path: '/posts/create',
        element: <CreatePostPage />,
      },
      {
        path: '/posts/:id',
        element: <PostDetailPage />,
      },
      {
        path: '/showcase',
        element: <ShowcasePage />,
      },
    ],
  },

  // === Catch-all ===
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);



