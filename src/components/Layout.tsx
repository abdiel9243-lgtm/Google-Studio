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
    </div>
  );
}
