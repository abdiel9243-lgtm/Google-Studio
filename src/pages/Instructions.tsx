import PageTransition from '../components/PageTransition';
import { 
  Users, 
  Play, 
  Settings, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Gamepad2,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Instructions() {
  return (
    <PageTransition>
      <div className="space-y-8 pb-32">
        <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-slate-100 -mx-4 -mt-4 mb-6 sticky top-0 z-20">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors -ml-2">
              <ArrowLeft size={24} className="text-slate-700" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-800">Como Jogar</h2>
          </div>
          <p className="text-slate-500 mt-1">Roteiro completo para organizar sua gincana bíblica.</p>
        </div>

        {/* Step 1: Teams */}
        <section className="relative pl-8 border-l-2 border-indigo-100 space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-slate-50 shadow-sm">
            <Users size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800">1. Preparação dos Times</h3>
            <p className="text-slate-600 leading-relaxed mt-2">
              O primeiro passo é cadastrar as equipes. Vá até a tela de <strong>Times</strong> e adicione quantos grupos desejar.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" />
                Defina nomes criativos para cada equipe.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" />
                Escolha cores distintas para facilitar a identificação no placar.
              </li>
            </ul>
          </div>
        </section>

        {/* Step 2: Setup */}
        <section className="relative pl-8 border-l-2 border-indigo-100 space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-slate-50 shadow-sm">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800">2. Configuração da Partida</h3>
            <p className="text-slate-600 leading-relaxed mt-2">
              Ao clicar em <strong>Jogar</strong>, você definirá as regras da partida. Selecione os times que irão participar e escolha o modo de jogo:
            </p>
            
            <div className="grid grid-cols-1 gap-3 mt-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 size={18} className="text-green-600" />
                  <span className="font-bold text-slate-800">Modo Rápido</span>
                </div>
                <p className="text-xs text-slate-500">10 rodadas fixas. Ideal para jogos curtos.</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={18} className="text-yellow-600" />
                  <span className="font-bold text-slate-800">Modo Campeonato</span>
                </div>
                <p className="text-xs text-slate-500">Vence quem atingir a pontuação alvo primeiro (ex: 100 pontos).</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <List size={18} className="text-purple-600" />
                  <span className="font-bold text-slate-800">Modo Temático</span>
                </div>
                <p className="text-xs text-slate-500">Perguntas filtradas por tema (ex: Milagres, Novo Testamento) ou Livro específico.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: The Game Flow */}
        <section className="relative pl-8 border-l-2 border-indigo-100 space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-4 border-slate-50 shadow-sm">
            <Play size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800">3. Dinâmica do Jogo</h3>
            <p className="text-slate-600 leading-relaxed mt-2">
              Durante a partida, o aplicativo gerencia os turnos e sorteia perguntas <strong>sem repetição</strong>. Siga este roteiro:
            </p>
          </div>
          
          <div className="space-y-4 mt-2">
            <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</span>
              <div>
                <h4 className="font-bold text-slate-800">Leitura</h4>
                <p className="text-sm text-slate-600 mt-1">
                  A pergunta aparece na tela. Leia em voz alta para todos. O time da vez pode conferir as opções.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</span>
              <div>
                <h4 className="font-bold text-slate-800">Tempo</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Toque em <span className="font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded text-xs">INICIAR TEMPO</span>. 
                  O cronômetro regressivo começa. Se o tempo acabar, o time não pontua.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</span>
              <div>
                <h4 className="font-bold text-slate-800">Resposta</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Quando o time responder, selecione a opção escolhida na tela. O app mostrará imediatamente se está <strong>Correta</strong> ou <strong>Errada</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">4</span>
              <div>
                <h4 className="font-bold text-slate-800">Pontuação</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Se acertar, o time ganha <strong>10 pontos</strong>. Se errar, não ganha pontos (não há penalidade). O turno passa automaticamente para o próximo time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Features */}
        <section className="relative pl-8 border-l-2 border-transparent space-y-4">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border-4 border-slate-50 shadow-sm">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800">4. Recursos Extras</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-800 block text-sm mb-1">Pulos</span>
                <p className="text-xs text-amber-700">
                  Cada time tem uma quantidade limitada de pulos (configurável) para trocar de pergunta sem perder pontos.
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-800 block text-sm mb-1">Modo Telão</span>
                <p className="text-xs text-blue-700">
                  Use o botão de expandir para projetar o placar e a pergunta em uma TV ou projetor.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg mt-8 text-center">
          <Trophy size={48} className="mx-auto mb-4 text-indigo-200" />
          <h3 className="text-2xl font-bold mb-2">Pronto para começar?</h3>
          <p className="text-indigo-100 mb-6">Reúna os times e que vença o melhor conhecedor da Bíblia!</p>
          <Link 
            to="/setup" 
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-md"
          >
            Configurar Partida
          </Link>
        </div>

      </div>
    </PageTransition>
  );
}
