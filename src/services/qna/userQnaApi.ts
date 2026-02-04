import { apiGet, apiPost } from '../../api/client';
import { QaPost, QaPostInput } from '../../types/decisionRoom';

const USER_QNA_BASE = '/api/qna';

export const userQnaApi = {
  listPosts: async (): Promise<QaPost[]> =>
    apiGet<QaPost[]>(USER_QNA_BASE),

  createPost: async (input: QaPostInput): Promise<QaPost> =>
    apiPost<QaPost, QaPostInput>(USER_QNA_BASE, input),
};
