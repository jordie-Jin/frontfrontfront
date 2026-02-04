import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const status = new URLSearchParams(location.search).get('status');
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-12 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/20">
          <i className={`fas ${isSuccess ? 'fa-check' : 'fa-triangle-exclamation'} text-sm`}></i>
        </div>
        <h1 className="mb-4 text-3xl font-light serif">
          {isSuccess ? '이메일 인증 완료' : '이메일 인증 실패'}
        </h1>
        <p className="mb-10 text-sm text-slate-400 leading-relaxed">
          {isSuccess
            ? '이메일 인증이 완료되었습니다. 로그인하여 계속 진행해 주세요.'
            : '이메일 인증에 실패했습니다. 링크가 만료되었거나 잘못된 요청일 수 있습니다.'}
        </p>
        <button
          type="button"
          className="w-full rounded-2xl bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-slate-200 transition-all"
          onClick={() => navigate('/')}
        >
          로그인 하러가기
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
