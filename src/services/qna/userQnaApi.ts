import { apiGet, apiPost, ApiRequestError } from '../../api/client';
import { QaPost, QaPostInput } from '../../types/decisionRoom';
import { getMockQaPostsForUser } from '../../mocks/decisionRoom.mock';
import { getStoredUser } from '../auth';

const USER_QNA_BASE = '/api/qna';
let lastFallback = false;

export const userQnaApi = {
  listPosts: async (): Promise<QaPost[]> => {
    lastFallback = false;
    try {
      return await apiGet<QaPost[]>(USER_QNA_BASE);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        const status = error.apiError?.status;
        if (status === 401 || status === 403 || status === 500) {
          const currentUser = getStoredUser();
          const fallbackUserId = currentUser?.id ?? 'mock-user';
          lastFallback = true;
          return getMockQaPostsForUser(fallbackUserId);
        }
      }
      throw error;
    }
  },

  createPost: async (input: QaPostInput): Promise<QaPost> =>
    apiPost<QaPost, QaPostInput>(USER_QNA_BASE, input),
  wasFallback: (): boolean => lastFallback,
};
