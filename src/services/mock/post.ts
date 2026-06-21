/**
 * Mock Post Service
 * Ref: SRS §5.1-5.4, §10.5-10.11 (DB schema)
 *      API contracts: §11.4 (Posts & Feed), §11.5 (Interactions)
 */

import { delay } from '../../utils';
import type { User, Post, PostMedia, Comment, SavedPost } from '../../types/index';
import { getFollowing, getInterests } from './social';
import { getMockUserById, mockDb, persistMockDb } from './database';

interface MockLike {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

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

const getPostsDb = (): Post[] => mockDb.posts;
const getMediaDb = (): PostMedia[] => mockDb.postMedia;
const getCommentsDb = (): Comment[] => mockDb.comments;
const getLikesDb = (): MockLike[] => mockDb.likes as MockLike[];
const getSavedDb = (): SavedPost[] => mockDb.savedPosts;

const enrichPost = (post: Post, currentUserId: string): Post => {
  const media = getMediaDb().filter((entry) => entry.post_id === post.id);
  const likes = getLikesDb().filter((entry) => entry.post_id === post.id);
  const comments = getCommentsDb().filter((entry) => entry.post_id === post.id && !entry.deleted_at);
  const saves = getSavedDb().filter((entry) => entry.post_id === post.id);

  return {
    ...post,
    user: normalizeUser(post.user_id),
    media,
    likes_count: likes.length,
    comments_count: comments.length,
    is_liked: likes.some((entry) => entry.user_id === currentUserId),
    is_saved: saves.some((entry) => entry.user_id === currentUserId),
  };
};

export const getFeed = async (currentUserId: string): Promise<Post[]> => {
  await delay(500);

  const posts = getPostsDb().filter((post) => !post.deleted_at && !post.is_archived);

  let followingUserIds: string[] = [];
  try {
    const following = await getFollowing(currentUserId, currentUserId);
    followingUserIds = following.map((user) => user.id);
  } catch {
    // ignore
  }

  let userInterests: string[] = [];
  try {
    userInterests = await getInterests(currentUserId);
  } catch {
    // ignore
  }

  const followedPosts = posts.filter(
    (post) => followingUserIds.includes(post.user_id) || post.user_id === currentUserId
  );

  let filtered = followedPosts;
  if (filtered.length === 0) {
    filtered = posts.filter((post) => !normalizeUser(post.user_id).is_private);

    if (userInterests.length > 0) {
      filtered.sort((postA, postB) => {
        const hashtagsA = postA.caption?.toLowerCase().match(/#[a-z0-9_]+/g) || [];
        const hashtagsB = postB.caption?.toLowerCase().match(/#[a-z0-9_]+/g) || [];

        const matchesA = hashtagsA.some((tag) =>
          userInterests.some((interest) => interest.toLowerCase() === tag.replace('#', ''))
        );
        const matchesB = hashtagsB.some((tag) =>
          userInterests.some((interest) => interest.toLowerCase() === tag.replace('#', ''))
        );

        if (matchesA && !matchesB) return -1;
        if (!matchesA && matchesB) return 1;
        return 0;
      });
    }
  } else {
    filtered.sort(
      (postA, postB) =>
        new Date(postB.created_at).getTime() - new Date(postA.created_at).getTime()
    );
  }

  return filtered.map((post) => enrichPost(post, currentUserId));
};

export const createPost = async (
  currentUserId: string,
  payload: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }
): Promise<Post> => {
  await delay(600);

  const newPostId = `post-${Date.now()}`;
  const newPost: Post = {
    id: newPostId,
    user_id: currentUserId,
    caption: payload.caption,
    is_archived: false,
    created_at: new Date().toISOString(),
  };

  const newMedia: PostMedia = {
    id: `media-${Date.now()}`,
    post_id: newPostId,
    media_url: payload.mediaUrl,
    media_type: payload.mediaType,
  };

  getPostsDb().unshift(newPost);
  getMediaDb().push(newMedia);
  mockDb.postCounts[currentUserId] = (mockDb.postCounts[currentUserId] ?? 0) + 1;
  persistMockDb();

  return enrichPost(newPost, currentUserId);
};

export const getPostById = async (postId: string, currentUserId: string): Promise<Post> => {
  await delay(400);

  const post = getPostsDb().find((entry) => entry.id === postId && !entry.deleted_at);
  if (!post) throw new Error('Postingan tidak ditemukan.');

  const author = normalizeUser(post.user_id);
  if (author.is_private && post.user_id !== currentUserId) {
    let followingUserIds: string[] = [];
    try {
      const following = await getFollowing(currentUserId, currentUserId);
      followingUserIds = following.map((user) => user.id);
    } catch {
      // ignore
    }
    if (!followingUserIds.includes(post.user_id)) {
      throw new Error('Postingan ini bersifat privat.');
    }
  }

  return enrichPost(post, currentUserId);
};

export const updatePostCaption = async (
  postId: string,
  currentUserId: string,
  caption: string
): Promise<Post> => {
  await delay(400);

  const posts = getPostsDb();
  const index = posts.findIndex((post) => post.id === postId && !post.deleted_at);
  if (index === -1) throw new Error('Postingan tidak ditemukan.');
  if (posts[index].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk mengedit postingan ini.');
  }

  posts[index].caption = caption;
  persistMockDb();
  return enrichPost(posts[index], currentUserId);
};

export const deletePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(500);

  const posts = getPostsDb();
  const index = posts.findIndex((post) => post.id === postId && !post.deleted_at);
  if (index === -1) throw new Error('Postingan tidak ditemukan.');
  if (posts[index].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk menghapus postingan ini.');
  }

  posts[index].deleted_at = new Date().toISOString();
  mockDb.postCounts[currentUserId] = Math.max(0, (mockDb.postCounts[currentUserId] ?? 1) - 1);
  persistMockDb();
};

export const archivePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(400);

