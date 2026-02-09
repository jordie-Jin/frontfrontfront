import { apiDelete, apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaReply, QaReplyInput } from '../../types/decisionRoom';
import { getMockQaPostsForAdmin } from '../../mocks/decisionRoom.mock';

const ADMIN_QNA_BASE = '/api/admin/posts/qna';
const ADMIN_POST_BASE = '/api/admin/posts';
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

const toQaPost = (post: PostResponse): QaPost => {
  const author =
    post.userName ||
    post.name ||
    post.author ||
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

export const adminQnaApi = {
  listPosts: async (): Promise<QaPost[]> => {
    try {
      const response = await apiGet<PostResponse[] | { content?: PostResponse[] }>(
        ADMIN_QNA_BASE,
        { page: 1, size: 50 },
      );
      const items = Array.isArray(response) ? response : response.content ?? [];
      lastFallback = false;
      return items.map((item) => toQaPost(item));
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

  addReply: async (postId: string, input: QaReplyInput): Promise<QaReply> =>
    apiPost<QaReply, QaReplyInput>(`${ADMIN_QNA_BASE}/${postId}/replies`, input),
  deletePost: async (categoryName: string, postId: string | number): Promise<void> =>
    apiDelete<void>(`${ADMIN_POST_BASE}/${categoryName}/${postId}`),
  wasFallback: (): boolean => lastFallback,
};
