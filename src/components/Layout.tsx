import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Play, Database, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  const isGameScreen = location.pathname.includes('/game/');

  if (isGameScreen) {
    return <Outlet />;
  }

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Users, label: 'Times', path: '/teams' },
    { icon: Play, label: 'Jogar', path: '/setup' },
    { icon: Database, label: 'Perguntas', path: '/questions' },
    { icon: SettingsIcon, label: 'Config', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <main className="max-w-md mx-auto p-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 shadow-lg pb-safe z-50 rounded-t-3xl">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full h-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute top-2 w-12 h-8 bg-indigo-100 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={clsx("relative z-10 transition-colors duration-200", isActive ? "text-indigo-600" : "text-slate-400")}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={clsx("text-[10px] font-medium mt-1 transition-colors duration-200", isActive ? "text-indigo-600" : "text-slate-400")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
