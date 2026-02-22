import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, Team } from '../lib/api';
import { 
  Play, 
  ArrowLeft, 
  Zap, 
  Trophy, 
  Sliders, 
  Clock, 
  Hourglass, 
  AlertTriangle,
  CheckCircle2,
  Repeat
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion } from 'motion/react';
import clsx from 'clsx';

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}
    >
      <motion.div 
        layout
        className="w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

export default function MatchSetup() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [mode, setMode] = useState('quick');
  const [targetScore, setTargetScore] = useState(50);
  const [maxRounds, setMaxRounds] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [useTimeLimit, setUseTimeLimit] = useState(true);

  useEffect(() => {
    api.getTeams().then(setTeams);
  }, []);

  const toggleTeam = (id: string) => {
    if (selectedTeams.includes(id)) {
      setSelectedTeams(selectedTeams.filter(t => t !== id));
    } else {
      setSelectedTeams([...selectedTeams, id]);
    }
  };

  const handleStart = async () => {
    if (selectedTeams.length < 1) return alert('Selecione pelo menos 1 time');
    const match = await api.createMatch({
      mode,
      teams: selectedTeams,
      target_score: mode === 'quick' ? 0 : targetScore,
      max_rounds: mode === 'championship' ? 0 : maxRounds,
      time_limit: useTimeLimit ? timeLimit : 0
    });
    navigate(`/game/${match.id}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Configurar Partida</h1>
        </div>

        <div className="p-4 space-y-8 max-w-md mx-auto">
          
          {/* Game Mode */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold">Modo de Jogo</h3>
            <div className="space-y-3">
              {/* Quick Mode */}
              <button
                onClick={() => setMode('quick')}
                className={clsx(
                  "w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all",
                  mode === 'quick' 
                    ? "bg-green-50 border-green-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    mode === 'quick' ? "bg-green-200 text-green-700" : "bg-green-100 text-green-600"
                  )}>
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className={clsx("font-bold text-lg", mode === 'quick' ? "text-green-800" : "text-slate-800")}>Rápido</p>
                    <p className={clsx("text-sm", mode === 'quick' ? "text-green-600" : "text-slate-500")}>10 rodadas</p>
                  </div>
                </div>
                {mode === 'quick' && (
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </button>

              {/* Championship Mode */}
              <button
                onClick={() => setMode('championship')}
                className={clsx(
                  "w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all",
                  mode === 'championship' 
                    ? "bg-yellow-50 border-yellow-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    mode === 'championship' ? "bg-yellow-200 text-yellow-700" : "bg-yellow-100 text-yellow-600"
                  )}>
                    <Trophy size={24} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className={clsx("font-bold text-lg", mode === 'championship' ? "text-yellow-800" : "text-slate-800")}>Campeonato</p>
                    <p className={clsx("text-sm", mode === 'championship' ? "text-yellow-600" : "text-slate-500")}>Pontuação alvo</p>
                  </div>
                </div>
                {mode === 'championship' && (
                  <div className="bg-yellow-500 text-white rounded-full p-1">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </button>

              {/* Custom Mode */}
              <button
                onClick={() => setMode('custom')}
                className={clsx(
                  "w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all",
                  mode === 'custom' 
                    ? "bg-indigo-50 border-indigo-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    mode === 'custom' ? "bg-indigo-200 text-indigo-700" : "bg-indigo-100 text-indigo-600"
                  )}>
                    <Sliders size={24} />
                  </div>
                  <div className="text-left">
                    <p className={clsx("font-bold text-lg", mode === 'custom' ? "text-indigo-800" : "text-slate-800")}>Personalizado</p>
                    <p className={clsx("text-sm", mode === 'custom' ? "text-indigo-600" : "text-slate-500")}>Configure tudo</p>
                  </div>
                </div>
                {mode === 'custom' && (
                  <div className="bg-indigo-500 text-white rounded-full p-1">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* Target Score (Only for Championship) */}
          {mode === 'championship' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <h3 className="text-indigo-600 font-semibold">Pontuação Alvo</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <span className="font-medium text-slate-800">Primeiro a chegar em</span>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                    {targetScore} pts
                  </span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="50"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>50 pts</span>
                  <span>500 pts</span>
                </div>
              </div>
            </motion.section>
          )}

          {/* Custom Settings (Only for Custom Mode) */}
          {mode === 'custom' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <h3 className="text-indigo-600 font-semibold">Configurações Avançadas</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                
                {/* Max Rounds */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Repeat size={16} />
                      </div>
                      <span className="font-medium text-slate-800">Rodadas Máximas</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                      {maxRounds}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="5"
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="h-px bg-slate-100" />

                {/* Target Score */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Trophy size={16} />
                      </div>
                      <span className="font-medium text-slate-800">Pontuação Alvo</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                      {targetScore} pts
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="500" 
                    step="50"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

              </div>
            </motion.section>
          )}

          {/* Time Limit */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold">Limite de Tempo por Pergunta</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <span className="font-medium text-slate-800">Usar limite de tempo</span>
                </div>
                <Switch checked={useTimeLimit} onChange={setUseTimeLimit} />
              </div>

              {useTimeLimit && (
                <div className="space-y-4 pt-2 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Hourglass size={16} />
                      </div>
                      <span className="font-medium text-slate-800">Segundos</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                      {timeLimit} seg
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="120" 
                    step="5"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Team Selection */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold">Selecionar Times ({selectedTeams.length})</h3>
            
            {teams.length === 0 ? (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                  <AlertTriangle size={24} />
                </div>
                <p className="text-orange-800 font-medium">Nenhum time criado. Crie times primeiro!</p>
                <button 
                  onClick={() => navigate('/teams')}
                  className="text-orange-600 font-bold hover:underline text-sm"
                >
                  Ir para cadastro de times
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {teams.map(team => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={clsx(
                        "p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3",
                        isSelected 
                          ? "bg-indigo-50 border-indigo-500 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-indigo-200"
                      )}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0" 
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={clsx("font-bold truncate", isSelected ? "text-indigo-900" : "text-slate-700")}>
                        {team.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Start Button */}
          <div className="pt-4">
            <button
              onClick={handleStart}
              disabled={selectedTeams.length === 0}
              className="w-full bg-slate-200 text-slate-400 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed enabled:bg-indigo-600 enabled:text-white enabled:shadow-lg enabled:hover:bg-indigo-700 transition-all"
            >
              <Play fill="currentColor" size={20} />
              Iniciar Partida
            </button>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
