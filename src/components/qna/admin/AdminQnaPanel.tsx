import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminAuthorPanel, { AuthorSort } from '../../decisionRoom/AdminAuthorPanel';
import QaList, { QaStatusFilter } from '../../decisionRoom/QaList';
import QaThread from '../../decisionRoom/QaThread';
import AsyncState from '../../common/AsyncState';
import { QaPost, QaReplyInput } from '../../../types/decisionRoom';

type AdminQnaApi = {
  listPosts: () => Promise<QaPost[]>;
  addReply: (postId: string, input: QaReplyInput) => Promise<{
    id: string;
    author: string;
    createdAt: string;
    body: string;
  }>;
  wasFallback?: () => boolean;
};

interface AdminQnaPanelProps {
  api: AdminQnaApi;
}

const AdminQnaPanel: React.FC<AdminQnaPanelProps> = ({ api }) => {
  const [qaPosts, setQaPosts] = useState<QaPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isLoadingQa, setIsLoadingQa] = useState<boolean>(false);
  const [errorQa, setErrorQa] = useState<string | null>(null);
  const [qaSearch, setQaSearch] = useState<string>('');
  const [qaStatusFilter, setQaStatusFilter] = useState<QaStatusFilter>('all');
  const [qaAuthorFilter, setQaAuthorFilter] = useState<string>('all');
  const [qaAuthorSearch, setQaAuthorSearch] = useState<string>('');
  const [qaAuthorSort, setQaAuthorSort] = useState<AuthorSort>('recent');
  const [replyText, setReplyText] = useState<string>('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const loadQaPosts = useCallback(async () => {
    setIsLoadingQa(true);
    setErrorQa(null);

    try {
      const response = await api.listPosts();
      setQaPosts(response);
      setIsFallback(api.wasFallback?.() ?? false);
      if (!selectedPostId && response.length > 0) {
        setSelectedPostId(response[0].id);
      }
    } catch (error) {
      setErrorQa('Q&A 데이터를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingQa(false);
    }
  }, [api, selectedPostId]);

  useEffect(() => {
    loadQaPosts();
  }, [loadQaPosts]);

  const filteredQaPosts = useMemo(() => {
    const searchLower = qaSearch.trim().toLowerCase();
    return qaPosts.filter((post) => {
      const statusMatch = qaStatusFilter === 'all' || post.status === qaStatusFilter;
      if (!statusMatch) return false;
      if (qaAuthorFilter !== 'all' && post.author !== qaAuthorFilter) return false;
      if (!searchLower) return true;
      const inTags = post.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
      const inReplies = post.replies.some((reply) => reply.body.toLowerCase().includes(searchLower));
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.body.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower) ||
        Boolean(inTags) ||
        inReplies
      );
    });
  }, [qaAuthorFilter, qaPosts, qaSearch, qaStatusFilter]);

  const qaAuthors = useMemo(() => {
    const authorMap = new Map<string, string>();
    qaPosts.forEach((post) => {
      if (!post.author) return;
      const current = authorMap.get(post.author);
      if (!current || post.createdAt > current) {
        authorMap.set(post.author, post.createdAt);
      }
    });
    return Array.from(authorMap.entries()).map(([name, lastCreatedAt]) => ({
      name,
      lastCreatedAt,
    }));
  }, [qaPosts]);

  const filteredQaAuthors = useMemo(() => {
    const searchLower = qaAuthorSearch.trim().toLowerCase();
    const filtered = qaAuthors.filter((author) => {
      if (!searchLower) return true;
      return author.name.toLowerCase().includes(searchLower);
    });
    const sorted = [...filtered];
    if (qaAuthorSort === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (qaAuthorSort === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      sorted.sort((a, b) => (b.lastCreatedAt ?? '').localeCompare(a.lastCreatedAt ?? ''));
    }
    return sorted;
  }, [qaAuthors, qaAuthorSearch, qaAuthorSort]);

  const selectedPost = useMemo(
    () => qaPosts.find((post) => post.id === selectedPostId) ?? null,
    [qaPosts, selectedPostId]
  );

  const handleAddReply = useCallback(async () => {
    if (!selectedPostId) return;
    if (!replyText.trim()) {
      setReplyError('답변 내용을 입력해 주세요.');
      return;
    }
    setReplyError(null);

    try {
      const reply = await api.addReply(selectedPostId, {
        body: replyText.trim(),
        author: 'Decision Desk',
      });
      setQaPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPostId
            ? {
                ...post,
                replies: [...post.replies, reply],
                status: 'answered',
                updatedAt: reply.createdAt,
              }
            : post
        )
      );
      setReplyText('');
    } catch (error) {
      setReplyError('답변 등록 중 문제가 발생했습니다.');
    }
  }, [api, replyText, selectedPostId]);

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
          Q&amp;A 데이터를 불러오지 못해 임시 데이터를 표시하고 있습니다.
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-light serif text-white mb-2">Company Q&amp;A</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 min-h-[560px] lg:grid-cols-[minmax(0,0.26fr)_minmax(0,0.38fr)_minmax(0,0.36fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
            <span className="uppercase tracking-[0.2em] text-slate-500">선택된 질문자</span>
            <span className="text-white">{qaAuthorFilter === 'all' ? '전체' : qaAuthorFilter}</span>
          </div>
          <AdminAuthorPanel
            authors={filteredQaAuthors}
            selectedAuthor={qaAuthorFilter}
            onSelectAuthor={setQaAuthorFilter}
            searchValue={qaAuthorSearch}
            onSearchChange={setQaAuthorSearch}
            sortValue={qaAuthorSort}
            onSortChange={setQaAuthorSort}
          />
        </div>

        <AsyncState
          isLoading={isLoadingQa}
          error={errorQa}
          empty={!isLoadingQa && !errorQa && qaPosts.length === 0}
          onRetry={loadQaPosts}
          emptyMessage="등록된 Q&A가 없습니다. 질문을 작성해 보세요."
        >
          <QaList
            posts={filteredQaPosts}
            selectedId={selectedPostId}
            onSelect={setSelectedPostId}
            searchValue={qaSearch}
            onSearchChange={setQaSearch}
            statusFilter={qaStatusFilter}
            onStatusFilterChange={setQaStatusFilter}
          />
        </AsyncState>

        <QaThread
          post={selectedPost}
          replyText={replyText}
          onReplyChange={(value) => {
            setReplyError(null);
            setReplyText(value);
          }}
          onAddReply={handleAddReply}
          errorMessage={replyError}
          canReply
        />
      </div>
    </div>
  );
};

export default AdminQnaPanel;
