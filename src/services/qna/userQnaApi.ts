import { apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaPostInput } from '../../types/decisionRoom';
import { getMockQaPostsForUser } from '../../mocks/decisionRoom.mock';
import { getStoredUser } from '../auth';

const USER_QNA_BASE = '/api/posts/qna';
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

const toQaPost = (post: PostResponse, fallbackAuthor?: string): QaPost => {
  const author =
    post.userName ||
    post.name ||
    post.author ||
    fallbackAuthor ??
    (post.userId !== undefined ? String(post.userId) : 'User');
  const status =
    (post.replies?.length ?? 0) > 0 ||
    (post.status ?? '').toLowerCase().includes('answered')
      ? 'answered'
      : 'pending';

  return {
    id: String(post.id),
    userId: post.userId,
    title: post.title,
    body: post.content,
    author,
    createdAt: post.createdAt ?? new Date().toISOString(),
    updatedAt: post.updatedAt,
    status,
    tags: post.tags ?? [],
    replies: post.replies ?? [],
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
      lastFallback = false;
      return items.map((item) => toQaPost(item, currentUser?.name));
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
    return toQaPost(response, input.author);
  },
  wasFallback: (): boolean => lastFallback,
};
