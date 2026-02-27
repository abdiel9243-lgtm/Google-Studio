import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Team } from '../lib/api';
import { 
  Play, 
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
import ConfirmModal from '../components/ConfirmModal';

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-14 h-8 rounded-full transition-all p-1.5 flex items-center border ${checked ? 'bg-gold border-gold' : 'bg-white/5 border-white/10'}`}
    >
      <motion.div 
        layout
        className={`w-5 h-5 rounded-full shadow-lg ${checked ? 'bg-premium-black' : 'bg-zinc-500'}`}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {label}
        <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-xl text-xs font-bold border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
          {value} {suffix}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-14 h-14 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-white/10"
        >
          <Minus size={24} />
        </button>
        <div className="flex-1 px-2">
          <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold"
          />
        </div>
        <button 
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-14 h-14 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-white/10"
        >
          <Plus size={24} />
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
    if (selectedTeams.length < 1) {
      setConfirmModal({
        isOpen: true,
        title: 'Seleção Necessária',
        message: 'Por favor, selecione pelo menos 1 time para iniciar a partida.',
        type: 'info',
        hideCancel: true,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    
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
      <div className="min-h-screen bg-premium-black pb-32">
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
        
        <div className="space-y-10 max-w-md mx-auto p-4">
          
          {/* Game Mode */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
              <Zap size={18} />
              <span>Modo de Jogo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quick Mode */}
              <button
                onClick={() => setMode('quick')}
                className={clsx(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all touch-manipulation relative overflow-hidden group",
                  mode === 'quick' 
                    ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                    : "glass-premium border-white/10 hover:border-white/20"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  mode === 'quick' ? "bg-gold text-premium-black shadow-lg" : "bg-white/5 text-zinc-400 group-hover:text-gold"
                )}>
                  <Zap size={24} fill={mode === 'quick' ? "currentColor" : "none"} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-serif font-bold text-xl italic", mode === 'quick' ? "text-gold" : "text-zinc-200")}>Rápido</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", mode === 'quick' ? "text-gold/60" : "text-zinc-500")}>10 rodadas rápidas</p>
                </div>
                {mode === 'quick' && <div className="absolute top-5 right-5 text-gold"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Classic Mode */}
              <button
                onClick={() => setMode('classic')}
                className={clsx(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all touch-manipulation relative overflow-hidden group",
                  mode === 'classic' 
                    ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                    : "glass-premium border-white/10 hover:border-white/20"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  mode === 'classic' ? "bg-gold text-premium-black shadow-lg" : "bg-white/5 text-zinc-400 group-hover:text-gold"
                )}>
                  <BookOpen size={24} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-serif font-bold text-xl italic", mode === 'classic' ? "text-gold" : "text-zinc-200")}>Clássico</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", mode === 'classic' ? "text-gold/60" : "text-zinc-500")}>20 rodadas padrão</p>
                </div>
                {mode === 'classic' && <div className="absolute top-5 right-5 text-gold"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Speed Round */}
              <button
                onClick={() => setMode('speed')}
                className={clsx(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all touch-manipulation relative overflow-hidden group",
                  mode === 'speed' 
                    ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                    : "glass-premium border-white/10 hover:border-white/20"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  mode === 'speed' ? "bg-gold text-premium-black shadow-lg" : "bg-white/5 text-zinc-400 group-hover:text-gold"
                )}>
                  <Timer size={24} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-serif font-bold text-xl italic", mode === 'speed' ? "text-gold" : "text-zinc-200")}>Speed</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", mode === 'speed' ? "text-gold/60" : "text-zinc-500")}>15s por pergunta</p>
                </div>
                {mode === 'speed' && <div className="absolute top-5 right-5 text-gold"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Thematic Mode */}
              <button
                onClick={() => setMode('thematic')}
                className={clsx(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all touch-manipulation relative overflow-hidden group",
                  mode === 'thematic' 
                    ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                    : "glass-premium border-white/10 hover:border-white/20"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  mode === 'thematic' ? "bg-gold text-premium-black shadow-lg" : "bg-white/5 text-zinc-400 group-hover:text-gold"
                )}>
                  <Tags size={24} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-serif font-bold text-xl italic", mode === 'thematic' ? "text-gold" : "text-zinc-200")}>Temático</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", mode === 'thematic' ? "text-gold/60" : "text-zinc-500")}>Escolha o tema</p>
                </div>
                {mode === 'thematic' && <div className="absolute top-5 right-5 text-gold"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Championship Mode */}
              <button
                onClick={() => setMode('championship')}
                className={clsx(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all touch-manipulation relative overflow-hidden group",
                  mode === 'championship' 
                    ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                    : "glass-premium border-white/10 hover:border-white/20"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  mode === 'championship' ? "bg-gold text-premium-black shadow-lg" : "bg-white/5 text-zinc-400 group-hover:text-gold"
                )}>
                  <Trophy size={24} fill={mode === 'championship' ? "currentColor" : "none"} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-serif font-bold text-xl italic", mode === 'championship' ? "text-gold" : "text-zinc-200")}>Campeonato</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", mode === 'championship' ? "text-gold/60" : "text-zinc-500")}>Pontuação alvo</p>
                </div>
                {mode === 'championship' && <div className="absolute top-5 right-5 text-gold"><CheckCircle2 size={20} /></div>}
              </button>

              {/* Custom Mode */}
              <button
                onClick={() => setMode('custom')}
                className={clsx(
                  "p-5 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all touch-manipulation relative overflow-hidden group",
                  mode === 'custom' 
                    ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                    : "glass-premium border-white/10 hover:border-white/20"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  mode === 'custom' ? "bg-gold text-premium-black shadow-lg" : "bg-white/5 text-zinc-400 group-hover:text-gold"
                )}>
                  <Sliders size={24} />
                </div>
                <div className="text-left">
                  <p className={clsx("font-serif font-bold text-xl italic", mode === 'custom' ? "text-gold" : "text-zinc-200")}>Custom</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", mode === 'custom' ? "text-gold/60" : "text-zinc-500")}>Configure tudo</p>
                </div>
                {mode === 'custom' && <div className="absolute top-5 right-5 text-gold"><CheckCircle2 size={20} /></div>}
              </button>
            </div>
          </section>

          {/* Category Selection (Only for Thematic Mode) */}
          {mode === 'thematic' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
                <Tags size={18} />
                <span>Escolha o Tema</span>
              </div>
              <div className="glass-premium rounded-[2rem] border border-white/10 p-6 shadow-xl">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-zinc-200 font-serif italic text-lg focus:ring-2 focus:ring-gold outline-none appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-premium-black">Todos os Temas</option>
                  <option value="old_testament" className="bg-premium-black">Antigo Testamento</option>
                  <option value="new_testament" className="bg-premium-black">Novo Testamento</option>
                  <option value="characters" className="bg-premium-black">Personagens</option>
                  <option value="miracles" className="bg-premium-black">Milagres</option>
                  <option value="parables" className="bg-premium-black">Parábolas</option>
                  <option value="books" className="bg-premium-black">Livros (Geral)</option>
                  <option value="Gênesis" className="bg-premium-black">Gênesis</option>
                  <option value="Êxodo" className="bg-premium-black">Êxodo</option>
                  <option value="Salmos" className="bg-premium-black">Salmos</option>
                  <option value="Provérbios" className="bg-premium-black">Provérbios</option>
                  <option value="Isaías" className="bg-premium-black">Isaías</option>
                  <option value="Mateus" className="bg-premium-black">Mateus</option>
                  <option value="Marcos" className="bg-premium-black">Marcos</option>
                  <option value="Lucas" className="bg-premium-black">Lucas</option>
                  <option value="João" className="bg-premium-black">João</option>
                  <option value="Apocalipse" className="bg-premium-black">Apocalipse</option>
                </select>
              </div>
            </motion.section>
          )}

          {/* Target Score (Only for Championship) */}
          {mode === 'championship' && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
                <Trophy size={18} />
                <span>Pontuação Alvo</span>
              </div>
              <div className="glass-premium rounded-[2rem] border border-white/10 p-8 shadow-xl">
                <NumberControl
                  label={
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                        <Trophy size={24} />
                      </div>
                      <span className="font-bold text-white tracking-tight">Primeiro a chegar em</span>
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
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
                <Sliders size={18} />
                <span>Configurações da Partida</span>
              </div>
              <div className="glass-premium rounded-[2rem] border border-white/10 p-8 space-y-10 shadow-xl">
                
                {/* Max Rounds */}
                <NumberControl
                  label={
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                        <Repeat size={24} />
                      </div>
                      <span className="font-bold text-white tracking-tight">Rodadas Máximas</span>
                    </div>
                  }
                  value={maxRounds}
                  onChange={setMaxRounds}
                  min={5}
                  max={50}
                  step={5}
                  suffix=""
                />

                <div className="h-px bg-white/5" />

                {/* Target Score */}
                <NumberControl
                  label={
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                        <Trophy size={24} />
                      </div>
                      <span className="font-bold text-white tracking-tight">Pontuação Alvo</span>
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
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
              <Clock size={18} />
              <span>Limite de Tempo</span>
            </div>
            <div className="glass-premium rounded-[2rem] border border-white/10 p-8 space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                    <Clock size={24} />
                  </div>
                  <span className="font-bold text-white tracking-tight">Usar limite de tempo</span>
                </div>
                <Switch checked={useTimeLimit} onChange={setUseTimeLimit} />
              </div>

              {useTimeLimit && (
                <div className="pt-8 border-t border-white/5">
                  <NumberControl
                    label={
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                          <Hourglass size={24} />
                        </div>
                        <span className="font-bold text-white tracking-tight">Segundos</span>
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
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
              <Repeat size={18} />
              <span>Pulos por Time</span>
            </div>
            <div className="glass-premium rounded-[2rem] border border-white/10 p-8 space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                    <Repeat size={24} />
                  </div>
                  <span className="font-bold text-white tracking-tight">Permitir pular</span>
                </div>
                <Switch checked={useSkips} onChange={setUseSkips} />
              </div>

              {useSkips && (
                <div className="pt-8 border-t border-white/5">
                  <NumberControl
                    label={
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg">
                          <Zap size={24} />
                        </div>
                        <span className="font-bold text-white tracking-tight">Quantidade</span>
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
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs px-1">
              <Trophy size={18} />
              <span>Selecionar Times ({selectedTeams.length})</span>
            </div>
            
            {teams.length === 0 ? (
              <div className="glass-premium border border-white/10 rounded-[2rem] p-8 flex flex-col items-center text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold border border-gold/20 shadow-lg">
                  <AlertTriangle size={32} />
                </div>
                <p className="text-zinc-300 font-serif italic text-lg">Nenhum time criado. Crie times primeiro!</p>
                <button 
                  onClick={() => navigate('/teams')}
                  className="text-gold font-bold hover:underline text-xs uppercase tracking-widest"
                >
                  Ir para cadastro de times
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map(team => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={clsx(
                        "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 touch-manipulation group",
                        isSelected 
                          ? "bg-gold/10 border-gold shadow-lg" 
                          : "glass-premium border-white/10 hover:border-white/20"
                      )}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shrink-0 border border-white/10" 
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={clsx("font-bold truncate text-sm uppercase tracking-tight", isSelected ? "text-gold" : "text-zinc-300 group-hover:text-white")}>
                        {team.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Start Button */}
          <div className="fixed bottom-0 left-0 right-0 p-6 glass-premium border-t border-white/10 z-20 md:static md:bg-transparent md:border-none md:p-0 md:backdrop-blur-none">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleStart}
                disabled={selectedTeams.length === 0}
                className="w-full bg-white/5 text-zinc-600 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:cursor-not-allowed enabled:bg-gold enabled:text-premium-black enabled:shadow-[0_0_30px_rgba(212,175,55,0.3)] enabled:hover:scale-[1.02] transition-all active:scale-[0.98] touch-manipulation uppercase tracking-widest"
              >
                <Play fill="currentColor" size={24} />
                Iniciar Partida
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
