import React, { useEffect, useState } from 'react';
import { Link2, Search, Send } from 'lucide-react';
import type { User } from '../../types/index';
import { searchUsers, sharePost, sharePostToDm } from '../../services';
import Modal from './Modal';
import Button from './Button';
import Avatar from './Avatar';
import Spinner from './Spinner';
import { useToast } from './Toast';

interface SharePostModalProps {
  isOpen: boolean;
  postId: string;
  currentUserId: string;
  onClose: () => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({
  isOpen,
  postId,
  currentUserId,
  onClose,
}) => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsSearching(true);
      try {
        const users = await searchUsers(query || 'a', currentUserId);
        if (!cancelled) {
          setResults(users.slice(0, 8));
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, query, currentUserId]);

  const handleShareToDm = async (targetUserId: string, username: string) => {
    setSharingUserId(targetUserId);
    try {
      await sharePostToDm(postId, currentUserId, targetUserId);
      toast.success(`Postingan dikirim ke @${username}.`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membagikan postingan ke DM.');
    } finally {
      setSharingUserId(null);
    }
  };

  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      const url = await sharePost(postId, currentUserId);
      await navigator.clipboard.writeText(url);
      toast.success('Tautan berhasil disalin.');
      onClose();
    } catch {
      toast.error('Gagal menyalin tautan postingan.');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bagikan ke Direct Message"
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau username..."
            className="w-full rounded-xl border border-surface-700 bg-surface-800 py-2.5 pl-10 pr-4 text-sm text-neutral-50 placeholder-neutral-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="max-h-72 overflow-y-auto pr-1">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" className="text-brand-500" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">Tidak ada pengguna yang cocok.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-surface-800 bg-surface-900/70 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={user.avatar_url} name={user.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-100">{user.name}</p>
                      <p className="truncate text-xs text-neutral-400">@{user.username}</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="xs"
                    loading={sharingUserId === user.id}
                    onClick={() => handleShareToDm(user.id, user.username)}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Kirim
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-surface-800 pt-3">
          <Button
            variant="ghost"
            size="md"
            fullWidth
            loading={isCopying}
            onClick={handleCopyLink}
            leftIcon={<Link2 className="h-4 w-4" />}
          >
            Salin Tautan Saja
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SharePostModal;
