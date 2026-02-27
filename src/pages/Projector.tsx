import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api, Match, Question } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Trophy, Users, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export default function Projector() {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const matchData = await api.getMatch(id);
      setMatch(matchData);
      
      // Get the last asked question
      if (matchData.asked_questions && matchData.asked_questions.length > 0) {
        const lastQuestionId = matchData.asked_questions[matchData.asked_questions.length - 1];
        const questions = await api.getQuestions();
        const question = questions.find(q => q.id === lastQuestionId);
        setCurrentQuestion(question || null);
      } else {
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error("Error loading projector data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    
    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'biblical_challenge_matches') {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll as a fallback
    const interval = setInterval(loadData, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [loadData]);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-medium">Preparando Projeção...</p>
      </div>
    </div>
  );

  if (!match) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <p className="text-2xl">Partida não encontrada</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Trophy size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Desafio Bíblico</h1>
            <p className="text-indigo-400 font-bold tracking-widest uppercase text-sm">
              {match.mode === 'thematic' ? match.category_filter : 'Competição ao Vivo'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-slate-500 uppercase font-black text-xs tracking-widest mb-1">Rodada</p>
            <p className="text-3xl font-black">{match.current_round} <span className="text-slate-600 text-xl">/ {match.max_rounds || 10}</span></p>
          </div>
          <div className="h-12 w-px bg-slate-800" />
          <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700 flex items-center gap-3">
            <Clock className="text-indigo-400" size={24} />
            <span className="text-3xl font-mono font-bold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-8 relative z-10">
        {/* Left: Question Area */}
        <div className="col-span-8 flex flex-col">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="flex-1 flex flex-col justify-center"
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                  
                  <div className="flex items-center gap-3 mb-8">
                    <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/30">
                      {currentQuestion.category.replace('_', ' ')}
                    </span>
                    <span className="bg-white/5 text-slate-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/5">
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  <h2 className="text-6xl font-serif font-bold leading-tight mb-12">
                    {currentQuestion.text}
                  </h2>

                  {currentQuestion.options && (
                    <div className="grid grid-cols-2 gap-6">
                      {currentQuestion.options.map((option, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-6"
                        >
                          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-black text-indigo-400">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-2xl font-medium">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30 animate-pulse">
                    <BookOpen size={64} className="text-indigo-400" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-400 uppercase tracking-tighter">Aguardando Próxima Pergunta</h2>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Leaderboard Area */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 p-8 rounded-[2.5rem] flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-indigo-400" size={24} />
              <h3 className="text-xl font-black uppercase tracking-widest">Placar</h3>
            </div>

            <div className="space-y-4 flex-1">
              {match.teams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  layout
                  className={clsx(
                    "p-6 rounded-3xl border-2 flex items-center justify-between transition-all",
                    "bg-white/5 border-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg"
                      style={{ backgroundColor: team.color, color: '#fff' }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-xl uppercase tracking-tight">{team.name}</p>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: match.skips_allowed || 0 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              i < (team.skips_used || 0) ? "bg-slate-700" : "bg-yellow-500"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black">{team.score}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pontos</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {match.target_score && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-center text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Objetivo</p>
                <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 text-center">
                  <span className="text-2xl font-black text-indigo-400">{match.target_score} PONTOS</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
