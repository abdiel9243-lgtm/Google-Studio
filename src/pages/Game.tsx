import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Match, Question } from '../lib/api';
import { 
  Play, 
  Pause, 
  Clock, 
  BookOpen, 
  LogOut, 
  SkipForward, 
  Scroll,
  Flame,
  Users,
  Sparkles,
  Leaf,
  Book,
  Home
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import PageTransition from '../components/PageTransition';
import ConfirmModal from '../components/ConfirmModal';

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [turnIndex, setTurnIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    if (!musicEnabled) return;

    // "Deus Está Aqui" style instrumental (Calm Piano/Worship)
    // Using local audio file
    audioRef.current = new Audio('/audio/bg-music.mp3'); 
    audioRef.current.loop = true;
    
    const volume = Number(localStorage.getItem('gameVolume') || '50') / 100;
    audioRef.current.volume = volume * 0.4; // Scale music volume
    
    const playMusic = () => {
      if (audioRef.current && localStorage.getItem('musicEnabled') !== 'false') {
        audioRef.current.play().catch(e => {
          console.log("Audio autoplay prevented, waiting for interaction", e);
        });
      }
    };

    playMusic();
    window.addEventListener('click', playMusic, { once: true });

    return () => {
      window.removeEventListener('click', playMusic);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Effect to control playback speed based on timer
  useEffect(() => {
    if (!audioRef.current) return;

    if (timerRunning) {
      if (timer <= 5) {
        audioRef.current.playbackRate = 1.5; // Fast
      } else if (timer <= 10) {
        audioRef.current.playbackRate = 1.2; // Slightly fast
      } else {
        audioRef.current.playbackRate = 1.0; // Normal
      }
    } else {
      // Reset speed when timer stops
      audioRef.current.playbackRate = 1.0;
    }
  }, [timer, timerRunning]);

  const loadMatch = useCallback(async () => {
    if (!id) return;
    const data = await api.getMatch(id);
    setMatch(data);
    setTimer(data.time_limit || 30);
    setLoading(false);
    playSound('start');
  }, [id]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  const nextQuestion = async () => {
    if (!id) return;
    setLoading(true);
    const question = await api.getNextQuestion(id);
    if (!question) {
      setConfirmModal({
        isOpen: true,
        title: 'Fim das Perguntas',
        message: 'Não há mais perguntas disponíveis. Vamos ver os resultados!',
        type: 'info',
        hideCancel: true,
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          navigate(`/results/${id}`);
        }
      });
      return;
    }
    setCurrentQuestion(question);
    setTimer(match?.time_limit || 30);
    setTimerRunning(false);
    setShowAnswer(false);
    setSelectedOption(null);
    setLoading(false);
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
    setShowAnswer(false);
  };
  
  const handleStopTimer = () => setTimerRunning(false);

  const playSound = (type: 'correct' | 'wrong' | 'skip' | 'click' | 'victory' | 'start') => {
    if (localStorage.getItem('soundEnabled') === 'false') return;
    
    let url = '';
    switch (type) {
      case 'correct':
        url = '/audio/correct.mp3';
        break;
      case 'wrong':
        url = '/audio/wrong.mp3';
        break;
      case 'skip':
        url = '/audio/skip.mp3';
        break;
      case 'click':
        url = '/audio/click.mp3';
        break;
      case 'victory':
        url = '/audio/victory.mp3';
        break;
      case 'start':
        url = '/audio/start.mp3';
        break;
    }
      
    const audio = new Audio(url);
    const volume = Number(localStorage.getItem('gameVolume') || '50') / 100;
    audio.volume = volume;
    audio.play().catch(e => console.error('Audio play failed:', e));
  };

  const handleOptionClick = async (option: string) => {
    if (showAnswer || !currentQuestion) return;
    
    playSound('click');
    setTimerRunning(false);
    setSelectedOption(option);
    setShowAnswer(true);

    const isCorrect = option === currentQuestion.correct_answer;
    
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    // Delay to show feedback before processing score and moving on
    setTimeout(() => {
      handleAnswer(isCorrect);
    }, 2000);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!match || !currentQuestion || !match.teams) return;
    
    const currentTeam = match.teams[turnIndex];
    const points = correct ? 10 : 0; // Fixed 10 points for correct, 0 for wrong

    await api.updateScore(match.id, currentTeam.id, points);
    
    const updatedTeams = [...match.teams];
    updatedTeams[turnIndex].score += points;
    
    // Check for target score win
    if (match.target_score && updatedTeams[turnIndex].score >= match.target_score) {
      playSound('victory');
      await api.endMatch(match.id);
      navigate(`/results/${match.id}`);
      return;
    }

    const nextTurnIndex = (turnIndex + 1) % match.teams.length;
    let nextRound = match.current_round || 1;

    // If we wrapped around to the first team, increment the round
    if (nextTurnIndex === 0) {
      nextRound += 1;
      
      // Check for max rounds end
      if (match.max_rounds && nextRound > match.max_rounds) {
        playSound('victory');
        await api.endMatch(match.id);
        navigate(`/results/${match.id}`);
        return;
      }

      await api.updateRound(match.id, nextRound);
    }

    setMatch({ ...match, teams: updatedTeams, current_round: nextRound });
    setTurnIndex(nextTurnIndex);
    nextQuestion();
  };

  const handleSkip = async () => {
    if (!match || !currentQuestion || !match.teams) return;
    
    const currentTeam = match.teams[turnIndex];
    if ((currentTeam.skips_used || 0) >= (match.skips_allowed || 0)) {
      setConfirmModal({
        isOpen: true,
        title: 'Sem Pulos',
        message: 'Seu time já utilizou todos os pulos permitidos para esta partida.',
        type: 'info',
        hideCancel: true,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Pular Pergunta?',
      message: 'Deseja realmente pular esta pergunta? Você não ganhará pontos, mas poderá tentar outra.',
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setTimerRunning(false);
        playSound('skip');
        
        // Update score in API (0 points, but mark as skip)
        await api.updateScore(match.id, currentTeam.id, 0, true);
        
        // Update local state for skips_used
        const updatedTeams = [...match.teams];
        updatedTeams[turnIndex].skips_used = (updatedTeams[turnIndex].skips_used || 0) + 1;
        
        setMatch({ ...match, teams: updatedTeams });
        
        // Stay on the same team (turnIndex remains the same)
        // Just load a new question
        nextQuestion();
      }
    });
  };

  const handleGoHome = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sair do Jogo?',
      message: 'Voltar para a tela inicial? O progresso atual desta partida será perdido.',
      type: 'danger',
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        navigate('/');
      }
    });
  };

  const handleEndGame = async () => {
    if (!match || !id) return;
    setConfirmModal({
      isOpen: true,
      title: 'Encerrar Partida?',
      message: 'Deseja realmente encerrar a partida agora? Você será direcionado para a tela de resultados.',
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await api.endMatch(id);
          navigate(`/results/${id}`);
        } catch (error) {
          console.error("Error ending match:", error);
          navigate(`/results/${id}`);
        }
      }
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-500">Carregando...</div>;
  if (!match || !match.teams) return <div className="text-center p-10">Partida não encontrada</div>;

  const currentTeam = match.teams[turnIndex];
  const currentRound = Math.floor(match.current_round || 1); 
  const maxRounds = match.max_rounds || 10;

  const getOptionColor = (index: number) => {
    switch(index) {
      case 0: return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case 1: return "bg-orange-50 border-orange-200 text-orange-700";
      case 2: return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case 3: return "bg-yellow-50 border-yellow-200 text-yellow-700";
      default: return "bg-slate-50 border-slate-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'old_testament': return <Scroll size={16} />;
      case 'new_testament': return <Flame size={16} />;
      case 'characters': return <Users size={16} />;
      case 'miracles': return <Sparkles size={16} />;
      case 'parables': return <Leaf size={16} />;
      case 'books': return <Book size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'old_testament': return 'Antigo Testamento';
      case 'new_testament': return 'Novo Testamento';
      case 'characters': return 'Personagens';
      case 'miracles': return 'Milagres';
      case 'parables': return 'Parábolas';
      case 'books': return 'Livros';
      default: return category.replace('_', ' ');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-premium-black text-zinc-100 pb-safe pt-safe relative overflow-hidden">
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

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(var(--color-gold) 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        </div>
        
        {/* Header Section */}
        <div className="glass-premium pb-4 pt-4 px-4 rounded-b-[2.5rem] mb-6 relative z-10 border-b border-white/10">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
            <div className="flex gap-3">
              <button 
                onClick={handleGoHome}
                className="p-2.5 bg-white/5 text-zinc-400 rounded-2xl hover:bg-white/10 transition active:scale-95 border border-white/5"
                title="Voltar ao Início"
              >
                <Home size={20} />
              </button>
              <button 
                onClick={handleEndGame}
                className="p-2.5 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition active:scale-95 border border-red-500/10"
                title="Encerrar Partida"
              >
                <LogOut size={20} />
              </button>
            </div>
            <span className="font-serif italic text-gold text-lg tracking-wide truncate max-w-[180px]">
              {match.mode === 'thematic' && match.category_filter ? match.category_filter : 'Desafio Bíblico'}
            </span>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">Rodada {currentRound} <span className="opacity-30">/</span> {maxRounds}</span>
            <div className="flex items-center gap-2 text-gold bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <Clock size={14} className="animate-pulse" />
              <span className="text-xl font-mono font-bold tracking-tighter">
                {timer.toString().padStart(2, '0')}s
              </span>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            {match.teams.map((team, idx) => {
              const isActive = idx === turnIndex;
              return (
                <motion.div 
                  key={team.id}
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 1 : 0.4
                  }}
                  className={clsx(
                    "flex flex-col items-center justify-center flex-1 h-20 rounded-2xl transition-all border relative overflow-hidden",
                    isActive 
                      ? "bg-gold text-premium-black border-gold shadow-[0_0_25px_rgba(212,175,55,0.3)]" 
                      : "bg-white/5 text-zinc-400 border-white/10"
                  )}
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 truncate w-full text-center px-2 mb-1">{team.name}</span>
                  <span className="text-xl font-black">{team.score} <span className="text-[10px] font-normal opacity-60">pts</span></span>
                  {match.skips_allowed ? (
                    <div className="flex gap-1 mt-1.5">
                      {Array.from({ length: match.skips_allowed }).map((_, i) => (
                        <div 
                          key={i} 
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            i < (team.skips_used || 0) ? "bg-black/20" : isActive ? "bg-premium-black" : "bg-gold/40"
                          )} 
                        />
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="px-4 relative z-10 max-w-2xl mx-auto">
          {/* Turn Indicator */}
          <div className="glass rounded-2xl py-2 px-4 flex items-center justify-center gap-3 border border-white/5 mb-6">
            <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ backgroundColor: currentTeam.color || '#D4AF37' }} />
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Vez de: <span className="font-bold text-white">{currentTeam.name}</span></span>
          </div>

          <AnimatePresence mode="wait">
            {!currentQuestion ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-12"
              >
                <button 
                  onClick={nextQuestion} 
                  className="bg-gold text-premium-black px-10 py-4 rounded-2xl text-xl font-black shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:scale-105 transition flex items-center gap-4 w-full justify-center"
                >
                  <Play size={32} fill="currentColor" />
                  INICIAR RODADA
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Metadata Badges */}
                <div className="flex justify-center gap-3 flex-wrap">
                  <span className="bg-white/5 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10">
                    {currentQuestion.difficulty === 'easy' ? 'Fácil' : currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </span>
                  <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-gold/20 flex items-center gap-2">
                    {getCategoryIcon(currentQuestion.category)}
                    {getCategoryLabel(currentQuestion.category)}
                  </span>
                  <span className="bg-white/5 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10">
                    10 PTS
                  </span>
                </div>

                {/* Question Card */}
                <div className="glass-premium p-8 rounded-[2.5rem] text-center space-y-6 border border-white/10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                  
                  <h2 className="text-2xl font-serif font-bold text-white leading-relaxed relative z-10">
                    {currentQuestion.text}
                  </h2>
                  
                  {showAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-2 bg-gold/5 p-4 rounded-2xl border border-gold/10 relative z-10"
                    >
                      <p className="text-[9px] font-bold text-gold uppercase tracking-[0.3em]">Referência Bíblica</p>
                      <div className="flex items-center gap-3 text-white font-serif font-bold italic text-lg">
                        <BookOpen size={20} className="text-gold" />
                        {currentQuestion.reference}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Timer Controls Inline */}
                <div className="flex justify-center">
                  {!timerRunning && timer > 0 && !showAnswer ? (
                    <button 
                      onClick={handleStartTimer}
                      className="w-full bg-gold text-premium-black py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      <Play fill="currentColor" size={28} /> INICIAR TEMPO
                    </button>
                  ) : timerRunning ? (
                    <button 
                      onClick={handleStopTimer}
                      className="w-full bg-white/10 text-white py-5 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                    >
                      <Pause fill="currentColor" size={28} /> PAUSAR TEMPO
                    </button>
                  ) : null}
                </div>

                {/* Options List */}
                {currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={showAnswer || !timerRunning}
                        className={clsx(
                          "w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left relative overflow-hidden group",
                          showAnswer && option === currentQuestion.correct_answer 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            : showAnswer && option === selectedOption && option !== currentQuestion.correct_answer
                            ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                            : selectedOption === option
                            ? "bg-gold/20 border-gold text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                            : !timerRunning ? "bg-white/5 border-white/5 text-zinc-600 cursor-not-allowed" : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 text-zinc-300"
                        )}
                      >
                        <div className={clsx(
                          "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all",
                          selectedOption === option ? "bg-gold border-gold text-premium-black" : "border-white/10 bg-white/5 text-zinc-500 group-hover:border-gold/50 group-hover:text-gold"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-medium tracking-tight text-lg">{option}</span>
                        
                        {showAnswer && option === currentQuestion.correct_answer && (
                          <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Answer Controls */}
                <div className="flex flex-col gap-4 pt-4">
                  {match.skips_allowed && (currentTeam.skips_used || 0) < match.skips_allowed && !showAnswer && (
                    <button 
                      onClick={handleSkip}
                      className="w-full glass py-5 rounded-2xl font-bold text-zinc-400 hover:text-gold hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-white/5"
                    >
                      <SkipForward size={22} /> Pular Pergunta ({match.skips_allowed - (currentTeam.skips_used || 0)} restantes)
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}

