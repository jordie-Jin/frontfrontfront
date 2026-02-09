import { apiDelete, apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaPostInput } from '../../types/decisionRoom';
import { getMockQaPostsForUser } from '../../mocks/decisionRoom.mock';
import { getStoredUser } from '../auth';

const USER_QNA_BASE = '/api/posts/qna';
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

type ReplyStore = Record<string, QaPost['replies']>;

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

const mergeReplies = (
  postId: string,
  serverReplies: QaPost['replies'],
  store: ReplyStore,
): QaPost['replies'] => {
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

const toQaPost = (post: PostResponse, store: ReplyStore, fallbackAuthor?: string): QaPost => {
  const postId = String(post.id);
  const replies = mergeReplies(postId, post.replies ?? [], store);
  const author =
    post.userName ||
    post.name ||
    post.author ||
    fallbackAuthor ||
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

export const userQnaApi = {
  listPosts: async (): Promise<QaPost[]> => {
    const currentUser = getStoredUser();
    const fallbackUserId = currentUser?.id ?? 'mock-user';
    try {
      const response = await apiGet<PostResponse[] | { content?: PostResponse[] }>(
        USER_QNA_BASE,
        { page: 1, size: 50 },
      );
      const items = Array.isArray(response) ? response : response.content ?? [];
      const store = readStoredReplies();
      lastFallback = false;
      return items.map((item) => toQaPost(item, store, currentUser?.name));
    } catch (error) {
      if (error instanceof ApiRequestError) {
        const status = error.apiError?.status;
        if (status === 401 || status === 403 || status === 500) {
          lastFallback = true;
          return getMockQaPostsForUser(fallbackUserId);
        }
      }
      throw error;
    }
  },

  createPost: async (input: QaPostInput): Promise<QaPost> => {
    const response = await apiPost<PostResponse, { title: string; content: string }>(
      USER_QNA_BASE,
      {
        title: input.title,
        content: input.body,
      },
    );
    return toQaPost(response, readStoredReplies(), input.author);
  },
  deletePost: async (postId: string, categoryName = 'qna'): Promise<void> =>
    apiDelete<void>(`/api/posts/${categoryName}/${postId}`),
  wasFallback: (): boolean => lastFallback,
};
