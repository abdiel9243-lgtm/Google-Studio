import PageTransition from '../components/PageTransition';
import { 
  Users, 
  Play, 
  Settings, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Instructions() {
  return (
    <PageTransition>
      <div className="space-y-8 pb-24">
        <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-slate-100 -mx-4 -mt-4 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors -ml-2">
              <ArrowLeft size={24} className="text-slate-700" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-800">Como Funciona</h2>
          </div>
          <p className="text-slate-500 mt-1">Guia passo a passo para organizar sua gincana.</p>
        </div>

        {/* Step 1: Teams */}
        <section className="relative pl-8 border-l-2 border-indigo-100 space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-slate-50">
            <Users size={16} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">1. Cadastre os Times</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">
              Antes de tudo, vá até a aba <span className="font-bold text-indigo-600">Times</span> e cadastre as equipes que irão participar. 
              Escolha nomes criativos e cores diferentes para cada um.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-sm text-slate-600">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-medium">
              <CheckCircle2 size={16} /> Dica
            </div>
            Você pode criar quantos times quiser, mas recomendamos entre 2 e 4 para uma partida dinâmica.
          </div>
        </section>

        {/* Step 2: Setup */}
        <section className="relative pl-8 border-l-2 border-indigo-100 space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-slate-50">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">2. Configure a Partida</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">
              Toque em <span className="font-bold text-indigo-600">Jogar</span> e escolha o modo de jogo ideal para o seu evento:
            </p>
            <ul className="mt-3 space-y-3">
              <li className="bg-green-50 p-3 rounded-xl border border-green-100">
                <span className="font-bold text-green-700 block text-sm">Modo Rápido</span>
                <span className="text-xs text-green-600">Partida com 10 rodadas fixas. Quem tiver mais pontos no final vence.</span>
              </li>
              <li className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                <span className="font-bold text-yellow-700 block text-sm">Modo Campeonato</span>
                <span className="text-xs text-yellow-600">Define uma pontuação alvo (ex: 100 pontos). O primeiro time a alcançar vence.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Step 3: The Game */}
        <section className="relative pl-8 border-l-2 border-indigo-100 space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-slate-50">
            <Play size={16} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">3. Hora do Jogo</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">
              O aplicativo sorteará perguntas automaticamente. O fluxo é simples:
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="font-bold text-slate-300 text-xl">1</span>
              <p className="text-sm text-slate-600">Leia a pergunta e as opções para os times.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="font-bold text-slate-300 text-xl">2</span>
              <p className="text-sm text-slate-600">
                Aperte <span className="font-bold text-green-600">INICIAR TEMPO</span>. O cronômetro começará a rodar.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="font-bold text-slate-300 text-xl">3</span>
              <p className="text-sm text-slate-600">Quando o time responder, pause o tempo e revele a resposta.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="font-bold text-slate-300 text-xl">4</span>
              <p className="text-sm text-slate-600">Marque se acertaram ou erraram. O app calcula os pontos automaticamente.</p>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-sm text-orange-800 flex gap-3 items-start">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Regras de Pontuação:</span>
              <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                <li>Fácil: 10 pts | Médio: 20 pts | Difícil: 30 pts</li>
                <li>Resposta rápida (&lt;5s): +5 pts bônus</li>
                <li>Resposta média (&lt;10s): +3 pts bônus</li>
                <li>Erro: -5 pts (se configurado)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Step 4: Champion */}
        <section className="relative pl-8 border-l-2 border-transparent space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center border-4 border-slate-50">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">4. Grande Vencedor</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">
              Ao final das rodadas ou ao atingir a pontuação alvo, o jogo encerra e mostra o pódio com o grande campeão!
            </p>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
