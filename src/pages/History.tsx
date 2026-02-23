import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Users, Trophy, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import { api, Match } from '../lib/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';

type MatchWithDetails = Match & { avg_response_time: number };

export default function History() {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

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
    if (confirm('Tem certeza que deseja excluir este histórico de partida?')) {
      await api.deleteMatch(id);
      loadMatches();
    }
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
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Histórico de Partidas</h1>
        </div>

        <div className="p-4 space-y-4 max-w-md mx-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Carregando...</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Trophy size={32} />
              </div>
              <p className="text-slate-500 font-medium">Nenhuma partida registrada.</p>
            </div>
          ) : (
            matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => toggleExpand(match.id)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer transition-all hover:shadow-md"
              >
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                          match.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {match.status === 'finished' ? 'Finalizada' : 'Em andamento'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600">
                          {getModeLabel(match.mode)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={12} />
                        {formatDate((match as any).created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDeleteMatch(e, match.id)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Excluir partida"
                      >
                        <Trash2 size={18} />
                      </button>
                      {expandedMatchId === match.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} className="text-slate-400" />
                    <span>{match.teams?.length || 0} times</span>
                    <span className="text-slate-300">•</span>
                    <Target size={16} className="text-slate-400" />
                    <span>{match.current_round || 0} rodadas</span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedMatchId === match.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50 border-t border-slate-100"
                    >
                      <div className="p-5 space-y-4">
                        {/* Teams Scores */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placar Final</p>
                          {match.teams?.map((team, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{ backgroundColor: team.color }}>
                                  {team.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-700">{team.name}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-bold text-slate-800 text-lg leading-none">{team.score} pts</p>
                                  {team.skips_used > 0 && (
                                    <p className="text-[9px] text-slate-400 font-medium uppercase mt-1">
                                      {team.skips_used} {team.skips_used === 1 ? 'pulo' : 'pulos'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 mb-1">Tempo Médio</p>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                              <Clock size={16} />
                              {formatTime(match.avg_response_time)}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 mb-1">Rodadas Jogadas</p>
                            <div className="flex items-center gap-2 text-orange-600 font-bold">
                              <Target size={16} />
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
