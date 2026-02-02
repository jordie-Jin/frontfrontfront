// 의사결정룸 데이터 타입 정의입니다.
export type Tab = 'bulletins' | 'qa';

export type BulletinTag = 'URGENT' | 'UPDATE' | 'ADVISORY';

export interface BulletinLink {
  label: string;
  url: string;
}

export interface Bulletin {
  id: string;
  title: string;
  summary: string;
  body: string;
  tag: BulletinTag;
  issuedBy: string;
  date: string;
  links?: BulletinLink[];
}

export type QaStatus = 'pending' | 'answered';

export interface QaReply {
  id: string;
  author: string;
  createdAt: string;
  body: string;
}

export interface QaPost {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  status: QaStatus;
  tags?: string[];
  replies: QaReply[];
}

export interface QaPostInput {
  title: string;
  body: string;
  author: string;
}

export interface QaReplyInput {
  body: string;
  author: string;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
}
