import { useState, useEffect, useMemo } from 'react';
import { api, Question } from '../lib/api';
import { Sparkles, Search, Filter, Edit2, Trash2, X, Save } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import ConfirmModal from '../components/ConfirmModal';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
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
        setConfirmModal({
          isOpen: true,
          title: 'Sucesso!',
          message: `${result.count} novas perguntas foram geradas e adicionadas ao banco de dados.`,
          type: 'info',
          hideCancel: true,
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
        loadQuestions();
      } else {
        setConfirmModal({
          isOpen: true,
          title: 'Erro',
          message: 'Ocorreu um erro ao tentar gerar novas perguntas.',
          type: 'danger',
          hideCancel: true,
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error(error);
      setConfirmModal({
        isOpen: true,
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor para gerar perguntas.',
        type: 'danger',
        hideCancel: true,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Pergunta?',
      message: 'Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await api.deleteQuestion(id);
          setQuestions(questions.filter(q => q.id !== id));
        } catch (error) {
          console.error(error);
          setConfirmModal({
            isOpen: true,
            title: 'Erro ao Excluir',
            message: 'Não foi possível excluir a pergunta selecionada.',
            type: 'danger',
            hideCancel: true,
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
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
      setConfirmModal({
        isOpen: true,
        title: 'Erro ao Salvar',
        message: 'Ocorreu um erro ao tentar salvar as alterações na pergunta.',
        type: 'danger',
        hideCancel: true,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
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
      <div className="space-y-8 pb-24">
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

        {/* Actions Header */}
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <h2 className="text-gold font-bold uppercase tracking-[0.2em] text-xs">Banco de Dados</h2>
            <p className="text-zinc-500 font-serif italic text-sm">{filteredQuestions.length} perguntas encontradas</p>
          </div>
          <button
            onClick={generateAIQuestions}
            disabled={loading}
            className="bg-gold text-premium-black px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 hover:scale-[1.05] shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} />
            Gerar com IA
          </button>
        </div>

        {/* Filters Panel */}
        <div className="glass-premium p-6 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar perguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-gold focus:bg-white/10 outline-none transition-all font-serif italic"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors" size={18} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-300 text-xs font-bold uppercase tracking-widest appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:bg-white/10 outline-none transition-all"
              >
                {categories.map(c => <option key={c.value} value={c.value} className="bg-premium-black">{c.label}</option>)}
              </select>
            </div>
            <div className="relative flex-1 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors" size={18} />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-300 text-xs font-bold uppercase tracking-widest appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:bg-white/10 outline-none transition-all"
              >
                {difficulties.map(d => <option key={d.value} value={d.value} className="bg-premium-black">{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
              <p className="text-zinc-500 font-serif italic text-lg">Consultando as escrituras...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-20 glass-premium rounded-[3rem] border border-white/10">
              <p className="text-zinc-500 font-serif italic text-lg">Nenhuma pergunta encontrada com os filtros atuais.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={q.id} 
                className="glass-premium p-6 rounded-[2.5rem] border border-white/10 shadow-xl hover:border-gold/30 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex gap-3 flex-wrap">
                    <span className={clsx(
                      "text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest border",
                      q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    )}>
                      {q.difficulty === 'easy' ? 'Fácil' : q.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/10">
                      {q.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingQuestion(q)}
                      className="p-2.5 text-zinc-500 hover:text-gold hover:bg-gold/10 rounded-xl transition-all border border-transparent hover:border-gold/20"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="font-serif font-bold text-white mb-5 text-xl leading-relaxed italic relative z-10">"{q.text}"</p>
                <div className="flex items-center justify-between text-sm bg-white/5 p-4 rounded-2xl border border-white/5 relative z-10">
                  <span className="font-bold text-gold uppercase tracking-widest text-xs">R: {q.correct_answer}</span>
                  <span className="text-zinc-500 italic font-serif text-xs">{q.reference}</span>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-white pointer-events-none">
                  <Sparkles size={120} />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-premium-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-premium rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10"
              >
                <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 bg-premium-black/40 backdrop-blur-xl z-10">
                  <h3 className="text-2xl font-serif font-bold italic text-gold">Editar Pergunta</h3>
                  <button 
                    onClick={() => setEditingQuestion(null)}
                    className="p-2.5 hover:bg-white/10 rounded-2xl text-zinc-500 border border-white/5"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="p-8 space-y-8">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Pergunta</label>
                    <textarea
                      required
                      value={editingQuestion.text}
                      onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold outline-none min-h-[120px] text-white font-serif italic text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Categoria</label>
                      <select
                        value={editingQuestion.category}
                        onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value as any})}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold outline-none text-zinc-300 font-bold uppercase tracking-widest text-xs appearance-none cursor-pointer"
                      >
                        {categories.filter(c => c.value !== 'all').map(c => (
                          <option key={c.value} value={c.value} className="bg-premium-black">{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Dificuldade</label>
                      <select
                        value={editingQuestion.difficulty}
                        onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value as any})}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold outline-none text-zinc-300 font-bold uppercase tracking-widest text-xs appearance-none cursor-pointer"
                      >
                        {difficulties.filter(d => d.value !== 'all').map(d => (
                          <option key={d.value} value={d.value} className="bg-premium-black">{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Resposta Correta</label>
                    <input
                      type="text"
                      required
                      value={editingQuestion.correct_answer}
                      onChange={(e) => setEditingQuestion({...editingQuestion, correct_answer: e.target.value})}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold outline-none text-white font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Referência Bíblica</label>
                    <input
                      type="text"
                      required
                      value={editingQuestion.reference}
                      onChange={(e) => setEditingQuestion({...editingQuestion, reference: e.target.value})}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-gold outline-none text-zinc-400 font-serif italic"
                    />
                  </div>

                  {/* Options Editing */}
                  {editingQuestion.options && (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Opções Alternativas</label>
                      <div className="space-y-3">
                        {editingQuestion.options.map((opt: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gold w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/20">{String.fromCharCode(65 + idx)}</span>
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
                                "w-full p-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-gold outline-none text-sm transition-all",
                                opt === editingQuestion.correct_answer ? "border-gold bg-gold/5 text-gold" : "border-white/10 text-zinc-300"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="flex-1 py-5 text-zinc-500 font-bold hover:bg-white/5 rounded-2xl transition-all uppercase tracking-widest text-xs border border-transparent hover:border-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-5 bg-gold text-premium-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      <Save size={20} />
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
