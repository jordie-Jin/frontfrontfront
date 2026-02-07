// 메인 애플리케이션 셸로 라우팅과 대시보드 레이아웃을 구성합니다.
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Dashboard from './pages/DashboardPage';
import Companies from './pages/companies/Companies';
import CompanyDetail from './pages/companies/CompanyDetail';
import QnaPage from './pages/decisionRoom/QnaPage';
import NoticesPage from './pages/decisionRoom/NoticesPage';
import Landing from './pages/Landing';
import AddCompany from './pages/companies/AddCompany';
import VerifyEmail from './pages/auth/VerifyEmail';
import { getStoredUser } from './services/auth';

const SidebarItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname.startsWith(to);
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) return;
    event.preventDefault();
    navigate(to, { replace: true, state: { resetKey: Date.now() } });
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`flex items-center space-x-4 px-6 py-4 transition-all duration-300 ${
        isActive ? 'sidebar-active text-white bg-white/5' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
    </Link>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const user = getStoredUser();
  const displayName = user?.name ?? user?.email ?? 'Unknown User';
  const displayMeta = user?.email ?? 'Signed in';
  const resetKey = (location.state as { resetKey?: number } | null)?.resetKey;

  useEffect(() => {
    if (!resetKey) return;
    window.scrollTo(0, 0);
  }, [resetKey]);

  return (
    <div className="flex h-screen w-full bg-[#050505]">
      <aside className="w-64 border-r border-white/10 flex flex-col z-20 glass-panel">
        <div className="p-8 mb-8">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:border-slate-400 transition-colors">
              <img
                src="/img/owllogo.png"
                alt="보기"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold tracking-widest serif text-white">SENTINEL</h1>
          </Link>
        </div>

        <nav className="flex-1">
          <SidebarItem to="/dashboard" icon="fa-th-large" label="대시보드" />
          <SidebarItem to="/companies" icon="fa-handshake" label="협력사" />
          <SidebarItem to="/decision-room/notices" icon="fa-bell" label="공지사항" />
          <SidebarItem to="/decision-room/qna" icon="fa-comments" label="Q&A" />
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
              <img src="https://picsum.photos/100/100" alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{displayMeta}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto">
        <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
          <iframe
            src="https://my.spline.design/retrofuturisticcircuitloop-tuqsKqc0Zul737nHijrJjx50/"
            frameBorder="0"
            width="100%"
            height="100%"
            title="Spline Background"
          ></iframe>
        </div>
        <div className="relative z-10 p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardLayout children={<Dashboard />} />} />
        <Route path="/companies" element={<DashboardLayout children={<Companies />} />} />
        <Route path="/companies/:id" element={<DashboardLayout children={<CompanyDetail />} />} />
        <Route path="/companies/add" element={<DashboardLayout children={<AddCompany />} />} />
        <Route path="/decision-room/notices" element={<DashboardLayout children={<NoticesPage />} />} />
        <Route path="/decision-room/qna" element={<DashboardLayout children={<QnaPage />} />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
};

export default App;
