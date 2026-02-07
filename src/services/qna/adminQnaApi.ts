import { apiDelete, apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaReply, QaReplyInput } from '../../types/decisionRoom';
import { getMockQaPostsForAdmin } from '../../mocks/decisionRoom.mock';

const ADMIN_QNA_BASE = '/api/admin/posts/qna';
const ADMIN_POST_BASE = '/api/admin/posts';
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

const toQaPost = (post: PostResponse): QaPost => {
  const author = post.userId !== undefined ? String(post.userId) : 'User';
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

export const adminQnaApi = {
  listPosts: async (): Promise<QaPost[]> => {
    lastFallback = true;
    try {
      await apiGet(ADMIN_QNA_BASE, { page: 1, size: 50 });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        // ignore API errors for now and use mock data
      }
    }
    return getMockQaPostsForAdmin();
  },

  addReply: async (postId: string, input: QaReplyInput): Promise<QaReply> =>
    apiPost<QaReply, QaReplyInput>(`${ADMIN_QNA_BASE}/${postId}/replies`, input),
  deletePost: async (categoryName: string, postId: string | number): Promise<void> =>
    apiDelete<void>(`${ADMIN_POST_BASE}/${categoryName}/${postId}`),
  wasFallback: (): boolean => lastFallback,
};