  const post = getPostsDb().find((entry) => entry.id === postId && !entry.deleted_at);
  if (!post) throw new Error('Postingan tidak ditemukan.');
  if (post.user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk mengarsipkan postingan ini.');
  }

  post.is_archived = true;
  persistMockDb();
};

export const unarchivePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(400);

  const post = getPostsDb().find((entry) => entry.id === postId && !entry.deleted_at);
  if (!post) throw new Error('Postingan tidak ditemukan.');
  if (post.user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk membuka arsip postingan ini.');
  }

  post.is_archived = false;
  persistMockDb();
};

export const getUserPosts = async (
  targetUserId: string,
  currentUserId: string
): Promise<Post[]> => {
  await delay(500);

  const author = normalizeUser(targetUserId);
  if (author.is_private && targetUserId !== currentUserId) {
    let followingUserIds: string[] = [];
    try {
      const following = await getFollowing(currentUserId, currentUserId);
      followingUserIds = following.map((user) => user.id);
    } catch {
      // ignore
    }
    if (!followingUserIds.includes(targetUserId)) {
      return [];
    }
  }

  const posts = getPostsDb()
    .filter(
      (post) =>
        post.user_id === targetUserId &&
        !post.deleted_at &&
        (!post.is_archived || targetUserId === currentUserId)
    )
    .map((post) => enrichPost(post, currentUserId));

  posts.sort(
    (postA, postB) =>
      new Date(postB.created_at).getTime() - new Date(postA.created_at).getTime()
  );
  return posts;
};

export const likePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const likes = getLikesDb();
  const alreadyLiked = likes.some(
    (like) => like.user_id === currentUserId && like.post_id === postId
  );

  if (!alreadyLiked) {
    likes.push({
      id: `like-${Date.now()}`,
      user_id: currentUserId,
      post_id: postId,
      created_at: new Date().toISOString(),
    });
    persistMockDb();

    try {
      const post = getPostsDb().find((entry) => entry.id === postId);
      if (post) {
        const { createNotification } = await import('./notification');
        await createNotification(post.user_id, currentUserId, 'like', postId);
      }
    } catch {
      // ignore mock notification failure
    }
  }
};

