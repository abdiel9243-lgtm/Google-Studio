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
      <div className="space-y-10 pb-16">
      
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Questions Card */}
        <div className="glass-premium rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center space-y-2 aspect-[4/5] border border-white/10 shadow-2xl group hover:border-gold/30 transition-all">
          <div className="bg-gold/10 p-3 rounded-2xl text-gold mb-1 border border-gold/20 group-hover:scale-110 transition-transform">
            <Book size={20} />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">{stats.questions}</span>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Perguntas</span>
        </div>

        {/* Teams Card */}
        <div className="glass-premium rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center space-y-2 aspect-[4/5] border border-white/10 shadow-2xl group hover:border-gold/30 transition-all">
          <div className="bg-gold/10 p-3 rounded-2xl text-gold mb-1 border border-gold/20 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">{stats.teams}</span>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Times</span>
        </div>

        {/* Matches Card */}
        <div className="glass-premium rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center space-y-2 aspect-[4/5] border border-white/10 shadow-2xl group hover:border-gold/30 transition-all">
          <div className="bg-gold/10 p-3 rounded-2xl text-gold mb-1 border border-gold/20 group-hover:scale-110 transition-transform">
            <Flag size={20} />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">{stats.matches}</span>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Partidas</span>
        </div>
      </div>

      {/* New Match Banner */}
      <Link to="/setup" className="block relative overflow-hidden rounded-[3rem] bg-gold p-10 text-premium-black shadow-[0_0_50px_rgba(212,175,55,0.3)] group hover:scale-[1.02] transition-all active:scale-[0.98]">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="bg-premium-black rounded-[1.5rem] p-5 text-gold shadow-2xl group-hover:rotate-6 transition-transform">
              <Play size={40} fill="currentColor" className="ml-1" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold italic tracking-tight">Nova Partida</h2>
              <p className="text-premium-black/60 text-[10px] font-bold uppercase tracking-[0.25em]">Iniciar Desafio Bíblico</p>
            </div>
          </div>
          <ChevronRight size={40} className="text-premium-black/30 group-hover:translate-x-3 transition-transform" />
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-black/10 rounded-full blur-2xl opacity-30" />
      </Link>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-5">
        <Link to="/teams" className="glass-premium p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition flex flex-col items-center justify-center gap-4 text-center aspect-[4/3] active:scale-95 group shadow-xl">
          <div className="bg-white/5 p-5 rounded-2xl text-zinc-400 group-hover:text-gold group-hover:bg-gold/10 transition-all border border-white/5 group-hover:border-gold/20">
            <Users size={32} />
          </div>
          <span className="font-bold text-zinc-400 uppercase tracking-[0.2em] text-[10px] group-hover:text-white transition-colors">Times</span>
        </Link>

        <Link to="/questions" className="glass-premium p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition flex flex-col items-center justify-center gap-4 text-center aspect-[4/3] active:scale-95 group shadow-xl">
          <div className="bg-white/5 p-5 rounded-2xl text-zinc-400 group-hover:text-gold group-hover:bg-gold/10 transition-all border border-white/5 group-hover:border-gold/20">
            <Database size={32} />
          </div>
          <span className="font-bold text-zinc-400 uppercase tracking-[0.2em] text-[10px] group-hover:text-white transition-colors">Perguntas</span>
        </Link>

        <Link to="/history" className="glass-premium p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition flex flex-col items-center justify-center gap-4 text-center aspect-[4/3] active:scale-95 group shadow-xl">
          <div className="bg-white/5 p-5 rounded-2xl text-zinc-400 group-hover:text-gold group-hover:bg-gold/10 transition-all border border-white/5 group-hover:border-gold/20">
            <Clock size={32} />
          </div>
          <span className="font-bold text-zinc-400 uppercase tracking-[0.2em] text-[10px] group-hover:text-white transition-colors">Histórico</span>
        </Link>

        <Link to="/instructions" className="glass-premium p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition flex flex-col items-center justify-center gap-4 text-center aspect-[4/3] active:scale-95 group shadow-xl">
          <div className="bg-white/5 p-5 rounded-2xl text-zinc-400 group-hover:text-gold group-hover:bg-gold/10 transition-all border border-white/5 group-hover:border-gold/20">
            <HelpCircle size={32} />
          </div>
          <span className="font-bold text-zinc-400 uppercase tracking-[0.2em] text-[10px] group-hover:text-white transition-colors">Instruções</span>
        </Link>
      </div>
    </div>
    </PageTransition>
  );
}
