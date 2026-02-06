import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BulletinGrid from '../../components/decisionRoom/BulletinGrid';
import BulletinModal from '../../components/decisionRoom/BulletinModal';
import AsyncState from '../../components/common/AsyncState';
import { Bulletin } from '../../types/decisionRoom';
import { createPost, deletePost, listPostFiles, listPosts, updatePost, uploadPostFiles } from '../../api/posts';
import { PostFileItem, PostItem } from '../../types/post';
import { getStoredUser } from '../../services/auth';

const NoticesPage: React.FC = () => {
  const currentUser = getStoredUser();
  const role = currentUser?.role;
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';
  const [noticeMode, setNoticeMode] = useState<'active' | 'archive'>('active');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [isLoadingNotices, setIsLoadingNotices] = useState<boolean>(false);
  const [errorNotices, setErrorNotices] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorFiles, setEditorFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [noticeFiles, setNoticeFiles] = useState<Record<string, PostFileItem[]>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState<string | null>(null);
  const pageSize = 6;

  const formatFileSize = useCallback((size: number) => {
    if (!Number.isFinite(size)) return '-';
    if (size < 1024) return `${size}B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)}MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)}GB`;
  }, []);

  const loadNoticeFiles = useCallback(async (postId: string) => {
    setIsLoadingFiles(true);
    setErrorFiles(null);
    try {
      const files = await listPostFiles(postId);
      setNoticeFiles((prev) => ({ ...prev, [postId]: files }));
    } catch (error) {
      setErrorFiles('첨부 파일을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const loadNotices = useCallback(async () => {
    setIsLoadingNotices(true);
    setErrorNotices(null);

    try {
      const response = await listPosts({
        page: 1,
        size: 50,
        sortBy: 'createdAt',
        direction: 'DESC',
      });
      setPosts(response.content);
    } catch (error) {
      setErrorNotices('공지 데이터를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingNotices(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  useEffect(() => {
    setCurrentPage(1);
  }, [noticeMode, posts.length]);

  const parseLocalDateTime = useCallback((value: string): Date | null => {
    if (!value) return null;
    const trimmed = value.trim();
    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime())) {
      return direct;
    }
    const match = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
    );
    if (!match) return null;
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }, []);

  const isActiveStatus = useCallback((status: string) => {
    return status === 'ACTIVE' || status === 'PUBLISHED';
  }, []);

  const filteredPosts = useMemo(() => {
    if (noticeMode === 'active') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      threeMonthsAgo.setHours(0, 0, 0, 0);
      return posts.filter(
        (post) =>
          isActiveStatus(post.status) &&
          (() => {
            const createdAt = parseLocalDateTime(post.createdAt);
            return createdAt ? createdAt.getTime() >= threeMonthsAgo.getTime() : false;
          })()
      );
    }
    return posts;
  }, [isActiveStatus, noticeMode, parseLocalDateTime, posts]);

  const mapPostToBulletin = useCallback((post: PostItem): Bulletin => {
    const summary =
      post.content.length > 140 ? `${post.content.slice(0, 140)}...` : post.content;
    const files = noticeFiles[String(post.id)] ?? [];
    return {
      id: String(post.id),
      title: post.title,
      summary,
      body: post.content,
      tag: post.isPinned ? 'URGENT' : 'UPDATE',
      issuedBy: `User ${post.userId}`,
      date: post.createdAt,
      links: files.map((file) => ({
        label: file.originalFilename,
        url: file.storageUrl || '',
        fileId: file.id,
      })),
    };
  }, [noticeFiles]);

  const notices = useMemo(
    () => filteredPosts.map(mapPostToBulletin),
    [filteredPosts, mapPostToBulletin]
  );

  const totalPages = Math.max(1, Math.ceil(notices.length / pageSize));

  const pagedNotices = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return notices.slice(start, start + pageSize);
  }, [currentPage, notices, totalPages]);

  const selectedNotice = useMemo(
    () => notices.find((notice) => notice.id === selectedNoticeId) ?? null,
    [notices, selectedNoticeId]
  );

  useEffect(() => {
    if (!selectedNoticeId) return;
    if (noticeFiles[selectedNoticeId]) return;
    loadNoticeFiles(selectedNoticeId);
  }, [loadNoticeFiles, noticeFiles, selectedNoticeId]);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorError(null);
    setEditorFiles([]);
    setEditorOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedNoticeId) return;
    const post = posts.find((item) => String(item.id) === selectedNoticeId);
    if (!post) return;
    setEditingPost(post);
    setEditorTitle(post.title);
    setEditorContent(post.content);
    setEditorError(null);
    setEditorFiles([]);
    loadNoticeFiles(String(post.id));
    setEditorOpen(true);
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setEditorFiles((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleRemoveEditorFile = (index: number) => {
    setEditorFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (!editorTitle.trim() || !editorContent.trim()) {
      setEditorError('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setEditorError(null);

    try {
      if (editingPost) {
        const updated = await updatePost(editingPost.id, {
          categoryId: editingPost.categoryId,
          title: editorTitle.trim(),
          content: editorContent.trim(),
        });
        setPosts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSelectedNoticeId(String(updated.id));
        if (editorFiles.length > 0) {
          await uploadPostFiles(updated.id, editorFiles);
          await loadNoticeFiles(String(updated.id));
        }
      } else {
        const created = await createPost({
          categoryId: 1,
          title: editorTitle.trim(),
          content: editorContent.trim(),
        });
        setPosts((prev) => [created, ...prev]);
        setSelectedNoticeId(String(created.id));
        if (editorFiles.length > 0) {
          await uploadPostFiles(created.id, editorFiles);
          await loadNoticeFiles(String(created.id));
        }
      }
      setEditorOpen(false);
    } catch (error) {
      setEditorError('저장 또는 파일 업로드 중 문제가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedNoticeId) return;
    if (!window.confirm('이 공지를 삭제하시겠습니까?')) return;
    try {
      await deletePost(selectedNoticeId);
      setPosts((prev) => prev.filter((item) => String(item.id) !== selectedNoticeId));
      setSelectedNoticeId(null);
    } catch (error) {
      setErrorNotices('삭제 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-light serif text-white mb-2">공지 사항</h2>
          <p className="text-slate-400">Official company notices.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setNoticeMode('active')}
              className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] font-semibold rounded-full transition-all ${
                noticeMode === 'active'
                  ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notices
            </button>
            <button
              type="button"
              onClick={() => setNoticeMode('archive')}
              className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] font-semibold rounded-full transition-all ${
                noticeMode === 'archive'
                  ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notice Archive
            </button>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-slate-200 transition"
            >
              새 공지
            </button>
          )}
        </div>
      </header>

      <div className="glass-panel rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-light serif text-white mb-2">공 지 사 항</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              {noticeMode === 'active'
                ? '최근 3개월 간의 공지사항입니다.'
                : '전체 공지사항'}
            </p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {noticeMode === 'active' ? 'RECENT FEED' : 'ARCHIVE'}
          </div>
        </div>
        <AsyncState
          isLoading={isLoadingNotices}
          error={errorNotices}
          empty={!isLoadingNotices && !errorNotices && notices.length === 0}
          onRetry={loadNotices}
          emptyMessage="공지 사항이 준비되면 여기에 표시됩니다."
        >
          <div className="space-y-6">
            <BulletinGrid bulletins={pagedNotices} onOpen={setSelectedNoticeId} />
            {notices.length > pageSize && (
              <div className="flex flex-col items-center gap-3 text-xs text-slate-400">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  Page {Math.min(currentPage, totalPages)} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-[0.3em] transition ${
                      currentPage <= 1
                        ? 'border-white/10 text-slate-600'
                        : 'border-white/20 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-[0.3em] transition ${
                      currentPage >= totalPages
                        ? 'border-white/10 text-slate-600'
                        : 'border-white/20 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </AsyncState>
      </div>

      <BulletinModal
        open={Boolean(selectedNoticeId)}
        bulletin={selectedNotice}
        onClose={() => setSelectedNoticeId(null)}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      {editorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:p-16">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setEditorOpen(false)}
          ></div>
          <div className="relative glass-panel w-full max-w-2xl rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setEditorOpen(false)}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
            >
              <i className="fas fa-times"></i>
            </button>

            <h3 className="text-2xl font-light serif text-white mb-6">
              {editingPost ? '공지 수정' : '새 공지 작성'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">제목</label>
                <input
                  value={editorTitle}
                  onChange={(event) => setEditorTitle(event.target.value)}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="공지 제목을 입력하세요."
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">내용</label>
                <textarea
                  value={editorContent}
                  onChange={(event) => setEditorContent(event.target.value)}
                  className="mt-2 w-full min-h-[200px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="공지 내용을 입력하세요."
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  첨부 파일
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="notice-file-input"
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="notice-file-input"
                    className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[10px] uppercase tracking-[0.3em] text-slate-200 hover:bg-white/20 transition cursor-pointer"
                  >
                    파일 선택
                  </label>
                  <span className="text-xs text-slate-500">
                    {editorFiles.length > 0
                      ? `${editorFiles.length}개 선택됨`
                      : '선택된 파일 없음'}
                  </span>
                </div>

                {editorFiles.length > 0 && (
                  <div className="space-y-2">
                    {editorFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className="truncate max-w-[220px]">{file.name}</span>
                          <span className="text-slate-500">{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditorFile(index)}
                          className="text-[10px] uppercase tracking-[0.2em] text-rose-300 hover:text-rose-200"
                        >
                          제거
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editingPost && (
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      기존 첨부 파일
                    </p>
                    {isLoadingFiles && (
                      <p className="text-xs text-slate-500">첨부 파일을 불러오는 중...</p>
                    )}
                    {errorFiles && <p className="text-xs text-rose-400">{errorFiles}</p>}
                    {!isLoadingFiles &&
                      !errorFiles &&
                      (noticeFiles[String(editingPost.id)]?.length ?? 0) === 0 && (
                        <p className="text-xs text-slate-500">첨부 파일이 없습니다.</p>
                      )}
                    {(noticeFiles[String(editingPost.id)] ?? []).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                      >
                        <span className="truncate max-w-[220px]">{file.originalFilename}</span>
                        <span className="text-slate-500">{formatFileSize(file.fileSize)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {editorError && <p className="text-xs text-rose-400">{editorError}</p>}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-5 py-2 rounded-full border border-white/10 text-xs uppercase tracking-[0.3em] text-slate-300 hover:bg-white/5 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-full bg-white text-black text-xs uppercase tracking-[0.3em] font-semibold hover:bg-slate-200 transition"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && selectedNotice && (
        <div className="fixed bottom-8 right-10 z-[90] flex gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] uppercase tracking-[0.3em] text-white hover:bg-white/20 transition"
          >
            수정
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
