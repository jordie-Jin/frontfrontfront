import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import {
  PostCreateRequest,
  PostItem,
  PostListData,
  PostListParams,
  PostUpdateRequest,
} from '../types/post';

export const listPosts = async (params?: PostListParams): Promise<PostListData> => {
  return apiGet<PostListData>('/api/posts', params);
};

export const getPost = async (postId: number | string): Promise<PostItem> => {
  return apiGet<PostItem>(`/api/posts/${postId}`);
};

export const createPost = async (payload: PostCreateRequest): Promise<PostItem> => {
  return apiPost<PostItem, PostCreateRequest>('/api/posts', payload);
};

export const updatePost = async (
  postId: number | string,
  payload: PostUpdateRequest,
): Promise<PostItem> => {
  return apiPatch<PostItem, PostUpdateRequest>(`/api/posts/${postId}`, payload);
};

export const deletePost = async (postId: number | string): Promise<string> => {
  return apiDelete<string>(`/api/posts/${postId}`);
};
