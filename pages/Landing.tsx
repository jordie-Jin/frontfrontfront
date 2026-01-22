
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
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

  const handleAuthSubmit = (e: React.FormEvent) => {
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    // Simulate successful authentication/registration
    console.log(`${authMode === 'login' ? 'Logging in' : 'Registering'}:`, { email, name });
    navigate('/dashboard');
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    setErrors({});
    setConfirmPassword('');
  };

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
                {authMode === 'login' ? 'Protocol Access' : 'Node Initialization'}
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                {authMode === 'login' ? 'Sentinel Intelligence Network' : 'Join the Global Director Council'}
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
                    placeholder="이름을 입력해 주세요"
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

              <button 
                type="submit"
                className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl mt-4"
              >
                {authMode === 'login' ? '로그인' : '가입'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <button 
                onClick={toggleAuthMode}
                className="w-full py-4 border border-white/10 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <i className={`fas ${authMode === 'login' ? 'fa-plus' : 'fa-lock'} text-[8px]`}></i>
                <span>{authMode === 'login' ? 'Initialize New Account' : 'Return to Access Portal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-black/80 backdrop-blur-md border-b border-white/10' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8">
              <img
                src="/img/logonobg.png"
                alt="SENTINEL 로고"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/80">
              SENTINEL
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#network" className="hover:text-white transition-colors">Network</a>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuth(true); }}
              className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all"
            >
              Enterprise Login
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
            onClick={() => { setAuthMode('login'); setShowAuth(true); }}
            className="btn-primary group !bg-white/10 !text-white !backdrop-blur-xl border border-white/20 px-12 py-5 hover:!bg-white hover:!text-black transition-all shadow-2xl"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Access Intelligence Hub</span>
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform ml-3"></i>
          </button>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 opacity-60">
           <span className="text-[9px] uppercase tracking-[0.5em] text-white">Explore</span>
           <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-32 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24 items-end">
          <div className="md:col-span-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6 flex items-center">
              <span className="w-2 h-2 bg-slate-400 mr-2"></span> THE INTEGRATED PLATFORM
            </div>
            <h2 className="text-5xl md:text-6xl font-light leading-[1.1] text-white mb-0">
              Combining strategy, <br/>
              intelligence, and AI into an <br/>
              <span className="text-slate-500 italic">engine of discovery.</span>
            </h2>
          </div>
          <div className="md:col-span-6">
            <p className="text-lg text-slate-400 font-light leading-relaxed mb-8">
              Our platform enables precise, dynamic control of partner targets and pathways, generating high-fidelity datasets that, combined with advanced AI, unlock systematic exploration of previously inaccessible collaboration space.
            </p>
            <button className="group flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold text-white">
              <span className="bg-white/10 p-4 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                <i className="fas fa-arrow-right"></i>
              </span>
              <span>Discover Our Platform</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01.', title: 'Network Analysis', desc: 'We harness data to control corporate biology with unmatched precision.', icon: 'fa-microscope' },
            { num: '02.', title: 'Strategic Synthesis', desc: 'We apply the latest intelligence tools to optimize your network discovery.', icon: 'fa-vial' },
            { num: '03.', title: 'Sovereign AI', desc: 'We power our platform with an AI engine fueled by differentiated global datasets.', icon: 'fa-brain' },
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
               <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop" alt="Strategic Research" className="w-full h-full object-cover grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-1000" />
               <div className="absolute inset-0 border-[20px] border-[#050505] pointer-events-none"></div>
            </div>
            <div>
               <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6 flex items-center">
                  <span className="w-2 h-2 bg-slate-400 mr-2"></span> OUR COMPANY
               </div>
               <h2 className="text-4xl md:text-5xl serif leading-tight mb-8">
                 Bold research to unlock <br/>
                 <span className="italic text-slate-400">partnership value</span> for <br/>
                 human health and commerce.
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <p className="text-sm text-slate-500 leading-relaxed">We are advancing a pipeline of novel collaborative frameworks by unraveling complex network biology with intelligence, chemistry, and AI.</p>
                  <p className="text-sm text-slate-500 leading-relaxed">Our mission targets age-related market inefficiencies, while our ultimate ambition is far bolder: to fundamentally rewrite the biology of networking.</p>
               </div>
               <button className="flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold text-white group">
                  <span className="bg-white text-black p-4 rounded-full group-hover:bg-slate-200 transition-all">
                    <i className="fas fa-plus"></i>
                  </span>
                  <span>Learn More About Us</span>
               </button>
            </div>
         </div>
      </section>

      {/* Newsroom Section */}
      <section className="py-32 px-10 border-t border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-20">
               <h2 className="text-6xl serif font-light">Newsroom</h2>
               <button className="px-6 py-2 border border-white/20 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                 View All Articles <i className="fas fa-arrow-right ml-2"></i>
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="md:col-span-2 group cursor-pointer">
                  <div className="aspect-video bg-slate-900 overflow-hidden mb-8">
                     <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080&auto=format&fit=crop" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="News 1" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-4"><span>Publications</span><span>September 4, 2025</span></div>
                  <h3 className="text-3xl serif mb-4 group-hover:text-slate-300 transition-colors">Intelligence-enabled discovery of integrated stress response modulators</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xl">In this landmark publication, we unveil our first-of-a-kind optogenetic screening platform which unlocks a novel mode of drug discovery.</p>
                  <span className="text-[10px] uppercase tracking-widest font-bold border-b border-white/20 pb-1 group-hover:border-white transition-all">Read Article</span>
               </div>
               <div className="space-y-12">
                  {[
                    { date: 'DEC 18, 2025', title: 'Scaling Computer Vision to Solve Aging' },
                    { date: 'DEC 02, 2025', title: 'Aging as an Engineering Problem' },
                    { date: 'NOV 21, 2025', title: 'Inside Our Science: Nobel Laureate Collaboration' }
                  ].map((item, i) => (
                    <div key={i} className="group cursor-pointer border-t border-white/10 pt-8">
                      <div className="flex justify-between text-[9px] text-slate-600 uppercase tracking-[0.2em] mb-3"><span>News</span><span>{item.date}</span></div>
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
            <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" className="w-full h-full object-cover" />
         </div>
         <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-5xl serif leading-tight mb-12">We are advancing strategic <br/>intelligence for the future <br/>of human networks.</h2>
            <button 
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
              className="inline-flex items-center space-x-4 group"
            >
               <span className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><i className="fas fa-plus"></i></span>
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Work With Us</span>
            </button>
         </div>
      </section>

      {/* Big Branding Footer */}
      <footer className="pt-24 pb-12 px-10 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24"><h1 className="text-[12vw] font-bold leading-none tracking-tighter text-white/5 serif select-none">IntegratedBio</h1></div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-[10px] uppercase tracking-widest text-slate-500">
             <div className="md:col-span-4"><p className="mb-4">© 2025 INTEGRATED BIOSCIENCES. ALL RIGHTS RESERVED.</p></div>
             <div className="md:col-span-2 flex flex-col space-y-2">
                <span className="text-white font-bold mb-2">Navigate</span>
                <a href="#" className="hover:text-white transition-colors">Platform</a>
                <a href="#" className="hover:text-white transition-colors">Company</a>
                <a href="#" className="hover:text-white transition-colors">Newsroom</a>
             </div>
             <div className="md:col-span-2 flex flex-col space-y-2">
                <span className="text-white font-bold mb-2">Connect</span>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">X</a>
             </div>
             <div className="md:col-span-4 flex justify-end items-end"><div className="flex items-center space-x-2"><span>Curated by</span><span className="text-white font-bold">Sentinel Hub</span></div></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
