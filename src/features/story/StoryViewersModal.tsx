import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getStoryViewers } from '../../services';
import type { StoryView } from '../../types/index';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================
// Types
// ============================================================

interface StoryViewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
}

// ============================================================
// Component
// ============================================================

export const StoryViewersModal: React.FC<StoryViewersModalProps> = ({
  isOpen,
  onClose,
  storyId,
}) => {
  const { currentUser } = useAuth();
  const [viewers, setViewers] = useState<StoryView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchViewers = async () => {
      if (!currentUser || !storyId) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await getStoryViewers(storyId, currentUser.id);
        setViewers(data);
      } catch {
        setError('Gagal memuat daftar penonton cerita.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchViewers();
    }
  }, [isOpen, storyId, currentUser]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Penonton Cerita"
      size="sm"
    >
      <div className="min-h-[200px] max-h-[350px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Spinner size="md" className="text-brand-500" />
          </div>
        ) : error ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Daftar penonton gagal dimuat"
            description={error}
            actionLabel="Coba Lagi"
            onAction={() => {
              setIsLoading(true);
              setError('');
              void getStoryViewers(storyId, currentUser!.id)
                .then(setViewers)
                .catch(() => setError('Gagal memuat daftar penonton cerita.'))
                .finally(() => setIsLoading(false));
            }}
            className="h-[200px] border-0 bg-transparent p-4"
          />
        ) : viewers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Belum ada penonton"
            description="Cerita Anda akan menampilkan daftar pengguna yang melihatnya di sini."
            className="h-[200px] border-0 bg-transparent p-4"
          />
        ) : (
          <div className="flex flex-col gap-3.5">
            {viewers.map((view) => {
              const viewer = view.viewer;
              if (!viewer) return null;
              return (
                <div key={view.id} className="flex items-center justify-between">
                  <Link
                    to={`/profile/${viewer.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar
                      src={viewer.avatar_url}
                      name={viewer.name}
                      size="sm"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-neutral-100 group-hover:text-brand-400 transition-colors">
                        {viewer.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        @{viewer.username}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
