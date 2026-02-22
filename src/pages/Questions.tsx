import { useState, useEffect } from 'react';
import { api, Question } from '../lib/api';
import { Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await api.getQuestions({ limit: 50 });
    setQuestions(data);
    setLoading(false);
  };

  const generateAIQuestions = async () => {
    setLoading(true);
    try {
      const result = await api.generateQuestions();
      if (result.success) {
        alert(`Sucesso! ${result.count} novas perguntas geradas.`);
        loadQuestions();
      } else {
        alert('Erro ao gerar perguntas.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-slate-700" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-800">Banco de Perguntas</h2>
          </div>
          <button
            onClick={generateAIQuestions}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-purple-700 shadow-sm"
          >
            <Sparkles size={16} />
            Gerar com IA
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-400">Carregando perguntas...</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty === 'easy' ? 'Fácil' : q.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600">
                      {q.category}
                    </span>
                  </div>
                </div>
                <p className="font-semibold text-slate-800 mb-3 text-lg leading-snug">{q.text}</p>
                <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
                  <span className="font-medium text-indigo-600">R: {q.correct_answer}</span>
                  <span className="italic opacity-70">{q.reference}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
