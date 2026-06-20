/**
 * FollowButton — tombol follow/unfollow dengan state adaptif
 * Ref: SRS §4.3 (Follow System), §4.5 (Block), §4.7 (Business Rules)
 *
 * State:
 * - not_following → tombol "Follow" (primary)
 * - pending       → tombol "Requested" (outline, bisa di-cancel)
 * - following     → tombol "Following" (secondary, hover = "Unfollow")
 * - blocked       → tidak ditampilkan (null)
 */

import React, { useState } from 'react';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import type { FollowStatus } from '../../types/social';
import Button from './Button';

interface FollowButtonProps {
  followStatus: FollowStatus;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  /** Ukuran tombol */
  size?: 'sm' | 'md';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  followStatus,
  onFollow,
  onUnfollow,
  size = 'sm',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveringFollowing, setIsHoveringFollowing] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (followStatus === 'not_following') {
        await onFollow();
      } else {
        // pending atau following → unfollow/cancel
        await onUnfollow();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Jika diblokir, jangan tampilkan tombol
  if (followStatus === 'blocked') return null;

  if (followStatus === 'following') {
    return (
      <Button
        variant={isHoveringFollowing ? 'danger' : 'secondary'}
        size={size}
        loading={isLoading}
        onClick={handleClick}
        onMouseEnter={() => setIsHoveringFollowing(true)}
        onMouseLeave={() => setIsHoveringFollowing(false)}
        leftIcon={isHoveringFollowing ? undefined : <UserCheck className="h-3.5 w-3.5" />}
        className={`transition-all ${className}`}
      >
        {isHoveringFollowing ? 'Unfollow' : 'Following'}
      </Button>
    );
  }

  if (followStatus === 'pending') {
    return (
      <Button
        variant="outline"
        size={size}
        loading={isLoading}
        onClick={handleClick}
        leftIcon={<Clock className="h-3.5 w-3.5" />}
        className={className}
      >
        Requested
      </Button>
    );
  }

  // not_following
  return (
    <Button
      variant="primary"
      size={size}
      loading={isLoading}
      onClick={handleClick}
      leftIcon={<UserPlus className="h-3.5 w-3.5" />}
      className={className}
    >
      Follow
    </Button>
  );
};

export default FollowButton;
