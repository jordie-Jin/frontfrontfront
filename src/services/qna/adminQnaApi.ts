import { apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaReply, QaReplyInput } from '../../types/decisionRoom';
import { getMockQaPostsForAdmin } from '../../mocks/decisionRoom.mock';

const ADMIN_QNA_BASE = '/api/admin/qna';
let lastFallback = false;

export const adminQnaApi = {
  listPosts: async (): Promise<QaPost[]> => {
    lastFallback = false;
    try {
      return await apiGet<QaPost[]>(ADMIN_QNA_BASE);
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
  wasFallback: (): boolean => lastFallback,
};
