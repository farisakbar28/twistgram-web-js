/**
 * Mock Chat Service
 * Ref: SRS §7, §11.8
 */

import { delay } from '../../utils';
import type { User, Conversation, Message } from '../../types/index';
import { MOCK_USERS, mockBlocks, mockFollows } from './social';

// ============================================================
// Storage Keys & Initial Data
// ============================================================

const STORAGE_KEYS = {
  CONVERSATIONS: 'twistgram_conversations',
  MESSAGES: 'twistgram_messages',
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    created_at: '2026-06-20T09:00:00Z',
  },
  {
    id: 'conv-002',
    created_at: '2026-06-19T14:00:00Z',
  },
];

const INITIAL_MESSAGES: Message[] = [
  // Conversation with Clara (conv-001)
  {
    id: 'msg-001',
    conversation_id: 'conv-001',
    sender_id: 'user-002', // Clara
    content: 'Hai Faris! Selamat atas pengerjaan Twistgram!',
    created_at: '2026-06-20T09:00:00Z',
  },
  {
    id: 'msg-002',
    conversation_id: 'conv-001',
    sender_id: 'user-001', // Faris
    content: 'Halo Clara! Makasih banyak ya. Ini berkat dukungannya juga.',
    created_at: '2026-06-20T09:05:00Z',
  },
  {
    id: 'msg-003',
    conversation_id: 'conv-001',
    sender_id: 'user-002', // Clara
    content: 'Tentu! Aku suka banget sama styling gradient-nya 💜',
    created_at: '2026-06-20T09:08:00Z',
  },
  
  // Message request from Budi (conv-002) - Budi is private and Faris does not follow him
  {
    id: 'msg-004',
    conversation_id: 'conv-002',
    sender_id: 'user-005', // Budi
    content: 'Halo Faris, bisa tolong review portofolio React aku?',
    created_at: '2026-06-19T14:00:00Z',
  },
];

// Map conversation participants manually for initial seed
// conv-001: user-001 (Faris) & user-002 (Clara)
// conv-002: user-001 (Faris) & user-005 (Budi)
const MOCK_PARTICIPANTS: Record<string, string[]> = {
  'conv-001': ['user-001', 'user-002'],
  'conv-002': ['user-001', 'user-005'],
};

// ============================================================
// Storage Helpers
// ============================================================

const getStorageData = <T>(key: string, initial: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  } catch {
    return initial;
  }
};

