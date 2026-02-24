import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Play, Database, Settings as SettingsIcon, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isGameScreen = location.pathname.includes('/game/');
  const isHome = location.pathname === '/';

  if (isGameScreen) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-safe-top bg-black z-50" />
        <Outlet />
      </>
    );
  }

  const getPageTitle = (pathname: string) => {
    if (pathname === '/') return 'Desafio Bíblico';
    if (pathname.startsWith('/teams')) return 'Gerenciar Times';
    if (pathname.startsWith('/setup')) return 'Nova Partida';
    if (pathname.startsWith('/questions')) return 'Banco de Perguntas';
    if (pathname.startsWith('/settings')) return 'Configurações';
    if (pathname.startsWith('/history')) return 'Histórico';
    if (pathname.startsWith('/instructions')) return 'Instruções';
    if (pathname.startsWith('/results')) return 'Resultados';
    return 'Desafio Bíblico';
  };

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Users, label: 'Times', path: '/teams' },
    { icon: Play, label: 'Jogar', path: '/setup' },
    { icon: Database, label: 'Perguntas', path: '/questions' },
    { icon: SettingsIcon, label: 'Config', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 pt-safe-top shadow-md">
        <div className="h-14 px-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-1 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <span className="font-bold text-lg tracking-tight">{getPageTitle(location.pathname)}</span>
          </div>

          {isHome && (
            <Link to="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <SettingsIcon size={20} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content with padding for header */}
      <main className="max-w-md mx-auto p-4 pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe-bottom z-40">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
