import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Match, Question } from '../lib/api';
import { 
  Play, 
  Pause, 
  Check, 
  X, 
  Clock, 
  BookOpen, 
  LogOut, 
  SkipForward, 
  Maximize2, 
  Minimize2,
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
  const [bigScreen, setBigScreen] = useState(false);

  useEffect(() => {
    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    if (!musicEnabled) return;

    // Gentle ambient background music
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'); 
    audio.loop = true;
    audio.volume = 0.15;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented
        console.log("Audio autoplay prevented");
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const loadMatch = useCallback(async () => {
    if (!id) return;
    const data = await api.getMatch(id);
    setMatch(data);
    setTimer(data.time_limit || 30);
    setLoading(false);
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
      alert('Fim das perguntas!');
      navigate(`/results/${id}`);
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

  const playSound = (type: 'correct' | 'wrong') => {
    if (localStorage.getItem('soundEnabled') === 'false') return;
    
    // Reliable sound URLs
    const url = type === 'correct' 
      ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
      : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
      
    const audio = new Audio(url);
    audio.play().catch(e => console.error('Audio play failed:', e));
  };

  const handleOptionClick = async (option: string) => {
    if (showAnswer || !currentQuestion) return;
    
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
      alert('Você não tem mais pulos disponíveis!');
      return;
    }

    if (!confirm('Deseja realmente pular esta pergunta?')) return;

    setTimerRunning(false);
    await api.updateScore(match.id, currentTeam.id, 0, true);
    
    const updatedTeams = [...match.teams];
    updatedTeams[turnIndex].skips_used = (updatedTeams[turnIndex].skips_used || 0) + 1;
    
    const nextTurnIndex = (turnIndex + 1) % match.teams.length;
    let nextRound = match.current_round || 1;

    if (nextTurnIndex === 0) {
      nextRound += 1;
      if (match.max_rounds && nextRound > match.max_rounds) {
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

  const handleGoHome = () => {
    if (window.confirm('Voltar para a tela inicial? O progresso atual será perdido.')) {
      navigate('/');
    }
  };

  const handleEndGame = async () => {
    if (!match || !id) return;
    if (window.confirm('Deseja realmente encerrar a partida agora? Irá para a tela de resultados.')) {
      try {
        await api.endMatch(id);
        navigate(`/results/${id}`);
      } catch (error) {
        console.error("Error ending match:", error);
        navigate(`/results/${id}`);
      }
    }
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
      <div className="min-h-screen bg-stone-50 text-slate-900 pb-safe relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        
        {/* Big Screen Toggle */}
        <button 
          onClick={() => setBigScreen(!bigScreen)}
          className="fixed bottom-6 left-6 bg-white text-indigo-600 px-4 py-3 rounded-full font-bold text-sm hover:bg-indigo-50 transition z-50 flex items-center gap-2 border border-indigo-100 shadow-lg"
        >
          {bigScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          {bigScreen ? 'Sair do Telão' : 'Modo Telão'}
        </button>

        {/* Big Screen Overlay */}
        <AnimatePresence>
          {bigScreen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950 z-[100] flex flex-col p-10 text-stone-100 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 border-8 border-stone-100 rounded-full" />
                <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] border-4 border-stone-100 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                  <Scroll size={800} className="text-stone-100 opacity-10" />
                </div>
              </div>

              {/* Big Screen Header */}
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleGoHome}
                      className="p-3 bg-stone-800 text-stone-400 rounded-full hover:bg-stone-700 hover:text-white transition"
                      title="Voltar ao Início"
                    >
                      <Home size={28} />
                    </button>
                    <button 
                      onClick={handleEndGame}
                      className="p-3 bg-stone-800 text-stone-400 rounded-full hover:bg-stone-700 hover:text-red-400 transition"
                      title="Encerrar Partida"
                    >
                      <LogOut size={28} />
                    </button>
                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xl">Desafio Bíblico</p>
                  </div>
                  <h2 className="text-5xl font-serif italic">Rodada {currentRound} / {maxRounds}</h2>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-8xl font-mono font-black text-amber-500">
                    <Clock size={70} />
                    {timer.toString().padStart(2, '0')}s
                  </div>
                </div>
              </div>

              {/* Big Screen Content */}
              <div className="flex-1 flex flex-col justify-center items-center text-center max-w-6xl mx-auto space-y-12 relative z-10">
                <AnimatePresence mode="wait">
                  {!currentQuestion ? (
                    <motion.div 
                      key="no-q"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-8"
                    >
                      <div className="w-32 h-32 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500/20">
                        <Scroll size={64} className="text-amber-500" />
                      </div>
                      <h3 className="text-7xl font-serif font-bold text-stone-200">Preparem-se...</h3>
                      <p className="text-4xl text-stone-400">É a vez do time <span className="text-amber-500 font-bold">{currentTeam.name}</span></p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-12 w-full"
                    >
                      <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 bg-amber-600 px-8 py-3 rounded-full text-2xl font-bold uppercase tracking-widest mb-4 shadow-xl">
                          {getCategoryIcon(currentQuestion.category)}
                          {getCategoryLabel(currentQuestion.category)}
                        </div>
                        <h2 className="text-8xl font-serif font-bold leading-tight text-stone-50 drop-shadow-2xl">
                          {currentQuestion.text}
                        </h2>
                      </div>

                      {showAnswer && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-stone-900/80 backdrop-blur-md p-10 rounded-[3rem] border-2 border-amber-500/30 inline-block shadow-2xl"
                        >
                          <p className="text-amber-400 text-2xl font-bold uppercase tracking-[0.2em] mb-4">Referência Bíblica</p>
                          <p className="text-6xl font-serif font-bold italic text-stone-100">{currentQuestion.reference}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Big Screen Footer - Scoreboard */}
              <div className="grid grid-cols-2 gap-10 mt-12 relative z-10">
                {match.teams.map((team, idx) => {
                  const isActive = idx === turnIndex;
                  return (
                    <div 
                      key={team.id}
                      className={clsx(
                        "p-10 rounded-[3rem] border-4 transition-all flex items-center justify-between",
                        isActive 
                          ? "bg-stone-800 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.2)]" 
                          : "bg-stone-900 border-stone-800 opacity-40"
                      )}
                    >
                      <div className="flex items-center gap-8">
                        <div 
                          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/10"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-3xl font-serif font-bold text-stone-100">{team.name}</p>
                          <div className="flex gap-3 mt-3">
                            {match.skips_allowed ? Array.from({ length: match.skips_allowed }).map((_, i) => (
                              <div 
                                key={i} 
                                className={clsx(
                                  "w-5 h-5 rounded-full border-2",
                                  i < (team.skips_used || 0) ? "bg-stone-700 border-stone-600" : "bg-amber-500 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                )} 
                              />
                            )) : null}
                          </div>
                        </div>
                      </div>
                      <div className="text-8xl font-black text-amber-500">{team.score}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="bg-white pb-3 pt-2 px-4 shadow-sm rounded-b-3xl mb-4 relative z-10">
          <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
            <div className="flex gap-3">
              <button 
                onClick={handleGoHome}
                className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition active:scale-95"
                title="Voltar ao Início"
              >
                <Home size={20} />
              </button>
              <button 
                onClick={handleEndGame}
                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition active:scale-95"
                title="Encerrar Partida"
              >
                <LogOut size={20} />
              </button>
            </div>
            <span className="font-bold text-slate-800 text-sm uppercase tracking-wider truncate max-w-[150px]">
              {match.mode === 'thematic' && match.category_filter ? match.category_filter : 'Desafio Bíblico'}
            </span>
            <div className="w-8" /> {/* Spacer for balance */}
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Rodada {currentRound} / {maxRounds}</span>
            <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Clock size={14} />
              <span className="text-lg font-mono font-bold tracking-wider">
                {timer.toString().padStart(2, '0')}s
              </span>
            </div>
          </div>
          
          <div className="flex justify-center gap-3">
            {match.teams.map((team, idx) => {
              const isActive = idx === turnIndex;
              return (
                <motion.div 
                  key={team.id}
                  animate={{ 
                    scale: isActive ? 1.02 : 1,
                    opacity: isActive ? 1 : 0.6
                  }}
                  className={clsx(
                    "flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors border-2 relative overflow-hidden",
                    isActive 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                      : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-tight opacity-80 truncate w-full text-center px-1">{team.name}</span>
                  <span className="text-lg font-black">{team.score} <span className="text-[10px] font-normal">pts</span></span>
                  {match.skips_allowed ? (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: match.skips_allowed }).map((_, i) => (
                        <div 
                          key={i} 
                          className={clsx(
                            "w-1 h-1 rounded-full",
                            i < (team.skips_used || 0) ? "bg-slate-300" : "bg-yellow-400"
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

        <div className="px-4 max-w-md mx-auto space-y-4 pb-24">
          {/* Turn Indicator */}
          <div className="bg-stone-100/80 backdrop-blur-sm rounded-2xl py-2 px-4 flex items-center justify-center gap-2 border border-stone-200 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentTeam.color }} />
            <span className="text-stone-600 text-xs font-medium">Vez de: <span className="font-bold text-stone-900">{currentTeam.name}</span></span>
          </div>

          <AnimatePresence mode="wait">
            {!currentQuestion ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10"
              >
                <button 
                  onClick={nextQuestion} 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-3 w-full justify-center"
                >
                  <Play size={28} fill="currentColor" />
                  Iniciar Rodada
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Metadata Badges */}
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-200">
                    {currentQuestion.difficulty === 'easy' ? 'Fácil' : currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </span>
                  <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-stone-200 flex items-center gap-1.5">
                    {getCategoryIcon(currentQuestion.category)}
                    {getCategoryLabel(currentQuestion.category)}
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                    10 pts
                  </span>
                </div>

                {/* Question Card */}
                <div className="bg-white p-5 rounded-[2rem] shadow-lg text-center space-y-3 border-b-4 border-stone-200 relative overflow-hidden">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-stone-50 rounded-bl-full border-l border-b border-stone-100" />
                  
                  <h2 className="text-xl font-serif font-bold text-stone-800 leading-relaxed relative z-10">
                    {currentQuestion.text}
                  </h2>
                  
                  {showAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-1 bg-amber-50 p-3 rounded-xl border border-amber-100 relative z-10"
                    >
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Referência Bíblica</p>
                      <div className="flex items-center gap-2 text-stone-700 font-serif font-bold italic text-base">
                        <BookOpen size={16} className="text-amber-500" />
                        {currentQuestion.reference}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Timer Controls Inline */}
                {!timerRunning && timer > 0 && !showAnswer ? (
                  <button 
                    onClick={handleStartTimer}
                    className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Play fill="currentColor" size={24} /> INICIAR TEMPO
                  </button>
                ) : timerRunning ? (
                  <button 
                    onClick={handleStopTimer}
                    className="w-full bg-yellow-500 text-white py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                  >
                    <Pause fill="currentColor" size={24} /> PAUSAR TEMPO
                  </button>
                ) : null}

                {/* Options List */}
                {currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={showAnswer || !timerRunning}
                        className={clsx(
                          "w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all text-left relative overflow-hidden",
                          showAnswer && option === currentQuestion.correct_answer 
                            ? "bg-green-100 border-green-500 text-green-800"
                            : showAnswer && option === selectedOption && option !== currentQuestion.correct_answer
                            ? "bg-red-100 border-red-500 text-red-800"
                            : selectedOption === option
                            ? "bg-indigo-100 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500"
                            : !timerRunning ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : getOptionColor(idx)
                        )}
                      >
                        <div className={clsx(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selectedOption === option ? "border-indigo-600 bg-indigo-600" : "border-current opacity-50"
                        )}>
                          {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="font-semibold opacity-60 mr-1">{String.fromCharCode(65 + idx)})</span>
                        <span className="font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Answer Controls */}
                <div className="flex flex-col gap-3 pt-2">
                  {match.skips_allowed && (currentTeam.skips_used || 0) < match.skips_allowed && !showAnswer && (
                    <button 
                      onClick={handleSkip}
                      className="w-full bg-yellow-100 text-yellow-700 py-3 rounded-2xl font-bold hover:bg-yellow-200 transition flex items-center justify-center gap-2 border border-yellow-200"
                    >
                      <SkipForward size={20} /> Pular Pergunta ({match.skips_allowed - (currentTeam.skips_used || 0)} restantes)
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