const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// Initialize
if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
  setStorageData(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  setStorageData(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  // Simpan relasi partisipan ke local storage
  setStorageData('twistgram_conversation_participants', MOCK_PARTICIPANTS);
}

const getConversationsDb = (): Conversation[] => getStorageData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
const getMessagesDb = (): Message[] => getStorageData<Message[]>(STORAGE_KEYS.MESSAGES, []);
const getParticipantsDb = (): Record<string, string[]> => getStorageData<Record<string, string[]>>('twistgram_conversation_participants', {});

const getUserObject = (userId: string): User => {
  try {
    const raw = localStorage.getItem('twistgram_user');
    if (raw) {
      const u = JSON.parse(raw) as User;
      if (u.id === userId) return u;
    }
  } catch {}
  return MOCK_USERS.find(u => u.id === userId) ?? {
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
};

const isBlocked = (userA: string, userB: string): boolean => {
  return mockBlocks.some(
    b => (b.blocker_id === userA && b.blocked_id === userB) ||
         (b.blocker_id === userB && b.blocked_id === userA)
  );
};

// Cek apakah relasi follow sudah diterima
const isFollowingAccepted = (followerId: string, followingId: string): boolean => {
  return mockFollows.some(
    f => f.follower_id === followerId && f.following_id === followingId && f.status === 'accepted'
  );
};

// ============================================================
// Service Methods
// ============================================================

/**
 * GET /conversations
 * Mendapatkan daftar percakapan milik pengguna.
 * Setiap percakapan akan ditandai apakah berstatus "permintaan" (request).
 */
export interface ConversationWithMeta extends Conversation {
  is_request: boolean;
  unread_count: number;
}

export const getConversations = async (currentUserId: string): Promise<ConversationWithMeta[]> => {
  await delay(400);

  const conversations = getConversationsDb();
  const messages = getMessagesDb();
  const participantsMap = getParticipantsDb();

  const result: ConversationWithMeta[] = [];

  for (const conv of conversations) {
    const participantIds = participantsMap[conv.id] || [];
    if (!participantIds.includes(currentUserId)) continue;

    // Temukan partner chat
    const partnerId = participantIds.find(id => id !== currentUserId);
    if (!partnerId) continue;

    // Filter jika diblokir (MSG-01)
    if (isBlocked(currentUserId, partnerId)) continue;

    const partner = getUserObject(partnerId);
    const user = getUserObject(currentUserId);

    // Ambil pesan terakhir
    const convMessages = messages.filter(m => m.conversation_id === conv.id);
    convMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const lastMessage = convMessages[0];

    // Tentukan folder "Utama" vs "Permintaan Pesan" (MSG-02)
    // Jika partner adalah non-follower (tidak kita ikuti, dan dia tidak mengikuti kita), masukkan ke requests.
    // Atau jika user saat ini privat dan partner tidak berstatus following.
    let isRequest = false;
    if (user.is_private) {
      // Akun privat Faris: pesan dari non-follower masuk requests
      const isFollower = isFollowingAccepted(partnerId, currentUserId);
      if (!isFollower && lastMessage && lastMessage.sender_id !== currentUserId) {
        isRequest = true;
      }
    } else {
      // Akun publik Faris: pesan masuk requests jika Faris tidak follow dia balik AND dia tidak follow Faris
      const weFollow = isFollowingAccepted(currentUserId, partnerId);
      const theyFollow = isFollowingAccepted(partnerId, currentUserId);
      if (!weFollow && !theyFollow && lastMessage && lastMessage.sender_id !== currentUserId) {
        isRequest = true;
      }
    }

    // Unread count (untuk simulasi lencana pesan belum dibaca)
    // Di mock ini, kita asumsikan pesan terakhir belum dibaca jika pengirimnya bukan currentUser
    const unreadCount = lastMessage && lastMessage.sender_id !== currentUserId ? 1 : 0;

    result.push({
      ...conv,
      participants: [getUserObject(currentUserId), partner],
      last_message: lastMessage ? {
        ...lastMessage,
        sender: getUserObject(lastMessage.sender_id)
      } : undefined,
      is_request: isRequest,
      unread_count: unreadCount,
    });
  }

  // Urutkan berdasarkan pesan terakhir terbaru
  result.sort((a, b) => {
    const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
    const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
    return bTime - aTime;
  });

  return result;
};

/**
 * POST /conversations
 * Mulai percakapan baru dengan target user.
 */
export const startConversation = async (currentUserId: string, targetUserId: string): Promise<Conversation> => {
  await delay(300);

  if (isBlocked(currentUserId, targetUserId)) {
    throw new Error('Tidak dapat mengirim pesan kepada pengguna yang diblokir.');
  }

  const conversations = getConversationsDb();
  const participantsMap = getParticipantsDb();

  // Cari apakah percakapan sudah ada
  let existingConvId = '';
  for (const convId of Object.keys(participantsMap)) {
    const ids = participantsMap[convId] || [];
    if (ids.includes(currentUserId) && ids.includes(targetUserId)) {
      existingConvId = convId;
      break;
    }
  }

  if (existingConvId) {
    const conv = conversations.find(c => c.id === existingConvId);
    if (conv) return conv;
  }

  // Buat baru
  const newConvId = `conv-${Date.now()}`;
  const newConv: Conversation = {
    id: newConvId,
    created_at: new Date().toISOString(),
  };

  conversations.push(newConv);
  participantsMap[newConvId] = [currentUserId, targetUserId];

  setStorageData(STORAGE_KEYS.CONVERSATIONS, conversations);
  setStorageData('twistgram_conversation_participants', participantsMap);

  return newConv;
};

/**
 * GET /conversations/:id/messages
 * Daftar pesan riwayat obrolan.
 */
export const getMessages = async (conversationId: string, currentUserId: string): Promise<Message[]> => {
  await delay(300);

  const messages = getMessagesDb();
  const participantsMap = getParticipantsDb();
  const participantIds = participantsMap[conversationId] || [];

  if (!participantIds.includes(currentUserId)) {
    throw new Error('Anda tidak memiliki akses ke percakapan ini.');
  }

  // Filter messages for this conversation
  const convMessages = messages.filter(m => m.conversation_id === conversationId);

  // Map sender information
  const result = convMessages.map(m => ({
    ...m,
    sender: getUserObject(m.sender_id),
  }));

  // Urutkan paling lama ke paling baru (untuk render urutan chat atas ke bawah)
  result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return result;
};

/**
 * POST /conversations/:id/messages
 * Kirim pesan baru.
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  payload: { content?: string; mediaUrl?: string; replyToStoryId?: string }
): Promise<Message> => {
  await delay(300);

  const messages = getMessagesDb();
  const participantsMap = getParticipantsDb();
  const participantIds = participantsMap[conversationId] || [];

  const recipientId = participantIds.find(id => id !== senderId);
  if (!recipientId) throw new Error('Percakapan tidak valid.');

  // MSG-01: Filter block
  if (isBlocked(senderId, recipientId)) {
    throw new Error('Tidak dapat mengirim pesan kepada pengguna ini (blokir aktif).');
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: senderId,
    content: payload.content?.trim() || undefined,
    media_url: payload.mediaUrl?.trim() || undefined,
    reply_to_story_id: payload.replyToStoryId || undefined,
    created_at: new Date().toISOString(),
  };

  messages.push(newMessage);
  setStorageData(STORAGE_KEYS.MESSAGES, messages);

  // Pemicu auto-reply bot Clara/Budi untuk mensimulasikan interaksi nyata di frontend
  const recipient = getUserObject(recipientId);
  if (recipient.id !== 'user-001') {
    setTimeout(async () => {
      try {
        const autoMessages = getMessagesDb();
        const replies = [
          'Keren banget! 👍',
          'Wah, menarik sekali infonya!',
          'Haha, seru banget!',
          'Oke siap, nanti aku kabarin lagi ya.',
          'Halo! Aku sedang sibuk, nanti kuhubungi balik ya.',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        autoMessages.push({
          id: `msg-reply-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: recipientId,
          content: randomReply,
          created_at: new Date().toISOString(),
        });
        setStorageData(STORAGE_KEYS.MESSAGES, autoMessages);

        // Memicu notifikasi in-app
        try {
          const { createNotification } = await import('./notification');
          await createNotification(senderId, recipientId, 'story_reply', newMessage.id);
        } catch {}
      } catch (err) {
        console.error('Auto reply bot error:', err);
      }
    }, 2500);
  }

  return {
    ...newMessage,
    sender: getUserObject(senderId),
  };
};

/**
 * Menghitung total pesan unread di semua percakapan.
 */
export const getUnreadMessagesCount = async (currentUserId: string): Promise<number> => {
  const conversations = await getConversations(currentUserId);
  return conversations.reduce((total, conv) => total + conv.unread_count, 0);
};
