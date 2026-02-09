import { apiDelete, apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaReply, QaReplyInput } from '../../types/decisionRoom';
import { getMockQaPostsForAdmin } from '../../mocks/decisionRoom.mock';

const ADMIN_POST_BASE = '/api/admin/posts';
const QNA_CATEGORY = 'qna';
const ADMIN_REPLY_STORAGE_KEY = 'sentinel:qna:admin-replies:v1';
let lastFallback = false;

type PostResponse = {
  id: string | number;
  userId?: string | number;
  userName?: string;
  name?: string;
  author?: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  replies?: QaPost['replies'];
  tags?: string[];
};

type ReplyStore = Record<string, QaReply[]>;

const readStoredReplies = (): ReplyStore => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ADMIN_REPLY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ReplyStore;
  } catch (error) {
    return {};
  }
};

const writeStoredReplies = (store: ReplyStore): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADMIN_REPLY_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    // 저장소 쓰기 실패 시에도 기존 동작은 유지합니다.
  }
};

const mergeReplies = (postId: string, serverReplies: QaReply[], store: ReplyStore): QaReply[] => {
  const localReplies = store[postId] ?? [];
  if (localReplies.length === 0) return serverReplies;

  const merged = [...serverReplies];
  localReplies.forEach((reply) => {
    if (!merged.some((item) => item.id === reply.id)) {
      merged.push(reply);
    }
  });
  merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return merged;
};

const appendStoredReply = (postId: string, reply: QaReply): void => {
  const store = readStoredReplies();
  const prev = store[postId] ?? [];
  if (prev.some((item) => item.id === reply.id)) return;
  store[postId] = [...prev, reply];
  writeStoredReplies(store);
};

const toQaPost = (post: PostResponse, store: ReplyStore): QaPost => {
  const postId = String(post.id);
  const replies = mergeReplies(postId, post.replies ?? [], store);
  const author =
    post.userName ||
    post.name ||
    post.author ||
    (post.userId !== undefined ? String(post.userId) : 'User');
  const status =
    replies.length > 0 ||
    (post.status ?? '').toLowerCase().includes('answered')
      ? 'answered'
      : 'pending';

  return {
    id: postId,
    userId: post.userId,
    title: post.title,
    body: post.content,
    author,
    createdAt: post.createdAt ?? new Date().toISOString(),
    updatedAt: post.updatedAt,
    status,
    tags: post.tags ?? [],
    replies,
  };
};

export const adminQnaApi = {
  listPosts: async (): Promise<QaPost[]> => {
    try {
      const response = await apiGet<PostResponse[] | { content?: PostResponse[] }>(
        `${ADMIN_POST_BASE}/${QNA_CATEGORY}`,
        { page: 1, size: 50 },
      );
      const items = Array.isArray(response) ? response : response.content ?? [];
      const store = readStoredReplies();
      lastFallback = false;
      return items.map((item) => toQaPost(item, store));
    } catch (error) {
      if (error instanceof ApiRequestError) {
        const status = error.apiError?.status;
        if (status === 401 || status === 403 || status === 500) {
          lastFallback = true;
          return getMockQaPostsForAdmin();
        }
      }
      throw error;
    }
  },

  addReply: async (postId: string, input: QaReplyInput): Promise<QaReply> => {
    const response = await apiPost<
      {
        id: number | string;
        name?: string;
        postId?: number | string;
        content?: string;
        createdAt?: string;
        updatedAt?: string;
      },
      { content: string }
    >(`${ADMIN_POST_BASE}/${QNA_CATEGORY}/${postId}/replies`, {
      content: input.body,
    });

    const reply = {
      id: String(response.id),
      author: response.name ?? '관리자',
      createdAt: response.createdAt ?? new Date().toISOString(),
      body: response.content ?? input.body,
    };
    appendStoredReply(postId, reply);
    return reply;
  },
  deletePost: async (categoryName: string, postId: string | number): Promise<void> =>
    apiDelete<void>(`${ADMIN_POST_BASE}/${categoryName}/${postId}`),
  wasFallback: (): boolean => lastFallback,
};
