import { apiGet, apiPost } from '../../api/client';
import { QaPost, QaReply, QaReplyInput } from '../../types/decisionRoom';

const ADMIN_QNA_BASE = '/api/admin/qna';

export const adminQnaApi = {
  listPosts: async (): Promise<QaPost[]> =>
    apiGet<QaPost[]>(ADMIN_QNA_BASE),

  addReply: async (postId: string, input: QaReplyInput): Promise<QaReply> =>
    apiPost<QaReply, QaReplyInput>(`${ADMIN_QNA_BASE}/${postId}/replies`, input),
};
