/**
 * UserListItem — Row komponen untuk daftar pengguna
 * Digunakan di: FollowersPage, FollowingPage, FollowRequestsPage, SearchPage
 *
 * Menampilkan: Avatar (initial fallback), nama, username, bio singkat,
 * dan slot aksi opsional (FollowButton, Approve/Decline, Remove, dll.)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

interface UserListItemProps {
  userId: string;
  name: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  /** Elemen aksi di kanan (FollowButton, tombol approve, dll.) */
  actionSlot?: React.ReactNode;
  /** Apakah bisa diklik ke halaman profil? */
  linkToProfile?: boolean;
}

const UserListItem: React.FC<UserListItemProps> = ({
  name,
  username,
  bio,
  avatarUrl,
  actionSlot,
  linkToProfile = true,
}) => {
  const content = (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar
        src={avatarUrl}
        name={name}
        size="md"
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-100 truncate">{name}</p>
        <p className="text-xs text-neutral-400 truncate">@{username}</p>
        {bio && (
          <p className="text-xs text-neutral-500 truncate mt-0.5">{bio}</p>
        )}
      </div>
      {actionSlot && (
        <div className="shrink-0 ml-2">{actionSlot}</div>
      )}
    </div>
  );

  if (linkToProfile) {
    return (
      <Link
        to={`/profile/${username}`}
        className="flex items-center px-4 py-3 rounded-xl hover:bg-surface-800/60 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center px-4 py-3">
      {content}
    </div>
  );
};

export default UserListItem;
