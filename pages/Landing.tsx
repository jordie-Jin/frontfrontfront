// 애플리케이션 랜딩 페이지입니다.

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../src/services/auth';
import TurnstileWidget from '../src/components/TurnstileWidget';

type AuthMode = 'login' | 'register';

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; name?: string; }>({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (authMode !== 'register') {
      setTurnstileToken('');
    }
  }, [authMode]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const emailPattern = /^\S+@\S+\.\S+$/;
    const isRegister = authMode === 'register';

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
    setAuthError(null);

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
      } else {
        await login({ email: trimmedEmail, password });
      }
      navigate('/dashboard');
    } catch (error) {
      setAuthError(isRegister ? '회원가입에 실패했습니다. 다시 시도해주세요.' : '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    setErrors({});
    setAuthError(null);
    setConfirmPassword('');
    setTurnstileToken('');
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setAuthError(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-slate-500 selection:text-white relative">
      
      {/* Auth Portal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl" 
            onClick={() => setShowAuth(false)}
          ></div>
          
          <div className="relative glass-panel w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
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
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">이름</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ID를 입력해 주세요"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">이메일</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력해 주세요"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">비밀번호</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {authMode === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">비밀번호 확인</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-white/30 transition-all outline-none text-white placeholder-slate-700"
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {authMode === 'register' && (
                <TurnstileWidget
                  className="mt-2"
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    if (token) {
                      setAuthError(null);
                    }
                  }}
                />
              )}

              {authError && (
                <p className="text-xs text-red-400">{authError}</p>
              )}

              <button 
                type="submit"
                className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl mt-4 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting || (authMode === 'register' && !turnstileToken)}
              >
                {isSubmitting ? '처리 중...' : authMode === 'login' ? '로그인' : '가입'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <button 
                onClick={toggleAuthMode}
                className="w-full py-4 border border-white/10 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <i className={`fas ${authMode === 'login' ? 'fa-plus' : 'fa-lock'} text-[8px]`}></i>
                <span>{authMode === 'login' ? '새 계정 생성' : '액세스 포털로 돌아가기'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-black/80 backdrop-blur-md border-b border-white/10' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-60 h-16">
              <img
                src="/img/logonobg.svg"
                alt="SENTINEL 로고"
                className="h-30 w-auto -translate-y-12"
              />
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400">
            <a href="#platform" className="hover:text-white transition-colors">플랫폼</a>
            <a href="#network" className="hover:text-white transition-colors">네트워크</a>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuth(true); }}
              className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all"
            >
              기업 로그인
            </button>
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
            //로그인 기능 스킵 onClick={() => { setAuthMode('login'); setShowAuth(true); }}
            onClick={() => navigate('/dashboard')}
            className="btn-primary group !bg-white/10 !text-white !backdrop-blur-xl border border-white/20 px-12 py-5 hover:!bg-white hover:!text-black transition-all shadow-2xl"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-bold">S E N T I N E L</span>
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform ml-3"></i>
          </button>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 opacity-60">
           <span className="text-[9px] uppercase tracking-[0.5em] text-white">탐색</span>
           <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-32 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24 items-end">
          <div className="md:col-span-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6 flex items-center">
              <span className="w-2 h-2 bg-slate-400 mr-2"></span> STRAGITY / INSIGHT
            </div>
            <h2 className="text-5xl md:text-6xl font-light leading-[1.1] text-white mb-0">
              전략, 리스크, AI를 <br/>
              통해 <br/>
              <span className="text-slate-500 italic">드러내다.</span>
            </h2>
          </div>
          <div className="md:col-span-6">
            <p className="text-lg text-slate-400 font-light leading-relaxed mb-8 ">
              힘의 차이가 느껴지십니까 Human?<br />
              <br />
              SENTINEL은 기업이 복잡한 협력 생태계를 전략적으로 탐색하고 제어할 수 있도록 지원합니다.
            </p>
            <button className="group flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold text-white">
              <span className="bg-white/10 p-4 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                <i className="fas fa-arrow-right"></i>
              </span>
              <span>플랫폼 알아보기</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01.', title: '리스크 분석', desc: '분산된 지표를 결합해 기업의 잠재적 위험을 정밀하게 식별합니다.', icon: 'fa-microscope' },
            { num: '02.', title: '통합 인사이트', desc: '복잡한 기업 정보를 결합하여 의사결정 시간을 효율적으로 관리합니다.', icon: 'fa-vial' },
            { num: '03.', title: '흐름예측 AI', desc: '과거와 현재 데이터를 기반으로 향후 분기의 흐름을 선제적으로 예측합니다.', icon: 'fa-brain' },
          ].map((feat, i) => (
            <div key={i} className="p-10 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 group">
              <div className="mb-12 flex justify-between items-start">
                 <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-slate-500 group-hover:text-white group-hover:border-white/30 transition-all">
                   <i className={`fas ${feat.icon}`}></i>
                 </div>
                 <span className="text-[10px] text-slate-600 font-mono tracking-tighter">{feat.num}</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-4 uppercase tracking-wider">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Research/Company Section */}
      <section className="py-32 px-10 border-t border-white/5">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-slate-900">
               <img src="/img/team.jpg" alt="팀 사진" className="w-full h-full object-cover translate-y-5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-1000" />
               <div className="absolute inset-0 border-[20px] border-[#050505] pointer-events-none"></div>
            </div>
            <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6 flex items-center">
                  <span className="w-2 h-2 bg-slate-400 mr-2"></span> Our Company
               </div>
               <h2 className="text-4xl md:text-5xl serif leading-tight mb-8">
                 우리는 <br/>
                 <span className="italic text-slate-400">데이터</span>를 읽고, <br/>
                 판단 가능한 인사이트로 <br/> 제공합니다.
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <p className="text-sm text-slate-500 leading-relaxed">전문가의 직관에 의존하던 판단을 데이터 기반 인사이트로 전환해,
조직이 더 빠르고 일관된 의사결정을 내릴 수 있도록 돕습니다.</p>
                  <p className="text-sm text-slate-500 leading-relaxed">우리는 문제가 발생한 뒤 설명하는 도구가 아니라,
위험이 드러나기 전에 신호를 포착하는 시스템을 지향합니다.</p>
               </div>
               <button className="flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold text-white group">
                  <span className="bg-white text-black p-4 rounded-full group-hover:bg-slate-200 transition-all">
                    <i className="fas fa-plus"></i>
                  </span>
                  <span>궁금하십니까?</span>
               </button>
            </div>
         </div>
      </section>

      {/* Newsroom Section */}
      <section className="py-32 px-10 border-t border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-20">
               <h2 className="text-6xl serif font-light">소식이 궁금하신가요?</h2>
               <button className="px-6 py-2 border border-white/20 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                 모든 뉴스카드 보기 <i className="fas fa-arrow-right ml-2"></i>
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="md:col-span-2 group cursor-pointer">
                  <div className="aspect-video bg-slate-900 overflow-hidden mb-8">
                    <video src="/img/robot.mp4" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="뉴스 1"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                     />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-4"><span>RECENT</span><span>2026년 01월 26일</span></div>
                  <h3 className="text-3xl serif mb-4 group-hover:text-slate-300 transition-colors">데이터 기반 통합 리스크 신호 포착</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xl">재무 지표, 현금흐름, 외부 환경 데이터를 결합해 기업의 구조적 위험 신호를 조기에 식별, <br/>인사이트를 제공합니다.</p>
                  <span className="text-[10px] uppercase tracking-widest font-bold border-b border-white/20 pb-1 group-hover:border-white transition-all">기사 읽기</span>
               </div>
               <div className="space-y-12">
                  {[
                    { date: '2025년 12월 18일', title: '흑자도산을 예측하는 재무 패턴 확장' },
                    { date: '2025년 12월 2일', title: '사건이 아닌 시간으로 리스크의 흐름을 보다' },
                    { date: '2025년 11월 21일', title: 'AI 기반 기업 리스크 분석, 실무에 적용되다' }
                  ].map((item, i) => (
                    <div key={i} className="group cursor-pointer border-t border-white/10 pt-8">
                      <div className="flex justify-between text-[9px] text-slate-600 uppercase tracking-[0.2em] mb-3"><span>소식</span><span>{item.date}</span></div>
                      <h4 className="text-xl serif leading-snug group-hover:text-slate-300 transition-colors">{item.title}</h4>
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-arrow-right text-xs"></i></div>
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
            <h2 className="text-4xl md:text-5xl serif leading-tight mb-12">우리는 기업 네트워크의 불확실성을 <br/>데이터 인텔리전스로 <br/>선제적으로 해석합니다.</h2>
            <button 
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
              className="inline-flex items-center space-x-4 group"
            >
               <span className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><i className="fas fa-plus"></i></span>
               <span className="text-[13px] uppercase tracking-[0.3em] font-bold">CONTACT US</span>
            </button>
         </div>
      </section>

      {/* Big Branding Footer */}
      <footer className="pt-24 pb-12 px-10 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-[10px] uppercase tracking-widest text-slate-500">
             <div className="md:col-span-4"><p className="mb-4">© 2026 SENTINEL. All rights reserved.</p></div>
             <div className="md:col-span-2 flex flex-col space-y-2">
                <span className="text-white font-bold mb-2">둘러보기</span>
                <a href="#" className="hover:text-white transition-colors">플랫폼</a>
                <a href="#" className="hover:text-white transition-colors">회사</a>
                <a href="#" className="hover:text-white transition-colors">뉴스룸</a>
             </div>
             <div className="md:col-span-2 flex flex-col space-y-2">
                <span className="text-white font-bold mb-2">연결</span>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">X</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
