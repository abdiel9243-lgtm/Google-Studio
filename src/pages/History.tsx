import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Users, Trophy, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import { api, Match } from '../lib/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from '../components/ConfirmModal';

type MatchWithDetails = Match & { avg_response_time: number };

export default function History() {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    hideCancel?: boolean;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const data = await api.getMatches();
    // Add default avg_response_time since it's not in the base Match type anymore
    const matchesWithDetails = data.map(m => ({ ...m, avg_response_time: 0 }));
    setMatches(matchesWithDetails);
    setLoading(false);
  };

  const handleDeleteMatch = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Histórico?',
      message: 'Tem certeza que deseja excluir este histórico de partida? Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await api.deleteMatch(id);
        loadMatches();
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'quick': return 'Rápido';
      case 'championship': return 'Campeonato';
      default: return 'Personalizado';
    }
  };

  const formatTime = (ms: number) => {
    if (!ms) return '0s';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-premium-black pb-24">
        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          hideCancel={confirmModal.hideCancel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />

        {/* Header */}
        <div className="glass-premium p-6 flex items-center gap-6 shadow-xl sticky top-0 z-30 border-b border-white/10">
          <Link to="/" className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-zinc-400 hover:text-gold">
            <ArrowLeft size={24} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-bold italic text-gold">Histórico</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registros de Partidas</p>
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
              <p className="text-zinc-500 font-serif italic text-lg">Buscando pergaminhos...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-24 glass-premium rounded-[3rem] border border-white/10 shadow-2xl">
              <div className="bg-gold/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gold border border-gold/20 shadow-lg">
                <Trophy size={48} />
              </div>
              <p className="text-zinc-400 font-serif italic text-xl">Nenhuma partida registrada.</p>
              <Link to="/setup" className="mt-8 inline-block text-gold font-bold uppercase tracking-widest text-xs hover:underline">
                Iniciar primeira partida
              </Link>
            </div>
          ) : (
            matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => toggleExpand(match.id)}
                className="glass-premium rounded-[2.5rem] border border-white/10 overflow-hidden cursor-pointer transition-all hover:border-gold/30 shadow-xl group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          "text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest border",
                          match.status === 'finished' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        )}>
                          {match.status === 'finished' ? 'Finalizada' : 'Em andamento'}
                        </span>
                        <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/10">
                          {getModeLabel(match.mode)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-serif italic">
                        <Calendar size={14} className="text-gold/50" />
                        {formatDate((match as any).created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleDeleteMatch(e, match.id)}
                        className="p-3 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                        title="Excluir partida"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-zinc-500 group-hover:text-gold transition-colors">
                        {expandedMatchId === match.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gold/50" />
                      <span>{match.teams?.length || 0} times</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-gold/50" />
                      <span>{match.current_round || 0} rodadas</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedMatchId === match.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white/[0.02] border-t border-white/5"
                    >
                      <div className="p-8 space-y-8">
                        {/* Teams Scores */}
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Placar Final</p>
                          <div className="grid gap-3">
                            {match.teams?.map((team, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/10" style={{ backgroundColor: team.color }}>
                                    {team.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-serif font-bold text-white text-lg italic">{team.name}</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gold text-2xl leading-none tracking-tight">{team.score}<span className="text-xs ml-1 opacity-50">pts</span></p>
                                  {team.skips_used > 0 && (
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase mt-2 tracking-widest">
                                      {team.skips_used} {team.skips_used === 1 ? 'pulo' : 'pulos'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner group/stat">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Tempo Médio</p>
                            <div className="flex items-center gap-3 text-gold font-bold text-xl">
                              <Clock size={20} className="text-gold/50 group-hover/stat:scale-110 transition-transform" />
                              {formatTime(match.avg_response_time)}
                            </div>
                          </div>
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner group/stat">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Total Rodadas</p>
                            <div className="flex items-center gap-3 text-gold font-bold text-xl">
                              <Target size={20} className="text-gold/50 group-hover/stat:scale-110 transition-transform" />
                              {match.current_round || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
