import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX,
  Volume1,
  Sparkles, 
  Key, 
  Database, 
  HelpCircle, 
  Info,
  Download,
  Upload,
  Music
} from 'lucide-react';
import { api } from '../lib/api';
import PageTransition from '../components/PageTransition';
import { motion } from 'motion/react';
import ConfirmModal from '../components/ConfirmModal';

function AudioControl({ label, description, icon: Icon, checked, onChange, onTest, colorClass }: { 
  label: string; 
  description: string; 
  icon: any; 
  checked: boolean; 
  onChange: (v: boolean) => void;
  onTest?: () => void;
  colorClass: string;
}) {
  return (
    <div className="p-6 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center group border border-gold/20 shadow-lg`}>
          <Icon size={24} className="group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <p className="font-bold text-white tracking-tight">{label}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {onTest && (
          <button 
            onClick={onTest}
            className="p-2.5 text-zinc-500 hover:text-gold hover:bg-gold/10 rounded-xl transition-all border border-transparent hover:border-gold/20"
            title="Testar som"
          >
            <Volume2 size={18} />
          </button>
        )}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onChange(true)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest ${checked ? 'bg-gold text-premium-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            LIGADO
          </button>
          <button
            onClick={() => onChange(false)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest ${!checked ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            DESLIGADO
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [stats, setStats] = useState({ questions: 0 });
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [musicEnabled, setMusicEnabled] = useState(() => localStorage.getItem('musicEnabled') !== 'false');
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('gameVolume') || '50'));
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
    localStorage.setItem('soundEnabled', soundEffectsEnabled.toString());
  }, [soundEffectsEnabled]);

  useEffect(() => {
    localStorage.setItem('musicEnabled', musicEnabled.toString());
  }, [musicEnabled]);

  useEffect(() => {
    localStorage.setItem('gameVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    api.getStats().then(data => setStats({ questions: data.questions }));
  }, []);

  const handleBackup = async () => {
    const data = await api.getBackupData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        await api.restoreBackupData(data);
        setConfirmModal({
          isOpen: true,
          title: 'Backup Restaurado',
          message: 'Os dados foram restaurados com sucesso! O aplicativo será reiniciado.',
          type: 'info',
          hideCancel: true,
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            window.location.reload();
          }
        });
      } catch (error) {
        setConfirmModal({
          isOpen: true,
          title: 'Erro na Restauração',
          message: 'O arquivo selecionado é inválido ou ocorreu um erro ao processar o backup.',
          type: 'danger',
          hideCancel: true,
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    };
    reader.readAsText(file);
  };

  const testSound = () => {
    const audio = new Audio('/audio/correct.mp3');
    audio.volume = volume / 100;
    audio.play().catch(() => {});
  };

  const testMusic = () => {
    const audio = new Audio('/audio/bg-music.mp3');
    audio.volume = (volume / 100) * 0.4;
    audio.play().then(() => {
      setTimeout(() => {
        audio.pause();
      }, 3000);
    }).catch(() => {});
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
        <div className="glass-premium p-4 flex items-center gap-4 border-b border-white/10 sticky top-0 z-10">
          <Link to="/" className="p-2.5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-zinc-400">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-serif font-bold italic text-gold">Configurações</h1>
        </div>

        <div className="p-4 space-y-10 max-w-md mx-auto">
          
          {/* Audio Settings */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs">
                <Volume2 size={18} />
                <span>Experiência Sonora</span>
              </div>
              <span className="text-[10px] font-bold bg-gold/10 text-gold px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-gold/20">Premium</span>
            </div>
            
            <div className="glass-premium rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
              {/* Sound Effects */}
              <AudioControl 
                label="Efeitos Sonoros"
                description="Feedback tátil e auditivo"
                icon={Volume2}
                checked={soundEffectsEnabled}
                onChange={setSoundEffectsEnabled}
                onTest={testSound}
                colorClass="bg-gold/10 text-gold"
              />

              {/* Background Music */}
              <AudioControl 
                label="Música de Fundo"
                description="Trilha instrumental calma"
                icon={Music}
                checked={musicEnabled}
                onChange={setMusicEnabled}
                onTest={testMusic}
                colorClass="bg-gold/10 text-gold"
              />

              {/* Volume Slider */}
              <div className="p-8 space-y-6 bg-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest text-[10px]">Volume Geral</p>
                    <button 
                      onClick={() => setVolume(volume === 0 ? 50 : 0)}
                      className={`p-2 rounded-xl transition-all border ${volume === 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-gold hover:border-gold/30'}`}
                    >
                      {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                  <span className="text-xs font-mono font-bold text-gold bg-gold/10 px-3 py-1.5 rounded-xl border border-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">{volume}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Volume1 size={18} className="text-zinc-600" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold"
                  />
                  <Volume2 size={18} className="text-zinc-600" />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] px-1">
                  <span>Mudo</span>
                  <span>Máximo</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs">
              <Sparkles size={18} />
              <span>Inteligência Artificial</span>
            </div>
            <div className="glass-premium rounded-[2rem] border border-white/10 p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shadow-lg">
                    <Key size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white tracking-tight">Chave da API de IA</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Configurada</p>
                    </div>
                  </div>
                </div>
                <button className="text-gold font-bold text-xs uppercase tracking-widest hover:underline underline-offset-4">
                  Configurar
                </button>
              </div>
              
              <div className="bg-white/5 p-4 rounded-2xl text-[11px] text-zinc-400 leading-relaxed border border-white/5">
                A chave da API Gemini é gerenciada pelo sistema para gerar novas perguntas bíblicas automaticamente. As perguntas geradas são validadas antes de serem salvas no banco local.
              </div>
            </div>
          </section>

          {/* Database Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs">
              <Database size={18} />
              <span>Banco de Dados</span>
            </div>
            <div className="glass-premium rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shadow-lg">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white tracking-tight">Total de Perguntas</p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{stats.questions} registradas</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-4 bg-white/5">
                <button 
                  onClick={handleBackup}
                  className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-zinc-300 py-4 rounded-2xl transition-all border border-white/5 font-bold text-xs uppercase tracking-widest"
                >
                  <Download size={18} /> Backup
                </button>
                <label className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-zinc-300 py-4 rounded-2xl transition-all border border-white/5 font-bold text-xs uppercase tracking-widest cursor-pointer">
                  <Upload size={18} /> Restaurar
                  <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                </label>
              </div>
            </div>
          </section>

        </div>
      </div>
    </PageTransition>
  );
}

function FlagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}
