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
  Repeat,
  Plus,
  Minus,
  BookOpen,
  Timer,
  Tags
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

function NumberControl({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  suffix 
}: { 
  label: React.ReactNode; 
  value: number; 
  onChange: (v: number) => void; 
  min: number; 
  max: number; 
  step: number; 
  suffix: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {label}
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
          {value} {suffix}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition touch-manipulation"
        >
          <Minus size={20} />
        </button>
        <div className="flex-1 px-2">
          <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        <button 
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition touch-manipulation"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
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
  const [skipsAllowed, setSkipsAllowed] = useState(3);
  const [useSkips, setUseSkips] = useState(true);
  const [category, setCategory] = useState('all');

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
    
    let finalMaxRounds = maxRounds;
    let finalTimeLimit = timeLimit;
    let finalTargetScore = targetScore;

    // Apply presets based on mode
    if (mode === 'quick') {
      finalMaxRounds = 10;
      finalTargetScore = 0;
    } else if (mode === 'classic') {
      finalMaxRounds = 20;
      finalTargetScore = 0;
    } else if (mode === 'speed') {
      finalMaxRounds = 15;
      finalTimeLimit = 15;
      finalTargetScore = 0;
    } else if (mode === 'championship') {
      finalMaxRounds = 0; // Unlimited rounds until score
    }

    const match = await api.createMatch({
      mode,
      teams: selectedTeams,
      target_score: mode === 'championship' ? targetScore : 0,
      max_rounds: mode === 'championship' ? 0 : finalMaxRounds,
      time_limit: useTimeLimit ? (mode === 'speed' ? 15 : timeLimit) : 0,
      skips_allowed: useSkips ? skipsAllowed : 0,
      category_filter: mode === 'thematic' && category !== 'all' ? category : undefined
    });
    navigate(`/game/${match.id}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-32">
        
        <div className="space-y-6 max-w-md mx-auto">
          
          {/* Game Mode */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold px-1">Modo de Jogo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quick Mode */}
              <button
                onClick={() => setMode('quick')}
                className={clsx(
                  "p-4 rounded-3xl border-2 flex flex-col items-start gap-3 transition-all touch-manipulation relative overflow-hidden",
                  mode === 'quick' 
                    ? "bg-green-50 border-green-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  mode === 'quick' ? "bg-green-200 text-green-700" : "bg-green-100 text-green-600"
                )}>
                  <Zap size={20} fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className={clsx("font-bold text-lg", mode === 'quick' ? "text-green-800" : "text-slate-800")}>Rápido</p>
                  <p className={clsx("text-xs", mode === 'quick' ? "text-green-600" : "text-slate-500")}>10 rodadas rápidas</p>
                </div>
                {mode === 'quick' && <div className="absolute top-4 right-4 text-green-500"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Classic Mode */}
              <button
                onClick={() => setMode('classic')}
                className={clsx(
                  "p-4 rounded-3xl border-2 flex flex-col items-start gap-3 transition-all touch-manipulation relative overflow-hidden",
                  mode === 'classic' 
                    ? "bg-blue-50 border-blue-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  mode === 'classic' ? "bg-blue-200 text-blue-700" : "bg-blue-100 text-blue-600"
                )}>
                  <BookOpen size={20} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-bold text-lg", mode === 'classic' ? "text-blue-800" : "text-slate-800")}>Clássico</p>
                  <p className={clsx("text-xs", mode === 'classic' ? "text-blue-600" : "text-slate-500")}>20 rodadas padrão</p>
                </div>
                {mode === 'classic' && <div className="absolute top-4 right-4 text-blue-500"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Speed Round */}
              <button
                onClick={() => setMode('speed')}
                className={clsx(
                  "p-4 rounded-3xl border-2 flex flex-col items-start gap-3 transition-all touch-manipulation relative overflow-hidden",
                  mode === 'speed' 
                    ? "bg-red-50 border-red-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  mode === 'speed' ? "bg-red-200 text-red-700" : "bg-red-100 text-red-600"
                )}>
                  <Timer size={20} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-bold text-lg", mode === 'speed' ? "text-red-800" : "text-slate-800")}>Speed</p>
                  <p className={clsx("text-xs", mode === 'speed' ? "text-red-600" : "text-slate-500")}>15s por pergunta</p>
                </div>
                {mode === 'speed' && <div className="absolute top-4 right-4 text-red-500"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Thematic Mode */}
              <button
                onClick={() => setMode('thematic')}
                className={clsx(
                  "p-4 rounded-3xl border-2 flex flex-col items-start gap-3 transition-all touch-manipulation relative overflow-hidden",
                  mode === 'thematic' 
                    ? "bg-purple-50 border-purple-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  mode === 'thematic' ? "bg-purple-200 text-purple-700" : "bg-purple-100 text-purple-600"
                )}>
                  <Tags size={20} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-bold text-lg", mode === 'thematic' ? "text-purple-800" : "text-slate-800")}>Temático</p>
                  <p className={clsx("text-xs", mode === 'thematic' ? "text-purple-600" : "text-slate-500")}>Escolha o tema</p>
                </div>
                {mode === 'thematic' && <div className="absolute top-4 right-4 text-purple-500"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Championship Mode */}
              <button
                onClick={() => setMode('championship')}
                className={clsx(
                  "p-4 rounded-3xl border-2 flex flex-col items-start gap-3 transition-all touch-manipulation relative overflow-hidden",
                  mode === 'championship' 
                    ? "bg-yellow-50 border-yellow-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  mode === 'championship' ? "bg-yellow-200 text-yellow-700" : "bg-yellow-100 text-yellow-600"
                )}>
                  <Trophy size={20} fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className={clsx("font-bold text-lg", mode === 'championship' ? "text-yellow-800" : "text-slate-800")}>Campeonato</p>
                  <p className={clsx("text-xs", mode === 'championship' ? "text-yellow-600" : "text-slate-500")}>Pontuação alvo</p>
                </div>
                {mode === 'championship' && <div className="absolute top-4 right-4 text-yellow-500"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Custom Mode */}
              <button
                onClick={() => setMode('custom')}
                className={clsx(
                  "p-4 rounded-3xl border-2 flex flex-col items-start gap-3 transition-all touch-manipulation relative overflow-hidden",
                  mode === 'custom' 
                    ? "bg-indigo-50 border-indigo-500 shadow-sm" 
                    : "bg-white border-white shadow-sm hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  mode === 'custom' ? "bg-indigo-200 text-indigo-700" : "bg-indigo-100 text-indigo-600"
                )}>
                  <Sliders size={20} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-bold text-lg", mode === 'custom' ? "text-indigo-800" : "text-slate-800")}>Custom</p>
                  <p className={clsx("text-xs", mode === 'custom' ? "text-indigo-600" : "text-slate-500")}>Configure tudo</p>
                </div>
                {mode === 'custom' && <div className="absolute top-4 right-4 text-indigo-500"><CheckCircle2 size={20} /></div>}
              </button>
            </div>
          </section>

          {/* Category Selection (Only for Thematic Mode) */}
          {mode === 'thematic' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <h3 className="text-indigo-600 font-semibold px-1">Escolha o Tema</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="all">Todos os Temas</option>
                  <option value="old_testament">Antigo Testamento</option>
                  <option value="new_testament">Novo Testamento</option>
                  <option value="characters">Personagens</option>
                  <option value="miracles">Milagres</option>
                  <option value="parables">Parábolas</option>
                  <option value="books">Livros (Geral)</option>
                  <option value="Gênesis">Gênesis</option>
                  <option value="Êxodo">Êxodo</option>
                  <option value="Salmos">Salmos</option>
                  <option value="Provérbios">Provérbios</option>
                  <option value="Isaías">Isaías</option>
                  <option value="Mateus">Mateus</option>
                  <option value="Marcos">Marcos</option>
                  <option value="Lucas">Lucas</option>
                  <option value="João">João</option>
                  <option value="Apocalipse">Apocalipse</option>
                </select>
              </div>
            </motion.section>
          )}

          {/* Target Score (Only for Championship) */}
          {mode === 'championship' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <h3 className="text-indigo-600 font-semibold px-1">Pontuação Alvo</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <NumberControl
                  label={
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Trophy size={16} />
                      </div>
                      <span className="font-medium text-slate-800">Primeiro a chegar em</span>
                    </div>
                  }
                  value={targetScore}
                  onChange={setTargetScore}
                  min={50}
                  max={500}
                  step={50}
                  suffix="pts"
                />
              </div>
            </motion.section>
          )}

          {/* Custom Settings (Only for Custom or Thematic Mode) */}
          {(mode === 'custom' || mode === 'thematic') && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <h3 className="text-indigo-600 font-semibold px-1">Configurações da Partida</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-8">
                
                {/* Max Rounds */}
                <NumberControl
                  label={
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Repeat size={16} />
                      </div>
                      <span className="font-medium text-slate-800">Rodadas Máximas</span>
                    </div>
                  }
                  value={maxRounds}
                  onChange={setMaxRounds}
                  min={5}
                  max={50}
                  step={5}
                  suffix=""
                />

                <div className="h-px bg-slate-100" />

                {/* Target Score */}
                <NumberControl
                  label={
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Trophy size={16} />
                      </div>
                      <span className="font-medium text-slate-800">Pontuação Alvo</span>
                    </div>
                  }
                  value={targetScore}
                  onChange={setTargetScore}
                  min={50}
                  max={500}
                  step={50}
                  suffix="pts"
                />

              </div>
            </motion.section>
          )}

          {/* Time Limit */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold px-1">Limite de Tempo</h3>
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
                <div className="pt-2 border-t border-slate-50">
                  <NumberControl
                    label={
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Hourglass size={16} />
                        </div>
                        <span className="font-medium text-slate-800">Segundos</span>
                      </div>
                    }
                    value={timeLimit}
                    onChange={setTimeLimit}
                    min={10}
                    max={120}
                    step={5}
                    suffix="s"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Skips per Team */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold px-1">Pulos por Time</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Repeat size={16} />
                  </div>
                  <span className="font-medium text-slate-800">Permitir pular</span>
                </div>
                <Switch checked={useSkips} onChange={setUseSkips} />
              </div>

              {useSkips && (
                <div className="pt-2 border-t border-slate-50">
                  <NumberControl
                    label={
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Zap size={16} />
                        </div>
                        <span className="font-medium text-slate-800">Quantidade</span>
                      </div>
                    }
                    value={skipsAllowed}
                    onChange={setSkipsAllowed}
                    min={1}
                    max={10}
                    step={1}
                    suffix="pulos"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Team Selection */}
          <section className="space-y-3">
            <h3 className="text-indigo-600 font-semibold px-1">Selecionar Times ({selectedTeams.length})</h3>
            
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map(team => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={clsx(
                        "p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 touch-manipulation",
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
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-20 md:static md:bg-transparent md:border-none md:p-0 md:backdrop-blur-none">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleStart}
                disabled={selectedTeams.length === 0}
                className="w-full bg-slate-200 text-slate-400 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed enabled:bg-indigo-600 enabled:text-white enabled:shadow-lg enabled:hover:bg-indigo-700 transition-all active:scale-[0.98] touch-manipulation"
              >
                <Play fill="currentColor" size={20} />
                Iniciar Partida
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
