// 애플리케이션 랜딩 페이지

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiRequestError } from '../api/client';
import { getStoredUser, login, logout, register } from '../services/auth';
import TurnstileWidget from '../components/TurnstileWidget';
import SuccessModal from '../components/common/SuccessModal';
import LegalLinks from '../components/common/LegalLinks';
import privacyPolicyContent from '../../docs/privacy-policy.md?raw';
import termsOfServiceContent from '../../docs/terms-of-service.md?raw';
import { normalizeLegalMarkdown } from '../utils/legalContent';

type AuthMode = 'login' | 'register';
type LegalModalType = 'privacy' | 'terms' | null;

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [duplicateEmailError, setDuplicateEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const navigate = useNavigate();
  const isAuthenticated = Boolean(currentUser);
  const normalizedPrivacyPolicy = normalizeLegalMarkdown(privacyPolicyContent);
  const normalizedTermsOfService = normalizeLegalMarkdown(termsOfServiceContent);
  const legalModalTitle = legalModalType === 'privacy' ? '개인정보 처리방침' : '이용약관';
  const legalModalContent =
    legalModalType === 'privacy' ? normalizedPrivacyPolicy : normalizedTermsOfService;

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedPrivacyPolicy, setAgreedPrivacyPolicy] = useState(false);
  const [agreedTermsOfService, setAgreedTermsOfService] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (authMode !== 'register') {
      setTurnstileToken('');
      setAgreedPrivacyPolicy(false);
      setAgreedTermsOfService(false);
    }
  }, [authMode]);

  const isRegisterAgreementCompleted = agreedPrivacyPolicy && agreedTermsOfService;
  const isRegisterFormLocked = authMode === 'register' && !isRegisterAgreementCompleted;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const emailPattern = /^\S+@\S+\.\S+$/;
    const isRegister = authMode === 'register';

    if (isRegister && !isRegisterAgreementCompleted) {
      setAuthError('개인정보 처리방침과 이용약관에 모두 동의해 주세요.');
      return;
    }

    if (!trimmedEmail) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = '올바른 이메일 형식을 입력해 주세요.';
    }

    if (!password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    } else if (password.length < 8) {
      nextErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (isRegister) {
      if (!trimmedName) {
        nextErrors.name = '이름을 입력해 주세요.';
      }

      if (!confirmPassword) {
        nextErrors.confirmPassword = '비밀번호 확인을 입력해 주세요.';
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(nextErrors);
    setServerFieldErrors({});
    setAuthError(null);
    setDuplicateEmailError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (isRegister && !turnstileToken) {
      setAuthError('Turnstile 인증을 완료해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isRegister) {
        await register({
          email: trimmedEmail,
          password,
          name: trimmedName,
          turnstileToken,
        });
        setShowAuth(false);
        setShowSignupSuccess(true);
      } else {
        await login({ email: trimmedEmail, password });
        setCurrentUser(getStoredUser());
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const fieldErrors: Record<string, string> = {};
      const status =
        (error as { response?: { status?: number | string } })?.response?.status ??
        (error instanceof ApiRequestError ? error.apiError?.status : undefined);
      const statusCode = typeof status === 'string' ? Number(status) : status;

      if (error instanceof ApiRequestError && error.apiError?.errors?.length) {
        error.apiError.errors.forEach((detail) => {
          if (detail.field && detail.message) {
            fieldErrors[detail.field] = detail.message;
          }
        });
      }

      if (isRegister && (statusCode === 400 || statusCode === 401 || statusCode === 409)) {
        setTurnstileToken('');
        setTurnstileResetKey((prev) => prev + 1);
        setErrors({});
        setServerFieldErrors({});
        setDuplicateEmailError(null);
      }

      if (isRegister && statusCode === 409) {
        const duplicateMessage =
          (error instanceof ApiRequestError && error.apiError?.message) || message;
        setAuthError(null);
        setDuplicateEmailError(duplicateMessage ?? null);
        return;
      } else {
        if (Object.keys(fieldErrors).length > 0) {
          setServerFieldErrors(fieldErrors);
        }
        if (Object.keys(fieldErrors).length === 0) {
          setAuthError(
            isRegister
              ? '회원가입에 실패했습니다. 다시 시도해 주세요.'
              : '이메일 또는 비밀번호가 일치하지 않습니다.',
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
    setServerFieldErrors({});
    setAuthError(null);
    setDuplicateEmailError(null);
    setConfirmPassword('');
    setTurnstileToken('');
    setAgreedPrivacyPolicy(false);
    setAgreedTermsOfService(false);
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setAuthError(null);
    }
  }, []);

  const handleSignupSuccessConfirm = () => {
    setShowSignupSuccess(false);
    setAuthMode('login');
    setShowAuth(true);
    setErrors({});
    setServerFieldErrors({});
    setAuthError(null);
    setDuplicateEmailError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // ignore logout errors for now
    } finally {
      setCurrentUser(null);
      navigate('/');
    }
  };

  const handleSentinelClick = async () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
    if (!demoEmail || !demoPassword) {
      setAuthError('데모 계정 환경변수를 확인해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError(null);
      await login({ email: demoEmail, password: demoPassword });
      setCurrentUser(getStoredUser());
      navigate('/dashboard');
    } catch (error) {
      setAuthError('데모 로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-slate-500 selection:text-white relative">
      <SuccessModal
        open={showSignupSuccess}
        title="회원가입 이메일 인증"
        message="입력하신 주소로 이메일을 보냈습니다. 확인 후 인증해 주세요."
        confirmLabel="로그인으로 돌아가기"
        onConfirm={handleSignupSuccessConfirm}
      />

      {/* Auth Portal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
            onClick={() => setShowAuth(false)}
          ></div>

          <div className="relative my-4 sm:my-0 glass-panel w-full max-w-md rounded-[2.5rem] p-10 sm:p-12 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center mb-10">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-eye text-xs text-white"></i>
              </div>
              <h2 className="text-3xl font-light serif mb-2">
                {authMode === 'login' ? '로그인' : '회원가입'}
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                {authMode === 'login' ? '지금 바로 시작하세요' : '지금 바로 참여하세요'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {authMode === 'register' && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <label className="flex items-center gap-2 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={agreedPrivacyPolicy}
                      onChange={(e) => setAgreedPrivacyPolicy(e.target.checked)}
                      className="h-4 w-4 accent-white"
                    />
                    <span>
                      <button
                        type="button"
                        onClick={() => setLegalModalType('privacy')}
                        className="underline underline-offset-2 hover:text-white"
                      >
                        개인정보 처리방침
                      </button>{' '}
                      동의 (필수)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={agreedTermsOfService}
                      onChange={(e) => setAgreedTermsOfService(e.target.checked)}
                      className="h-4 w-4 accent-white"
                    />
                    <span>
                      <button
                        type="button"
                        onClick={() => setLegalModalType('terms')}
                        className="underline underline-offset-2 hover:text-white"
                      >
                        이용약관
                      </button>{' '}
                      동의 (필수)
                    </span>
                  </label>
                  {!isRegisterAgreementCompleted && (
                    <p className="text-[11px] text-slate-400">
                      필수 약관 동의 후 회원가입 입력이 가능합니다.
                    </p>
                  )}
                </div>
              )}

              {authMode === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                    이름
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력해 주세요."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                    aria-invalid={Boolean(errors.name)}
                    disabled={isRegisterFormLocked}
                  />
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                  {serverFieldErrors.name && (
                    <div className="mt-2 rounded-lg bg-red-500 text-black text-xs px-3 py-2">
                      {serverFieldErrors.name}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                  이메일
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setDuplicateEmailError(null);
                    setServerFieldErrors((prev) => {
                      const { email, ...rest } = prev;
                      return rest;
                    });
                  }}
                  placeholder="이메일을 입력해 주세요."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={duplicateEmailError ? 'duplicate-email-tooltip' : undefined}
                  disabled={isRegisterFormLocked}
                />
                {duplicateEmailError && (
                  <p id="duplicate-email-tooltip" role="alert" className="text-xs text-red-400">
                    {duplicateEmailError}
                  </p>
                )}
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                {serverFieldErrors.email && (
                  <div className="mt-2 rounded-lg bg-red-500 text-black text-xs px-3 py-2">
                    {serverFieldErrors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                  aria-invalid={Boolean(errors.password)}
                  disabled={isRegisterFormLocked}
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                {serverFieldErrors.password && (
                  <div className="mt-2 rounded-lg bg-red-500 text-black text-xs px-3 py-2">
                    {serverFieldErrors.password}
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    disabled={isRegisterFormLocked}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                  {serverFieldErrors.confirmPassword && (
                    <div className="mt-2 rounded-lg bg-red-500 text-black text-xs px-3 py-2">
                      {serverFieldErrors.confirmPassword}
                    </div>
                  )}
                </div>
              )}

              {authMode === 'register' && isRegisterAgreementCompleted && (
                <TurnstileWidget
                  key={turnstileResetKey}
                  className="mt-2"
                  onVerify={handleTurnstileVerify}
                />
              )}

              {authError && <p className="text-xs text-red-400">{authError}</p>}

              <button
                type="submit"
                className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl mt-4 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={
                  isSubmitting ||
                  (authMode === 'register' &&
                    (!isRegisterAgreementCompleted || !turnstileToken))
                }
              >
                {isSubmitting ? '처리 중..' : authMode === 'login' ? '로그인' : '가입'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <button
                onClick={toggleAuthMode}
                className="w-full py-4 border border-white/10 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <i className={`fas ${authMode === 'login' ? 'fa-plus' : 'fa-lock'} text-[8px]`}></i>
                <span>{authMode === 'login' ? '계정 생성' : '로그인으로 돌아가기'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 고객센터/문의 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowContactModal(false)}
          ></div>
          <div className="relative glass-panel w-full max-w-lg rounded-3xl p-8 border border-white/10">
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
              aria-label="문의 모달 닫기"
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 className="text-2xl font-semibold tracking-tight text-white mb-2">고객센터 및 문의</h3>
            <p className="text-sm text-slate-400 mb-6">
              서비스 이용 중 불편사항이나 기업 도입 문의를 남겨주세요.
            </p>
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">서비스명</p>
                <p className="text-white">SENTINEL</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">책임자</p>
                <p className="text-white">이석진 / 대표</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">부서명</p>
                <p className="text-white">SENTINEL</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">이메일</p>
                <a
                  href="mailto:dkcladlek098@naver.com"
                  className="text-white hover:text-slate-300 transition-colors"
                >
                  dkcladlek098@naver.com
                </a>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">연락처</p>
                <a
                  href="tel:01012345678"
                  className="text-white hover:text-slate-300 transition-colors"
                >
                  010-1234-5678
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full rounded-2xl border border-white/15 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 정책/약관 모달 */}
      {legalModalType && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setLegalModalType(null)}
          ></div>
          <div className="relative glass-panel w-full max-w-3xl rounded-3xl p-8 border border-white/10">
            <button
              type="button"
              onClick={() => setLegalModalType(null)}
              className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
              aria-label="정책 모달 닫기"
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 className="text-2xl font-semibold tracking-tight text-white mb-6">{legalModalTitle}</h3>
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-200 pr-2">
              {legalModalContent}
            </div>
            <button
              type="button"
              onClick={() => setLegalModalType(null)}
              className="mt-6 w-full rounded-2xl border border-white/15 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'py-4 bg-black/80 backdrop-blur-md border-b border-white/10' : 'py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-60 h-16">
              <img src="/img/logonobg.svg" alt="SENTINEL 로고" className="h-30 w-auto -translate-y-12" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all"
              >
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuth(true);
                }}
                className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all"
              >
                기업 로그인
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-end items-center overflow-hidden pb-32">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full overflow-hidden">
            <video
              className="absolute top-0 left-0 w-full h-full object-cover scale-105"
              src="/img/owl.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505] pointer-events-none"></div>
        </div>

        <div className="relative z-10 fade-up flex flex-col items-center mb-12">
          <button
            onClick={handleSentinelClick}
            className="btn-primary group !bg-white/10 !text-white !backdrop-blur-xl border border-white/20 px-12 py-5 hover:!bg-white hover:!text-black transition-all shadow-2xl"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-bold">S E N T I N E L</span>
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform ml-3"></i>
          </button>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 opacity-60">
          <span className="text-[9px] uppercase tracking-[0.5em] text-white">SCROLL</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Research/Company Section */}
      <section className="py-32 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-slate-900">
            <img
              src="/img/team.jpg"
              alt="팀 사진"
              className="w-full h-full object-cover translate-y-5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 border-[20px] border-[#050505] pointer-events-none"></div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6 flex items-center">
              <span className="w-2 h-2 bg-slate-400 mr-2"></span> 핵심 인사이트
            </div>
            <h2 className="text-4xl md:text-5xl serif leading-tight mb-8">
              우리의
              <br />
              <span className="italic text-slate-400">데이터</span>를 쓰고, <br />
              간단하지만 강력한 인사이트로
              <br />
              제공합니다.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <p className="text-sm text-slate-500 leading-relaxed">
                전문가의 직관에 의존하던 의사결정을 데이터 기반 인사이트로 전환합니다.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                문제가 발생한 뒤가 아니라, 위험이 커지기 전에 신호를 포착합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold text-white group"
            >
              <span className="bg-white text-black p-4 rounded-full group-hover:bg-slate-200 transition-all">
                <i className="fas fa-plus"></i>
              </span>
              <span>문의하기</span>
            </button>
          </div>
        </div>
      </section>

      {/* Newsroom Section */}
      <section className="py-32 px-10 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20">
            <h2 className="text-6xl serif font-light">핵심 인사이트</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 group">
              <div className="aspect-video bg-slate-900 overflow-hidden mb-8">
                <video
                  src="/img/robot.mp4"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-4">
                <span>RECENT</span>
                <span>2026.01.26</span>
              </div>
              <h3 className="text-3xl serif mb-4">
                데이터 기반 통합 리스크 조기 경보
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xl">
                수요 지표, 공급망, 외부 환경 데이터를 결합해 기업 위험 신호를 조기에 포착합니다.
              </p>
            </div>
            <div className="space-y-12">
              {[
                { date: '2025.12.18', title: '투자 리스크를 줄이는 공급망 확장 전략' },
                { date: '2025.12.02', title: '사건 이후가 아닌 사전 위험 예측의 중요성' },
                { date: '2025.11.21', title: 'AI 기반 기업 리스크 분석, 국내 적용 사례' },
              ].map((item, i) => (
                <div key={i} className="border-t border-white/10 pt-8">
                  <div className="flex justify-between text-[9px] text-slate-600 uppercase tracking-[0.2em] mb-3">
                    <span>뉴스</span>
                    <span>{item.date}</span>
                  </div>
                  <h4 className="text-xl serif leading-snug">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Area */}
      <section className="py-40 px-10 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
          <img src="/img/robot.jpg" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl md:text-5xl serif leading-tight mb-12">
            우리의 기업 데이터는 불확실성을
            <br />
            데이터 인텔리전스로
            <br />
            해결합니다.
          </h2>
        </div>
      </section>

      {/* Big Branding Footer */}
      <footer className="pt-24 pb-12 px-10 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 text-[10px] uppercase tracking-widest text-slate-500 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-4">© 2026 SENTINEL. All rights reserved.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-white font-bold mb-2">정책</span>
              <LegalLinks
                className="flex flex-col space-y-2"
                linkClassName="hover:text-white transition-colors text-left"
                onPrivacyClick={() => setLegalModalType('privacy')}
                onTermsClick={() => setLegalModalType('terms')}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