export const unlikePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const likes = getLikesDb();
  const filtered = likes.filter(
    (like) => !(like.user_id === currentUserId && like.post_id === postId)
  );
  likes.splice(0, likes.length, ...filtered);
  persistMockDb();
};

export const getPostComments = async (
  postId: string,
  _currentUserId: string
): Promise<Comment[]> => {
  await delay(400);

  const postComments = getCommentsDb().filter(
    (comment) => comment.post_id === postId && !comment.deleted_at
  );

  const enrichComment = (comment: Comment): Comment => ({
    ...comment,
    user: normalizeUser(comment.user_id),
  });

  const rootComments = postComments
    .filter((comment) => !comment.parent_comment_id)
    .map(enrichComment);
  const replies = postComments
    .filter((comment) => comment.parent_comment_id)
    .map(enrichComment);

  const result = rootComments.map((parent) => ({
    ...parent,
    replies: replies.filter((reply) => reply.parent_comment_id === parent.id),
  }));

  result.sort(
    (commentA, commentB) =>
      new Date(commentB.created_at).getTime() - new Date(commentA.created_at).getTime()
  );
  return result;
};

export const createComment = async (
  postId: string,
  currentUserId: string,
  payload: { content: string; parentCommentId?: string }
): Promise<Comment> => {
  await delay(400);

  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    post_id: postId,
    user_id: currentUserId,
    parent_comment_id: payload.parentCommentId,
    content: payload.content.trim(),
    created_at: new Date().toISOString(),
  };

  getCommentsDb().push(newComment);
  persistMockDb();

  try {
    const post = getPostsDb().find((entry) => entry.id === postId);
    if (post) {
      const { createNotification } = await import('./notification');
      await createNotification(post.user_id, currentUserId, 'comment', postId);
    }
  } catch {
    // ignore mock notification failure
  }

  return {
    ...newComment,
    user: normalizeUser(currentUserId),
    replies: [],
  };
};

export const deleteComment = async (commentId: string, currentUserId: string): Promise<void> => {
  await delay(400);

  const comments = getCommentsDb();
  const index = comments.findIndex(
    (comment) => comment.id === commentId && !comment.deleted_at
  );
  if (index === -1) throw new Error('Komentar tidak ditemukan.');

  if (comments[index].user_id !== currentUserId) {
    const post = getPostsDb().find((entry) => entry.id === comments[index].post_id);
    if (!post || post.user_id !== currentUserId) {
      throw new Error('Anda tidak memiliki wewenang untuk menghapus komentar ini.');
    }
  }

  comments[index].deleted_at = new Date().toISOString();
  persistMockDb();
};

export const savePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const saves = getSavedDb();
  const alreadySaved = saves.some(
    (savedPost) => savedPost.user_id === currentUserId && savedPost.post_id === postId
  );

  if (!alreadySaved) {
    saves.push({
      id: `save-${Date.now()}`,
      user_id: currentUserId,
      post_id: postId,
      created_at: new Date().toISOString(),
    });
    persistMockDb();
  }
};

export const unsavePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const saves = getSavedDb();
  const filtered = saves.filter(
    (savedPost) => !(savedPost.user_id === currentUserId && savedPost.post_id === postId)
  );
  saves.splice(0, saves.length, ...filtered);
  persistMockDb();
};

export const getUserSavedPosts = async (currentUserId: string): Promise<Post[]> => {
  await delay(500);

  const savedPostIds = getSavedDb()
    .filter((savedPost) => savedPost.user_id === currentUserId)
    .map((savedPost) => savedPost.post_id);

  const posts = getPostsDb()
    .filter((post) => savedPostIds.includes(post.id) && !post.deleted_at)
    .map((post) => enrichPost(post, currentUserId));

  posts.sort(
    (postA, postB) =>
      new Date(postB.created_at).getTime() - new Date(postA.created_at).getTime()
  );
  return posts;
};

export const sharePost = async (postId: string, _currentUserId: string): Promise<string> => {
  await delay(300);
  console.info('[Mock Share Post]', postId);
  return `${window.location.origin}/posts/${postId}`;
};
