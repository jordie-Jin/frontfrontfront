export type PostStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;

export interface PostItem {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  viewCount: number;
  isPinned: boolean;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PostListData {
  content: PostItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PostListParams extends Record<string, string | number | boolean | undefined> {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PostCreateRequest {
  categoryId: number;
  title: string;
  content: string;
}

export interface PostUpdateRequest {
  categoryId: number;
  title: string;
  content: string;
}
