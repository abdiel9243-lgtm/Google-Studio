import { useState, useEffect, useMemo } from 'react';
import { api, Question } from '../lib/api';
import { Sparkles, ArrowLeft, Search, Filter, Edit2, Trash2, X, Save, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    // Fetch all questions for client-side filtering
    const data = await api.getQuestions(); 
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;
    try {
      await api.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir pergunta.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      await api.updateQuestion(editingQuestion.id, editingQuestion);
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
      setEditingQuestion(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar pergunta.');
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.correct_answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
      const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [questions, searchTerm, filterCategory, filterDifficulty]);

  const categories = [
    { value: 'all', label: 'Todas Categorias' },
    { value: 'old_testament', label: 'Antigo Testamento' },
    { value: 'new_testament', label: 'Novo Testamento' },
    { value: 'characters', label: 'Personagens' },
    { value: 'miracles', label: 'Milagres' },
    { value: 'parables', label: 'Parábolas' },
    { value: 'books', label: 'Livros' },
  ];

  const difficulties = [
    { value: 'all', label: 'Todas Dificuldades' },
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Médio' },
    { value: 'hard', label: 'Difícil' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center sticky top-0 bg-slate-50 z-10 py-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-slate-700" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Banco de Perguntas</h2>
              <p className="text-sm text-slate-500">{filteredQuestions.length} perguntas encontradas</p>
            </div>
          </div>
          <button
            onClick={generateAIQuestions}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-purple-700 shadow-sm transition-colors w-full md:w-auto justify-center"
          >
            <Sparkles size={16} />
            Gerar com IA
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar perguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border-none rounded-xl text-slate-700 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border-none rounded-xl text-slate-700 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-400">Carregando perguntas...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Nenhuma pergunta encontrada com os filtros atuais.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={q.id} 
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <span className={clsx(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide",
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {q.difficulty === 'easy' ? 'Fácil' : q.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600">
                      {q.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingQuestion(q)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-slate-800 mb-3 text-lg leading-snug">{q.text}</p>
                <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
                  <span className="font-medium text-indigo-600">R: {q.correct_answer}</span>
                  <span className="italic opacity-70">{q.reference}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-slate-800">Editar Pergunta</h3>
                  <button 
                    onClick={() => setEditingQuestion(null)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pergunta</label>
                    <textarea
                      required
                      value={editingQuestion.text}
                      onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                      <select
                        value={editingQuestion.category}
                        onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value as any})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {categories.filter(c => c.value !== 'all').map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dificuldade</label>
                      <select
                        value={editingQuestion.difficulty}
                        onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value as any})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {difficulties.filter(d => d.value !== 'all').map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resposta Correta</label>
                    <input
                      type="text"
                      required
                      value={editingQuestion.correct_answer}
                      onChange={(e) => setEditingQuestion({...editingQuestion, correct_answer: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Referência Bíblica</label>
                    <input
                      type="text"
                      required
                      value={editingQuestion.reference}
                      onChange={(e) => setEditingQuestion({...editingQuestion, reference: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Options Editing */}
                  {editingQuestion.options && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Opções</label>
                      {editingQuestion.options.map((opt: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + idx)}</span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...(editingQuestion.options || [])];
                              newOptions[idx] = e.target.value;
                              setEditingQuestion({...editingQuestion, options: newOptions});
                            }}
                            className={clsx(
                              "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm",
                              opt === editingQuestion.correct_answer && "border-green-500 bg-green-50"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
