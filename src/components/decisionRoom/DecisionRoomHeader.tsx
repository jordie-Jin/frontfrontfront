import React from 'react';
import { Tab } from '../../types/decisionRoom';

interface DecisionRoomHeaderProps {
  tab: Tab;
  onChangeTab: (tab: Tab) => void;
  bulletinMode: 'active' | 'archive';
  onChangeBulletinMode: (mode: 'active' | 'archive') => void;
  onLogout?: () => void;
}

const DecisionRoomHeader: React.FC<DecisionRoomHeaderProps> = ({
  tab,
  onChangeTab,
  bulletinMode,
  onChangeBulletinMode,
  onLogout,
}) => {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-4xl font-light serif text-white mb-2">Decision Room</h2>
        <p className="text-slate-400">Q&amp;A and official partner directives.</p>
      </div>

      <div className="flex flex-col gap-3 items-start md:items-end">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => onChangeTab('bulletins')}
              className={`px-5 py-2 text-[10px] uppercase tracking-[0.3em] font-semibold rounded-full transition-all ${
                tab === 'bulletins'
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulletins
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('qa')}
              className={`px-5 py-2 text-[10px] uppercase tracking-[0.3em] font-semibold rounded-full transition-all ${
                tab === 'qa'
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Q&amp;A
            </button>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-white/10 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:bg-white/10"
            >
              로그아웃
            </button>
          )}
        </div>

        {tab === 'bulletins' && (
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => onChangeBulletinMode('active')}
              className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] font-semibold rounded-full transition-all ${
                bulletinMode === 'active'
                  ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulletins
            </button>
            <button
              type="button"
              onClick={() => onChangeBulletinMode('archive')}
              className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] font-semibold rounded-full transition-all ${
                bulletinMode === 'archive'
                  ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulletin Archive
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DecisionRoomHeader;
