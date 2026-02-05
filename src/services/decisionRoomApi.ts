// 의사결정룸 API 호출을 위한 서비스 레이어입니다.
import {
  Bulletin,
  QaPost,
  QaPostInput,
  QaReply,
  QaReplyInput,
} from '../types/decisionRoom';
import { getMockBulletins, getMockQaPosts } from '../mocks/decisionRoom.mock';
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  updatePost,
} from '../api/posts';
import { PostItem } from '../types/post';

let qaStore: QaPost[] = getMockQaPosts();

export async function fetchBulletins(mode: 'active' | 'archive'): Promise<Bulletin[]> {
  // TODO: Replace with real API call when backend is available.
  // Example:
  // const response = await fetch(`/api/decision-room/bulletins?mode=${mode}`);
  // if (!response.ok) throw new Error('Failed to fetch bulletins');
  // return response.json() as Promise<Bulletin[]>;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockBulletins(mode));
    }, 450);
  });
}

export async function fetchQaPosts(): Promise<QaPost[]> {
  const response = await listPosts({
    page: 1,
    size: 20,
    sortBy: 'createdAt',
    direction: 'DESC',
  });
  const mapped = response.content.map(mapPostToQaPost);
  qaStore = mapped;
  return mapped;
}

export async function createQaPost(input: QaPostInput): Promise<QaPost> {
  const created = await createPost({
    title: input.title,
    content: input.body,
    categoryId: 1,
  });
  const mapped = mapPostToQaPost(created);
  qaStore = [mapped, ...qaStore];
  return mapped;
}

export async function addQaReply(postId: string, input: QaReplyInput): Promise<QaReply> {
  // TODO: Replace with real API call when backend is available.
  // Example:
  // const response = await fetch(`/api/decision-room/qa/${postId}/replies`, { method: 'POST', body: JSON.stringify(input) });
  // if (!response.ok) throw new Error('Failed to add reply');
  // return response.json() as Promise<QaReply>;
  const reply: QaReply = {
    id: `qa-reply-${Date.now()}`,
    author: input.author,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    body: input.body,
  };

  qaStore = qaStore.map((post) => {
    if (post.id !== postId) return post;
    return {
      ...post,
      replies: [...post.replies, reply],
      status: 'answered',
      updatedAt: reply.createdAt,
    };
  });

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = qaStore.some((post) => post.id === postId);
      if (!exists) {
        reject(new Error('Post not found'));
        return;
      }
      resolve(reply);
    }, 300);
  });
}

export async function fetchQaPostDetail(postId: number | string): Promise<QaPost> {
  const response = await getPost(postId);
  return mapPostToQaPost(response);
}

export async function updateQaPost(
  postId: number | string,
  input: QaPostInput,
): Promise<QaPost> {
  const response = await updatePost(postId, {
    title: input.title,
    content: input.body,
    categoryId: 1,
  });
  const mapped = mapPostToQaPost(response);
  qaStore = qaStore.map((post) => (post.id === String(postId) ? mapped : post));
  return mapped;
}

export async function deleteQaPost(postId: number | string): Promise<void> {
  await deletePost(postId);
  qaStore = qaStore.filter((post) => post.id !== String(postId));
}

const toQaStatus = (value?: string): QaPost['status'] => {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'answered') return 'answered';
  if (normalized === 'pending') return 'pending';
  return 'pending';
};

const mapPostToQaPost = (post: PostItem): QaPost => ({
  id: String(post.id),
  userId: post.userId,
  title: post.title,
  body: post.content,
  author: `User ${post.userId}`,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  status: toQaStatus(post.status),
  tags: post.isPinned ? ['pinned'] : undefined,
  replies: [],
});
