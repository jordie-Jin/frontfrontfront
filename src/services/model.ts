// 모델 관련 API 호출을 위한 서비스 레이어입니다.
import { apiPost } from '../api/client';
import { ModelRunRequest, ModelRunResponse } from '../types/model';

export const runModel = async (payload: ModelRunRequest): Promise<ModelRunResponse> => {
  return apiPost<ModelRunResponse, ModelRunRequest>('/api/model/run', payload);
};
