import React, { useCallback, useState } from 'react';
import { Bulletin } from '../../types/decisionRoom';
import { getFileDownloadUrl } from '../../api/posts';
import { getAuthToken } from '../../services/auth';

interface BulletinModalProps {
  open: boolean;
  bulletin: Bulletin | null;
  onClose: () => void;
  onDelete?: () => void;
}

const tagStyles: Record<string, string> = {
  URGENT: 'text-rose-300 border-rose-900 bg-rose-950/40',
  UPDATE: 'text-emerald-300 border-emerald-900 bg-emerald-950/40',
  ADVISORY: 'text-sky-300 border-sky-900 bg-sky-950/40',
};

const BulletinModal: React.FC<BulletinModalProps> = ({ open, bulletin, onClose, onDelete }) => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const triggerDownload = (url: string, filename: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleOpen = useCallback(async (link: { url: string; fileId?: number }) => {
    setDownloadError(null);
    if (link.fileId) {
      setDownloadingId(link.fileId);
      try {
        const response = await getFileDownloadUrl(link.fileId);
        if (response?.url) {
          window.open(response.url, '_blank', 'noopener,noreferrer');
        } else {
          setDownloadError('다운로드 URL을 찾지 못했습니다.');
        }
      } catch (error) {
        setDownloadError('파일 다운로드에 실패했습니다.');
      } finally {
        setDownloadingId(null);
      }
      return;
    }
    if (link.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleDownload = useCallback(
    async (link: { url: string; fileId?: number; label?: string }) => {
      setDownloadError(null);
      const filename = link.label ?? 'attachment';

      if (link.fileId) {
        setDownloadingId(link.fileId);
        try {
          const token = getAuthToken();
          const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
          const apiUrl = `${baseUrl}/api/files/${link.fileId}`;
          const downloadResponse = await fetch(apiUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!downloadResponse.ok) {
            throw new Error('download failed');
          }

          const blob = await downloadResponse.blob();
          const objectUrl = URL.createObjectURL(blob);
          triggerDownload(objectUrl, filename);
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          setDownloadError('파일 다운로드에 실패했습니다.');
        } finally {
          setDownloadingId(null);
        }
        return;
      }

      if (link.url) {
        triggerDownload(link.url, filename);
      }
    },
    [],
  );

  if (!open || !bulletin) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-16">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass-panel w-full max-w-3xl max-h-full overflow-y-auto rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="mb-8">
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border mb-4 inline-block ${
              tagStyles[bulletin.tag]
            }`}
          >
            {bulletin.tag}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {bulletin.title}
          </h2>
          <div className="flex flex-wrap items-center text-[10px] text-slate-500 uppercase tracking-widest gap-4">
            <span>
              <i className="fas fa-calendar-alt mr-2"></i>
              {bulletin.date}
            </span>
            <span>
              <i className="fas fa-user-shield mr-2"></i>
              {bulletin.issuedBy}
            </span>
          </div>
        </div>

        <div className="space-y-5 text-slate-300 leading-relaxed text-sm">
          {bulletin.body.split('\n').map((line, index) => (
            <p key={`${bulletin.id}-line-${index}`} className="text-slate-300">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl">
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">Attachments</p>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {(bulletin.links ?? []).length === 0 && (
              <span className="text-slate-500">첨부 문서가 없습니다.</span>
            )}
            {(bulletin.links ?? []).map((link) => (
              <div
                key={link.label}
                className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10"
              >
                <button
                  type="button"
                  onClick={() => handleOpen(link)}
                  disabled={Boolean(link.fileId && downloadingId === link.fileId)}
                  className="flex-1 text-left text-sm text-slate-300 hover:text-white transition"
                >
                  {link.label}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(link)}
                  disabled={Boolean(link.fileId && downloadingId === link.fileId)}
                  className="px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10 transition"
                >
                  다운로드
                </button>
              </div>
            ))}
            {downloadError && <span className="text-rose-400 text-xs">{downloadError}</span>}
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={onDelete ?? onClose}
            className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            {onDelete ? '삭제' : '닫기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulletinModal;
