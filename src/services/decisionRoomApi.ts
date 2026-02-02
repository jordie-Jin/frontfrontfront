// 의사결정룸 API 호출을 위한 서비스 레이어입니다.
import {
  Bulletin,
  QaPost,
  QaPostInput,
  QaReply,
  QaReplyInput,
} from '../types/decisionRoom';
import { getMockBulletins, getMockQaPosts } from '../mocks/decisionRoom.mock';

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
  // TODO: Replace with real API call when backend is available.
  // Example:
  // const response = await fetch('/api/decision-room/qa');
  // if (!response.ok) throw new Error('Failed to fetch Q&A posts');
  // return response.json() as Promise<QaPost[]>;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...qaStore]);
    }, 450);
  });
}

export async function createQaPost(input: QaPostInput): Promise<QaPost> {
  // TODO: Replace with real API call when backend is available.
  // Example:
  // const response = await fetch('/api/decision-room/qa', { method: 'POST', body: JSON.stringify(input) });
  // if (!response.ok) throw new Error('Failed to create Q&A post');
  // return response.json() as Promise<QaPost>;
  const created: QaPost = {
    id: `qa-${Date.now()}`,
    title: input.title,
    body: input.body,
    author: input.author,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'pending',
    replies: [],
  };

  qaStore = [created, ...qaStore];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(created);
    }, 300);
  });
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
