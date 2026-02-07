import { apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaPostInput } from '../../types/decisionRoom';
import { getMockQaPostsForUser } from '../../mocks/decisionRoom.mock';
import { getStoredUser } from '../auth';

const USER_QNA_BASE = '/api/posts/qna';
let lastFallback = false;

type PostResponse = {
  id: string | number;
  userId?: string | number;
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
    lastFallback = true;
    try {
      await apiGet(USER_QNA_BASE, { page: 1, size: 50 });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        // ignore API errors for now and use mock data
      }
    }
    return getMockQaPostsForUser(fallbackUserId);
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
