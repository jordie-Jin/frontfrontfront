import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DecisionRoomHeader from '../components/decisionRoom/DecisionRoomHeader';
import BulletinGrid from '../components/decisionRoom/BulletinGrid';
import BulletinModal from '../components/decisionRoom/BulletinModal';
import QaList, { QaStatusFilter } from '../components/decisionRoom/QaList';
import QaThread from '../components/decisionRoom/QaThread';
import QaComposer from '../components/decisionRoom/QaComposer';
import AsyncState from '../components/common/AsyncState';
import {
  Bulletin,
  QaPost,
  Tab,
} from '../types/decisionRoom';
import {
  addQaReply,
  createQaPost,
  fetchBulletins,
  fetchQaPosts,
} from '../services/decisionRoomApi';
import { logout } from '../services/auth';

const DecisionRoom: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('bulletins');
  const [bulletinMode, setBulletinMode] = useState<'active' | 'archive'>('active');
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [qaPosts, setQaPosts] = useState<QaPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedBulletinId, setSelectedBulletinId] = useState<string | null>(null);
  const [isLoadingBulletins, setIsLoadingBulletins] = useState<boolean>(false);
  const [isLoadingQa, setIsLoadingQa] = useState<boolean>(false);
  const [errorBulletins, setErrorBulletins] = useState<string | null>(null);
  const [errorQa, setErrorQa] = useState<string | null>(null);
  const [qaSearch, setQaSearch] = useState<string>('');
  const [qaStatusFilter, setQaStatusFilter] = useState<QaStatusFilter>('all');
  const [replyText, setReplyText] = useState<string>('');
  const [composerOpen, setComposerOpen] = useState<boolean>(false);
  const [composerTitle, setComposerTitle] = useState<string>('');
  const [composerBody, setComposerBody] = useState<string>('');
  const [composerError, setComposerError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [hasLoadedQa, setHasLoadedQa] = useState<boolean>(false);

  const loadBulletins = useCallback(async () => {
    setIsLoadingBulletins(true);
    setErrorBulletins(null);

    try {
      const response = await fetchBulletins(bulletinMode);
      setBulletins(response);
    } catch (error) {
      setErrorBulletins('공지 데이터를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingBulletins(false);
    }
  }, [bulletinMode]);

  const loadQaPosts = useCallback(async () => {
    setIsLoadingQa(true);
    setErrorQa(null);

    try {
      const response = await fetchQaPosts();
      setQaPosts(response);
      if (!selectedPostId && response.length > 0) {
        setSelectedPostId(response[0].id);
      }
      setHasLoadedQa(true);
    } catch (error) {
      setErrorQa('Q&A 데이터를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingQa(false);
    }
  }, [selectedPostId]);

  useEffect(() => {
    if (tab !== 'bulletins') return;
    loadBulletins();
  }, [tab, loadBulletins]);

  useEffect(() => {
    if (tab !== 'qa' || hasLoadedQa) return;
    loadQaPosts();
  }, [tab, hasLoadedQa, loadQaPosts]);

  const filteredQaPosts = useMemo(() => {
    const searchLower = qaSearch.trim().toLowerCase();
    return qaPosts.filter((post) => {
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
  }, [qaPosts, qaSearch, qaStatusFilter]);

  const selectedPost = useMemo(
    () => qaPosts.find((post) => post.id === selectedPostId) ?? null,
    [qaPosts, selectedPostId]
  );

  const selectedBulletin = useMemo(
    () => bulletins.find((bulletin) => bulletin.id === selectedBulletinId) ?? null,
    [bulletins, selectedBulletinId]
  );

  const handleCreatePost = useCallback(async () => {
    if (!composerTitle.trim() || !composerBody.trim()) {
      setComposerError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setComposerError(null);

    try {
      const created = await createQaPost({
        title: composerTitle.trim(),
        body: composerBody.trim(),
        author: 'Decision Partner',
      });
      setQaPosts((prev) => [created, ...prev]);
      setSelectedPostId(created.id);
      setComposerTitle('');
      setComposerBody('');
      setComposerOpen(false);
    } catch (error) {
      setComposerError('질문 등록에 실패했습니다. 다시 시도해주세요.');
    }
  }, [composerBody, composerTitle]);

  const handleAddReply = useCallback(async () => {
    if (!selectedPostId) return;
    if (!replyText.trim()) {
      setReplyError('답변 내용을 입력해주세요.');
      return;
    }
    setReplyError(null);

    try {
      const reply = await addQaReply(selectedPostId, {
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
  }, [replyText, selectedPostId]);

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <DecisionRoomHeader
        tab={tab}
        onChangeTab={setTab}
        bulletinMode={bulletinMode}
        onChangeBulletinMode={setBulletinMode}
        onLogout={async () => {
          try {
            await logout();
          } catch (error) {
            // ignore logout errors for now
          } finally {
            navigate('/');
          }
        }}
      />

      <div className="min-h-[680px]">
        {tab === 'bulletins' ? (
          <div className="glass-panel rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-light serif text-white mb-2">Strategic Bulletins</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">
                  {bulletinMode === 'active'
                    ? 'Active directives for partner operations'
                    : 'Archived directives & advisories'}
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                {bulletinMode === 'active' ? 'LIVE FEED' : 'ARCHIVE'}
              </div>
            </div>

            <AsyncState
              isLoading={isLoadingBulletins}
              error={errorBulletins}
              empty={!isLoadingBulletins && !errorBulletins && bulletins.length === 0}
              onRetry={loadBulletins}
              emptyMessage="공지사항이 준비되면 이 영역에 표시됩니다."
            >
              <BulletinGrid bulletins={bulletins} onOpen={setSelectedBulletinId} />
            </AsyncState>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-light serif text-white mb-2">Partner Q&amp;A</h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] gap-6 min-h-[560px]">
              <AsyncState
                isLoading={isLoadingQa}
                error={errorQa}
                empty={!isLoadingQa && !errorQa && qaPosts.length === 0}
                onRetry={loadQaPosts}
                emptyMessage="등록된 Q&A가 없습니다. 질문을 작성해보세요."
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
              />
            </div>
          </div>
        )}
      </div>

      <BulletinModal
        open={Boolean(selectedBulletinId)}
        bulletin={selectedBulletin}
        onClose={() => setSelectedBulletinId(null)}
      />

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

export default DecisionRoom;
