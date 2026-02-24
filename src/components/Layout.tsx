import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Play, Database, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  const isGameScreen = location.pathname.includes('/game/');

  if (isGameScreen) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-safe-top bg-black z-50" />
        <Outlet />
      </>
    );
  }

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Users, label: 'Times', path: '/teams' },
    { icon: Play, label: 'Jogar', path: '/setup' },
    { icon: Database, label: 'Perguntas', path: '/questions' },
    { icon: SettingsIcon, label: 'Config', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 pt-safe-top">
      <div className="fixed top-0 left-0 right-0 h-safe-top bg-black z-50" />
      <main className="max-w-md mx-auto p-4">
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
