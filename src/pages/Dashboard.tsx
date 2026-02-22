import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Database, Clock, Settings as SettingsIcon, HelpCircle, ChevronRight, Flag, HelpCircle as QuestionMark, Book } from 'lucide-react';
import { api } from '../lib/api';
import PageTransition from '../components/PageTransition';

export default function Dashboard() {
  const [stats, setStats] = useState({ questions: 0, teams: 0, matches: 0 });

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700">Desafio</h1>
          <h1 className="text-3xl font-bold text-slate-900 -mt-1">Bíblico</h1>
          <p className="text-slate-500 text-sm mt-1">Gincana Bíblica para Igrejas</p>
        </div>
        <Link to="/settings" className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 hover:bg-indigo-100 transition">
          <SettingsIcon size={24} />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Questions Card */}
        <div className="bg-indigo-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1 aspect-[4/5] shadow-sm">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mb-1">
            <HelpCircle size={20} />
          </div>
          <span className="text-2xl font-bold text-indigo-700">{stats.questions}</span>
          <span className="text-xs text-indigo-400 font-medium">Perguntas</span>
        </div>

        {/* Teams Card */}
        <div className="bg-orange-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1 aspect-[4/5] shadow-sm">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mb-1">
            <Users size={20} />
          </div>
          <span className="text-2xl font-bold text-orange-700">{stats.teams}</span>
          <span className="text-xs text-orange-400 font-medium">Times</span>
        </div>

        {/* Matches Card */}
        <div className="bg-emerald-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1 aspect-[4/5] shadow-sm">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mb-1">
            <Flag size={20} />
          </div>
          <span className="text-2xl font-bold text-emerald-700">{stats.matches}</span>
          <span className="text-xs text-emerald-400 font-medium">Partidas</span>
        </div>
      </div>

      {/* New Match Banner */}
      <Link to="/setup" className="block relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-lg shadow-indigo-200 group hover:shadow-xl transition-all active:scale-[0.98]">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3 text-indigo-600 shadow-md">
              <Play size={24} fill="currentColor" className="ml-1" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Nova Partida</h2>
              <p className="text-indigo-100 text-xs">Iniciar uma gincana bíblica</p>
            </div>
          </div>
          <ChevronRight className="text-white/80" />
        </div>
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      </Link>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/teams" className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col items-center justify-center gap-2 text-center aspect-[4/3] active:bg-slate-50">
          <div className="bg-orange-100 p-3 rounded-full text-orange-500 mb-1">
            <Users size={24} />
          </div>
          <span className="font-medium text-slate-700">Times</span>
        </Link>

        <Link to="/questions" className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col items-center justify-center gap-2 text-center aspect-[4/3] active:bg-slate-50">
          <div className="bg-blue-100 p-3 rounded-full text-blue-500 mb-1">
            <HelpCircle size={24} />
          </div>
          <span className="font-medium text-slate-700">Perguntas</span>
        </Link>

        <Link to="/history" className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col items-center justify-center gap-2 text-center aspect-[4/3] active:bg-slate-50">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-500 mb-1">
            <Clock size={24} />
          </div>
          <span className="font-medium text-slate-700">Histórico</span>
        </Link>

        <Link to="/instructions" className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col items-center justify-center gap-2 text-center aspect-[4/3] active:bg-slate-50">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-500 mb-1">
            <QuestionMark size={24} />
          </div>
          <span className="font-medium text-slate-700">Instruções</span>
        </Link>
      </div>
    </div>
    </PageTransition>
  );
}
