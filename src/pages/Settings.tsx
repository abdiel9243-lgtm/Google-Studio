import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Volume2, 
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

export default function Settings() {
  const [stats, setStats] = useState({ questions: 0 });
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [musicEnabled, setMusicEnabled] = useState(() => localStorage.getItem('musicEnabled') !== 'false');

  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEffectsEnabled.toString());
  }, [soundEffectsEnabled]);

  useEffect(() => {
    localStorage.setItem('musicEnabled', musicEnabled.toString());
  }, [musicEnabled]);

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
        alert('Backup restaurado com sucesso!');
        window.location.reload();
      } catch (error) {
        alert('Arquivo inválido ou erro ao restaurar.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Configurações</h1>
        </div>

        <div className="p-4 space-y-8 max-w-md mx-auto">
          
          {/* Audio Settings */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <Volume2 size={20} />
              <span>Configurações de Áudio</span>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Efeitos Sonoros</p>
                    <p className="text-xs text-slate-500">Sons de acerto e erro</p>
                  </div>
                </div>
                <Switch checked={soundEffectsEnabled} onChange={setSoundEffectsEnabled} />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <Music size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Música de Fundo</p>
                    <p className="text-xs text-slate-500">Ambiente musical durante o jogo</p>
                  </div>
                </div>
                <Switch checked={musicEnabled} onChange={setMusicEnabled} />
              </div>
            </div>
          </section>

          {/* AI Settings */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-purple-600 font-semibold">
              <Sparkles size={20} />
              <span>Inteligência Artificial</span>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <Key size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Chave da API de IA</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs text-green-600 font-medium">configurada</p>
                    </div>
                  </div>
                </div>
                <button className="text-indigo-600 font-bold text-sm hover:underline">
                  Configurar
                </button>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 leading-relaxed">
                A chave da API Gemini é gerenciada pelo sistema para gerar novas perguntas bíblicas automaticamente. As perguntas geradas são validadas antes de serem salvas no banco local.
              </div>
            </div>
          </section>

          {/* Database Settings */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <Database size={20} />
              <span>Banco de Dados</span>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                    <HelpCircle size={20} />
                  </div>
                  <p className="font-bold text-slate-800">Total de Perguntas</p>
                </div>
                <span className="text-indigo-600 font-bold">{stats.questions} perguntas</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    <Info size={20} />
                  </div>
                  <p className="font-bold text-slate-800">Versão do Banco</p>
                </div>
                <span className="text-green-600 font-bold">v1.0.0</span>
              </div>
            </div>
          </section>

          {/* Backup Actions (Extra) */}
          <section className="space-y-3 pt-4">
             <div className="grid grid-cols-2 gap-4">
              <button onClick={handleBackup} className="bg-white border border-slate-200 text-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-slate-50">
                <Download size={18} />
                Backup
              </button>
              <label className="bg-white border border-slate-200 text-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-slate-50 cursor-pointer">
                <Upload size={18} />
                Restaurar
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
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
