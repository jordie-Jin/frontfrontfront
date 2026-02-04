import React, { useCallback, useEffect, useMemo, useState } from 'react';
import QaList, { QaStatusFilter } from '../../decisionRoom/QaList';
import QaThread from '../../decisionRoom/QaThread';
import QaComposer from '../../decisionRoom/QaComposer';
import AsyncState from '../../common/AsyncState';
import { QaPost, QaPostInput } from '../../../types/decisionRoom';
import { AuthUser } from '../../../types/auth';

type UserQnaApi = {
  listPosts: () => Promise<QaPost[]>;
  createPost: (input: QaPostInput) => Promise<QaPost>;
};

interface UserQnaPanelProps {
  api: UserQnaApi;
  currentUser: AuthUser | null;
}

const UserQnaPanel: React.FC<UserQnaPanelProps> = ({ api, currentUser }) => {
  const [qaPosts, setQaPosts] = useState<QaPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isLoadingQa, setIsLoadingQa] = useState<boolean>(false);
  const [errorQa, setErrorQa] = useState<string | null>(null);
  const [qaSearch, setQaSearch] = useState<string>('');
  const [qaStatusFilter, setQaStatusFilter] = useState<QaStatusFilter>('all');
  const [composerOpen, setComposerOpen] = useState<boolean>(false);
  const [composerTitle, setComposerTitle] = useState<string>('');
  const [composerBody, setComposerBody] = useState<string>('');
  const [composerError, setComposerError] = useState<string | null>(null);

  const loadQaPosts = useCallback(async () => {
    setIsLoadingQa(true);
    setErrorQa(null);

    try {
      const response = await api.listPosts();
      setQaPosts(response);
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
      if (!currentUser?.id) return false;
      if (String(post.userId) !== String(currentUser.id)) return false;
      const statusMatch = qaStatusFilter === 'all' || post.status === qaStatusFilter;
      if (!statusMatch) return false;
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
  }, [currentUser?.id, qaPosts, qaSearch, qaStatusFilter]);

  const selectedPost = useMemo(
    () => qaPosts.find((post) => post.id === selectedPostId) ?? null,
    [qaPosts, selectedPostId]
  );

  const handleCreatePost = useCallback(async () => {
    if (!composerTitle.trim() || !composerBody.trim()) {
      setComposerError('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setComposerError(null);

    try {
      const created = await api.createPost({
        title: composerTitle.trim(),
        body: composerBody.trim(),
        author: currentUser?.name ?? 'User',
      });
      setQaPosts((prev) => [created, ...prev]);
      setSelectedPostId(created.id);
      setComposerTitle('');
      setComposerBody('');
      setComposerOpen(false);
    } catch (error) {
      setComposerError('질문 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  }, [api, composerBody, composerTitle, currentUser?.name]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-light serif text-white mb-2">Company Q&amp;A</h3>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Collaborative threads with operations and compliance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setComposerError(null);
            setComposerOpen(true);
          }}
          className="px-5 py-2 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-slate-200 transition"
        >
          질문 작성
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 min-h-[560px] lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
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
          replyText=""
          onReplyChange={() => {}}
          onAddReply={() => {}}
          canReply={false}
        />
      </div>

      <QaComposer
        open={composerOpen}
        title={composerTitle}
        body={composerBody}
        onChangeTitle={(value) => {
          setComposerError(null);
          setComposerTitle(value);
        }}
        onChangeBody={(value) => {
          setComposerError(null);
          setComposerBody(value);
        }}
        onCreate={handleCreatePost}
        onClose={() => setComposerOpen(false)}
        errorMessage={composerError}
        isSubmitDisabled={!composerTitle.trim() || !composerBody.trim()}
      />
    </div>
  );
};

export default UserQnaPanel;
