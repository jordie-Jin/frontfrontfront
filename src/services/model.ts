import { httpPost } from './http';
import { ModelRunRequest, ModelRunResponse } from '../types/model';

export const runModel = async (payload: ModelRunRequest): Promise<ModelRunResponse> => {
  return httpPost<ModelRunResponse, ModelRunRequest>('/api/model/run', payload);
};
