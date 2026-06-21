import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import {
  searchUsers,
  searchHashtags,
  getHashtagPosts,
  getProfileByUsername,
  followUser,
  unfollowUser,
} from '../services';
import type { User, Post } from '../types/index';
import type { FollowStatus } from '../types/social';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import Input from '../components/common/Input';
import FollowButton from '../components/common/FollowButton';
import EmptyState from '../components/common/EmptyState';
import { Search, Hash, Users as UsersIcon, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/common/Toast';

// ============================================================
// Constants
// ============================================================

const TRENDING_TAGS = ['twistgram', 'photography', 'travel', 'music', 'tech'];

// ============================================================
// Component
// ============================================================

const SearchPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  // Search parameters
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'hashtags'>('users');
  
  // Search results
  const [usersResult, setUsersResult] = useState<User[]>([]);
  const [tagsResult, setTagsResult] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchRetry, setSearchRetry] = useState(0);
  const [followTrigger, setFollowTrigger] = useState(0);
  const [followStatusMap, setFollowStatusMap] = useState<Record<string, FollowStatus>>({});

  const getFollowStatus = (targetUserId: string): FollowStatus =>
    followStatusMap[targetUserId] ?? 'not_following';

  const handleFollow = async (targetUserId: string) => {
    try {
      await followUser(currentUser!.id, targetUserId);
      toast.success('Berhasil mengikuti!');
      setFollowTrigger(prev => prev + 1);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengikuti.');
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      await unfollowUser(currentUser!.id, targetUserId);
      toast.success('Batal mengikuti.');
      setFollowTrigger(prev => prev + 1);
    } catch (err: any) {
      toast.error(err.message || 'Gagal batal mengikuti.');
    }
  };

  // Selected Hashtag view (Explore-style grid)
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagPosts, setTagPosts] = useState<Post[]>([]);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [tagError, setTagError] = useState('');

  // Default suggestions
  const [defaultUsers, setDefaultUsers] = useState<User[]>([]);
  const [defaultSuggestionsError, setDefaultSuggestionsError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const loadFollowStatuses = async () => {
      const uniqueUsers = [...usersResult, ...defaultUsers];
      if (uniqueUsers.length === 0) {
        setFollowStatusMap({});
        return;
      }

      const entries = await Promise.all(
        uniqueUsers.map(async (user) => {
          try {
            const profile = await getProfileByUsername(user.username, currentUser.id);
            return [user.id, profile.follow_status] as const;
          } catch {
            return [user.id, 'not_following'] as const;
          }
        })
      );

      setFollowStatusMap(Object.fromEntries(entries));
    };

    loadFollowStatuses();
  }, [currentUser, usersResult, defaultUsers, followTrigger]);

  // Load default user recommendations
  useEffect(() => {
    if (!currentUser) return;
    const fetchDefaultSuggestions = async () => {
      try {
        setDefaultSuggestionsError('');
        const candidateUsernames = ['claraclarissa', 'andiwirawan', 'sitirahayu', 'budisantoso'];
        const suggestions = await Promise.all(
          candidateUsernames
            .filter(username => username !== currentUser.username)
            .map(async (username) => {
              try {
                const profile = await getProfileByUsername(username, currentUser.id);
                return {
                  id: profile.id,
                  name: profile.name,
                  username: profile.username,
                  email: profile.email,
                  phone: profile.phone,
                  phone_verified: profile.phone_verified,
                  email_verified: profile.email_verified,
                  bio: profile.bio,
                  avatar_url: profile.avatar_url,
                  is_private: profile.is_private,
                  created_at: profile.created_at,
                  updated_at: profile.updated_at,
                } as User;
              } catch {
                return null;
              }
            })
        );

        setDefaultUsers(suggestions.filter(Boolean).slice(0, 4) as User[]);
      } catch {
        setDefaultSuggestionsError('Gagal memuat saran pengguna.');
      }
    };
    fetchDefaultSuggestions();
  }, [currentUser, followTrigger]);

  // Search trigger with debounce simulation
  useEffect(() => {
    if (!currentUser) return;
    
    const triggerSearch = async () => {
      const q = query.trim();
      if (!q) {
        setUsersResult([]);
        setTagsResult([]);
        return;
      }

      setIsLoading(true);
      setSearchError('');
      try {
        if (activeTab === 'users') {
          const res = await searchUsers(q, currentUser.id);
          setUsersResult(res);
        } else {
          const res = await searchHashtags(q);
          setTagsResult(res);
        }
      } catch {
        setSearchError('Gagal memuat hasil pencarian.');
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      triggerSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, activeTab, currentUser, followTrigger, searchRetry]);

  // Early return after all hooks — safe per React Rules of Hooks
  if (!currentUser) return null;

  // Load posts for selected tag
  const handleTagClick = async (tag: string) => {
    if (!currentUser) return;
    setSelectedTag(tag);
    setIsTagLoading(true);
    setTagError('');
    try {
      const posts = await getHashtagPosts(tag, currentUser.id);
      setTagPosts(posts);
    } catch {
      setTagError('Gagal memuat kiriman untuk tagar ini.');
    } finally {
      setIsTagLoading(false);
    }
  };

  // Render Hashtag Explore Grid View
  if (selectedTag) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6 animate-fade-in text-left">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-surface-900 pb-4">
          <button
            onClick={() => {
              setSelectedTag(null);
              setTagPosts([]);
            }}
            className="p-1.5 rounded-xl bg-surface-900 border border-surface-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-neutral-100 flex items-center gap-1.5 select-none">
              <Hash className="h-5 w-5 text-brand-400" />
              {selectedTag}
            </h1>
            <span className="text-xs text-neutral-400">
              {isTagLoading ? 'Menghitung...' : `${tagPosts.length} kiriman`}
            </span>
          </div>
        </div>

        {/* Explore Grid */}
        {isTagLoading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" className="text-brand-500" />
          </div>
        ) : tagError ? (
          <EmptyState
            icon={<Hash className="h-12 w-12" />}
            title="Tagar gagal dimuat"
            description={tagError}
            actionLabel="Coba Lagi"
            onAction={() => void handleTagClick(selectedTag)}
          />
        ) : tagPosts.length === 0 ? (
          <EmptyState
            icon={<Hash className="h-12 w-12" />}
            title="Tidak ada kiriman"
            description={`Belum ada kiriman publik dengan tag #${selectedTag} saat ini.`}
          />
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
            {tagPosts.map(post => {
              const media = post.media && post.media[0];
              if (!media) return null;
              return (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="relative aspect-square rounded-xl bg-surface-900 overflow-hidden group border border-surface-800/80 shadow-sm"
                >
                  {media.media_type === 'video' ? (
                    <video src={media.media_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={media.media_url} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  {/* Hover stats overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white text-xs sm:text-sm font-bold transition-opacity duration-200">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 fill-white" />
                      {post.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 fill-white" />
                      {post.comments_count || 0}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-6 flex flex-col gap-6 text-left">
      {/* Search Input bar */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-extrabold text-neutral-100 select-none">Pencarian</h1>
        <div className="relative">
          <Input
            id="search-input"
            placeholder="Cari pengguna atau tagar..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-11"
            autoFocus
          />
          <span className="absolute left-3.5 top-[13px] text-neutral-500 pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-800">
        <button
          onClick={() => {
            setActiveTab('users');
            setSelectedTag(null);
          }}
          className={[
            'flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2',
            activeTab === 'users'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          ].join(' ')}
        >
          <UsersIcon className="h-4 w-4" />
          Pengguna
        </button>
        <button
          onClick={() => {
            setActiveTab('hashtags');
            setSelectedTag(null);
          }}
          className={[
            'flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2',
            activeTab === 'hashtags'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          ].join(' ')}
        >
          <Hash className="h-4 w-4" />
          Tagar (#)
        </button>
      </div>

      {/* Results / Default State */}
      <div className="flex-1 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="md" className="text-brand-500" />
          </div>
        ) : searchError ? (
          <EmptyState
            icon={activeTab === 'users' ? <UsersIcon className="h-10 w-10" /> : <Hash className="h-10 w-10" />}
            title="Pencarian gagal dimuat"
            description={searchError}
            actionLabel="Coba Lagi"
            onAction={() => setSearchRetry(prev => prev + 1)}
          />
        ) : query.trim() ? (
          // Active Search Results
          activeTab === 'users' ? (
            usersResult.length === 0 ? (
              <EmptyState
                icon={<UsersIcon className="h-10 w-10" />}
                title="Pengguna tidak ditemukan"
                description="Coba gunakan nama atau username lain."
              />
            ) : (
              <div className="flex flex-col gap-4">
                {usersResult.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3.5 bg-surface-900 border border-surface-800/80 rounded-xl">
                    <Link to={`/profile/${user.username}`} className="flex items-center gap-3 group">
                      <Avatar src={user.avatar_url} name={user.name} size="md" />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-neutral-100 group-hover:text-brand-400 transition-colors">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          @{user.username}
                        </span>
                      </div>
                    </Link>
                    <FollowButton
                      followStatus={getFollowStatus(user.id)}
                      onFollow={() => handleFollow(user.id)}
                      onUnfollow={() => handleUnfollow(user.id)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            tagsResult.length === 0 ? (
              <EmptyState
                icon={<Hash className="h-10 w-10" />}
                title="Tagar tidak ditemukan"
                description="Belum ada postingan dengan tagar ini."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {tagsResult.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="flex items-center justify-between p-3.5 w-full bg-surface-900 border border-surface-800 hover:bg-surface-800/80 text-left rounded-xl transition-all"
                  >
                    <span className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700/80 flex items-center justify-center shrink-0">
                        <Hash className="h-4.5 w-4.5 text-brand-400" />
                      </span>
                      #{tag}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase">Pilih</span>
                  </button>
                ))}
              </div>
            )
          )
        ) : (
          // Default State (Trending tags & Recommended users)
          <div className="flex flex-col gap-6">
            {activeTab === 'users' ? (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider select-none">Saran Pengguna</span>
                {defaultSuggestionsError ? (
                  <EmptyState
                    icon={<UsersIcon className="h-10 w-10" />}
                    title="Saran gagal dimuat"
                    description={defaultSuggestionsError}
                    actionLabel="Coba Lagi"
                    onAction={() => setFollowTrigger(prev => prev + 1)}
                  />
                ) : (
                  defaultUsers.length === 0 ? (
                    <EmptyState
                      icon={<UsersIcon className="h-10 w-10" />}
                      title="Belum ada saran pengguna"
                      description="Saran akun yang relevan akan muncul di sini."
                    />
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {defaultUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3.5 bg-surface-900 border border-surface-800/60 rounded-xl">
                          <Link to={`/profile/${user.username}`} className="flex items-center gap-3 group">
                            <Avatar src={user.avatar_url} name={user.name} size="md" />
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-neutral-100 group-hover:text-brand-400 transition-colors">
                                {user.name}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                @{user.username}
                              </span>
                            </div>
                          </Link>
                          <FollowButton
                            followStatus={getFollowStatus(user.id)}
                            onFollow={() => handleFollow(user.id)}
                            onUnfollow={() => handleUnfollow(user.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider select-none">Tagar Populer</span>
                <div className="flex flex-col gap-2">
                  {TRENDING_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="flex items-center justify-between p-3.5 w-full bg-surface-900 border border-surface-800 hover:bg-surface-800/80 text-left rounded-xl transition-all"
                    >
                      <span className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700/80 flex items-center justify-center shrink-0">
                          <Hash className="h-4.5 w-4.5 text-brand-400" />
                        </span>
                        #{tag}
                      </span>
                      <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wide">Tren</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
