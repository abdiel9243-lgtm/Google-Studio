import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Match, Question } from '../lib/api';
import { Play, Pause, Check, X, Clock, BookOpen, LogOut } from 'lucide-react';
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
    setShowAnswer(true); // Show answer when timer starts
  };
  
  const handleStopTimer = () => setTimerRunning(false);

  const handleAnswer = async (correct: boolean) => {
    if (!match || !currentQuestion || !match.teams) return;
    
    setTimerRunning(false);
    const currentTeam = match.teams[turnIndex];
    let points = 0;

    if (correct) {
      const basePoints = currentQuestion.difficulty === 'easy' ? 10 : currentQuestion.difficulty === 'medium' ? 20 : 30;
      const timeBonus = timer > (match.time_limit || 30) - 5 ? 5 : timer > (match.time_limit || 30) - 10 ? 3 : 0;
      points = basePoints + timeBonus;
    } else {
      points = -5;
    }

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

  const handleEndMatch = async () => {
    if (!match || !id) return;
    if (confirm('Tem certeza que deseja encerrar a partida agora?')) {
      await api.endMatch(id);
      navigate(`/results/${id}`);
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-safe relative">
        {/* End Match Button */}
        <button 
          onClick={handleEndMatch}
          className="fixed bottom-6 right-6 bg-white text-red-500 px-4 py-3 rounded-full font-bold text-sm hover:bg-red-50 transition z-50 flex items-center gap-2 border border-red-100 shadow-lg"
        >
          <LogOut size={18} />
          Encerrar
        </button>

        {/* Header Section */}
        <div className="bg-white pb-4 pt-2 px-4 shadow-sm rounded-b-3xl mb-6">
          <div className="text-center mb-4">
            <span className="text-slate-500 font-medium text-sm">Rodada {currentRound} / {maxRounds}</span>
          </div>
          
          <div className="flex justify-center gap-4">
            {match.teams.map((team, idx) => {
              const isActive = idx === turnIndex;
              return (
                <motion.div 
                  key={team.id}
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 1 : 0.7
                  }}
                  className={clsx(
                    "flex flex-col items-center justify-center w-32 h-20 rounded-2xl transition-colors border-2 relative overflow-hidden",
                    isActive 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                      : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute inset-0 bg-white/10"
                    />
                  )}
                  <span className="text-sm font-medium opacity-90">{team.name}</span>
                  <span className="text-2xl font-bold">{team.score} pts</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="px-4 max-w-md mx-auto space-y-6">
          {/* Turn Indicator */}
          <div className="bg-indigo-50 rounded-full py-3 px-6 flex items-center justify-center gap-2 border border-indigo-100 shadow-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTeam.color }} />
            <span className="text-indigo-900 font-medium">Vez do time: <span className="font-bold">{currentTeam.name}</span></span>
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
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-3 w-full justify-center"
                >
                  <Play size={28} fill="currentColor" />
                  Iniciar Rodada
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                {/* Metadata Badges */}
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {currentQuestion.difficulty === 'easy' ? 'Fácil' : currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {currentQuestion.category.replace('_', ' ')}
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {currentQuestion.difficulty === 'easy' ? '10 pts' : currentQuestion.difficulty === 'medium' ? '20 pts' : '30 pts'}
                  </span>
                </div>

                {/* Question Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm text-center space-y-4">
                  <h2 className="text-xl font-bold text-slate-800 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                  {showAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center justify-center gap-2 text-indigo-500 text-sm font-medium bg-indigo-50 p-2 rounded-lg"
                    >
                      <BookOpen size={16} />
                      {currentQuestion.reference}
                    </motion.div>
                  )}
                </div>

                {/* Timer Section */}
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Clock size={20} />
                    <span className="text-4xl font-mono font-bold tracking-wider">
                      00:{timer.toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  {!timerRunning && timer > 0 && !showAnswer ? (
                    <button 
                      onClick={handleStartTimer}
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <Play fill="currentColor" size={20} /> INICIAR TEMPO
                    </button>
                  ) : timerRunning ? (
                    <button 
                      onClick={handleStopTimer}
                      className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                    >
                      <Pause fill="currentColor" size={20} /> PAUSAR
                    </button>
                  ) : null}
                </div>

                {/* Options List */}
                {currentQuestion.options && (
                  <div className="space-y-3">
                    {JSON.parse(currentQuestion.options as unknown as string).map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => !showAnswer && setSelectedOption(option)}
                        disabled={showAnswer}
                        className={clsx(
                          "w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left relative overflow-hidden",
                          showAnswer && option === currentQuestion.correct_answer 
                            ? "bg-green-100 border-green-500 text-green-800"
                            : showAnswer && option === selectedOption && option !== currentQuestion.correct_answer
                            ? "bg-red-100 border-red-500 text-red-800"
                            : selectedOption === option
                            ? "bg-indigo-100 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500"
                            : getOptionColor(idx)
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
                {showAnswer && (
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleAnswer(true)} 
                      className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Check /> Acertou
                    </button>
                    <button 
                      onClick={() => handleAnswer(false)} 
                      className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <X /> Errou
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}

