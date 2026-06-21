/**
 * Mock Story Service
 * Ref: SRS §5.5, §10.12, §10.13, §11.6
 */

import { delay } from '../../utils';
import type { Story, StoryView, User } from '../../types/index';
import { getMockUserById, mockDb, persistMockDb } from './database';

const normalizeUser = (userId: string): User => {
  try {
    const raw = localStorage.getItem('twistgram_user');
    if (raw) {
      const currentUser = JSON.parse(raw) as User & { phone?: string | null; bio?: string | null; avatar_url?: string | null };
      if (currentUser.id === userId) {
        return {
          ...currentUser,
          phone: currentUser.phone ?? undefined,
          bio: currentUser.bio ?? undefined,
          avatar_url: currentUser.avatar_url ?? undefined,
        };
      }
    }
  } catch {
    // ignore
  }

  const user = getMockUserById(userId);
  if (!user) {
    return {
      id: userId,
      name: 'Unknown User',
      username: 'unknown',
      email: 'unknown@example.com',
      phone_verified: false,
      email_verified: true,
      is_private: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    ...user,
    phone: user.phone ?? undefined,
    bio: user.bio ?? undefined,
    avatar_url: user.avatar_url ?? undefined,
  };
};

const getStoriesDb = (): Story[] => mockDb.stories;
const getViewsDb = (): StoryView[] => mockDb.storyViews;

const isStoryActive = (story: Story): boolean => new Date(story.expires_at) > new Date();

const enrichStory = (story: Story, currentUserId: string): Story => {
  const views = getViewsDb().filter((view) => view.story_id === story.id);
  return {
    ...story,
    user: normalizeUser(story.user_id),
    views_count: views.length,
    is_viewed: views.some((view) => view.viewer_id === currentUserId),
  };
};

export interface StoryGroup {
  user: User;
  stories: Story[];
  hasUnviewed: boolean;
}

export const getStoryFeed = async (currentUserId: string): Promise<StoryGroup[]> => {
  await delay(400);

  let followingIds: string[] = [];
  try {
    const { getFollowing } = await import('./social');
    const following = await getFollowing(currentUserId, currentUserId);
    followingIds = following.map((user) => user.id);
  } catch {
    // ignore
  }

  const activeStories = getStoriesDb().filter(isStoryActive);
  const grouped = new Map<string, Story[]>();

  const ownStories = activeStories.filter((story) => story.user_id === currentUserId);
  if (ownStories.length > 0) {
    grouped.set(currentUserId, ownStories.map((story) => enrichStory(story, currentUserId)));
  }

  for (const story of activeStories) {
    if (story.user_id === currentUserId || !followingIds.includes(story.user_id)) continue;
    const existing = grouped.get(story.user_id) ?? [];
    grouped.set(story.user_id, [...existing, enrichStory(story, currentUserId)]);
  }

  if (grouped.size <= (ownStories.length > 0 ? 1 : 0)) {
    for (const story of activeStories) {
      if (story.user_id === currentUserId) continue;
      if (normalizeUser(story.user_id).is_private) continue;
      const existing = grouped.get(story.user_id) ?? [];
      grouped.set(story.user_id, [...existing, enrichStory(story, currentUserId)]);
    }
  }

  const result: StoryGroup[] = [];
  for (const [userId, stories] of grouped.entries()) {
    stories.sort(
      (storyA, storyB) =>
        new Date(storyA.created_at).getTime() - new Date(storyB.created_at).getTime()
    );
    result.push({
      user: normalizeUser(userId),
      stories,
      hasUnviewed: stories.some((story) => !story.is_viewed),
    });
  }

  result.sort((groupA, groupB) => {
    if (groupA.user.id === currentUserId) return -1;
    if (groupB.user.id === currentUserId) return 1;
    if (groupA.hasUnviewed && !groupB.hasUnviewed) return -1;
    if (!groupA.hasUnviewed && groupB.hasUnviewed) return 1;
    return 0;
  });

  return result;
};

export const getStoryById = async (storyId: string, currentUserId: string): Promise<Story> => {
  await delay(300);
  const story = getStoriesDb().find((entry) => entry.id === storyId);
  if (!story) throw new Error('Story tidak ditemukan.');
  if (!isStoryActive(story)) throw new Error('Story ini sudah kedaluwarsa.');
  return enrichStory(story, currentUserId);
};

export const markStoryViewed = async (storyId: string, currentUserId: string): Promise<void> => {
  await delay(200);
  const alreadyViewed = getViewsDb().some(
    (view) => view.story_id === storyId && view.viewer_id === currentUserId
  );
  if (!alreadyViewed) {
    getViewsDb().push({
      id: `view-${Date.now()}`,
      story_id: storyId,
      viewer_id: currentUserId,
      viewed_at: new Date().toISOString(),
    });
    persistMockDb();
  }
};

export const getStoryViewers = async (
  storyId: string,
  currentUserId: string
): Promise<StoryView[]> => {
  await delay(300);
  const story = getStoriesDb().find((entry) => entry.id === storyId);
  if (!story) throw new Error('Story tidak ditemukan.');
  if (story.user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki akses ke daftar penonton story ini.');
  }

  return getViewsDb()
    .filter((view) => view.story_id === storyId)
    .map((view) => ({
      ...view,
      viewer: normalizeUser(view.viewer_id),
    }));
};

export const createStory = async (
  currentUserId: string,
  payload: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
  }
): Promise<Story> => {
  await delay(600);

  if (payload.mediaType === 'text' && !payload.textContent?.trim()) {
    throw new Error('Konten teks tidak boleh kosong untuk story teks.');
  }
  if (payload.mediaType !== 'text' && !payload.mediaUrl?.trim()) {
    throw new Error('URL media wajib diisi untuk story foto/video.');
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const newStory: Story = {
    id: `story-${Date.now()}`,
    user_id: currentUserId,
    media_url: payload.mediaUrl?.trim() || undefined,
    media_type: payload.mediaType,
    text_content: payload.textContent?.trim() || undefined,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };

  getStoriesDb().push(newStory);
  persistMockDb();

  return enrichStory(newStory, currentUserId);
};

export const deleteStory = async (storyId: string, currentUserId: string): Promise<void> => {
  await delay(400);
  const stories = getStoriesDb();
  const index = stories.findIndex((story) => story.id === storyId);
  if (index === -1) throw new Error('Story tidak ditemukan.');
  if (stories[index].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk menghapus story ini.');
  }

  stories.splice(index, 1);
  persistMockDb();
};

export const hasActiveStory = async (userId: string): Promise<boolean> => {
  await delay(100);
  return getStoriesDb().some((story) => story.user_id === userId && isStoryActive(story));
};
