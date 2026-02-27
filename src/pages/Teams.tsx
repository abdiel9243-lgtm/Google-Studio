import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Pencil, X } from 'lucide-react';
import { api, Team } from '../lib/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from '../components/ConfirmModal';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#ef4444'); // Default red
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
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await api.getTeams();
    setTeams(data);
  };

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTeamName(team.name);
      setTeamColor(team.color);
    } else {
      setEditingTeam(null);
      setTeamName('');
      setTeamColor('#ef4444');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setTeamName('');
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    if (editingTeam) {
      await api.updateTeam(editingTeam.id, { name: teamName, color: teamColor });
    } else {
      await api.createTeam({ name: teamName, color: teamColor });
    }
    
    handleCloseModal();
    loadTeams();
  };

  const handleDeleteTeam = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Time?',
      message: 'Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await api.deleteTeam(id);
        loadTeams();
      }
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  return (
    <PageTransition>
      <div className="space-y-6 relative min-h-[80vh]">
        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
        
        {/* Team List */}
        <div className="space-y-4">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="glass-premium p-5 rounded-[2rem] border-2 flex justify-between items-center shadow-xl transition-all hover:border-gold/30"
              style={{ borderColor: `${team.color}40` }}
            >
              <div className="flex items-center gap-5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10" 
                  style={{ backgroundColor: team.color }}
                >
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-xl italic">{team.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                    Criado em {formatDate(team.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleOpenModal(team)} 
                  className="p-3 text-gold hover:bg-gold/10 rounded-2xl transition-all border border-gold/20"
                >
                  <Pencil size={20} />
                </button>
                <button 
                  onClick={() => handleDeleteTeam(team.id)} 
                  className="p-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/20"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {teams.length === 0 && (
            <div className="text-center py-20 glass-premium rounded-[3rem] border border-white/10">
              <div className="bg-gold/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gold border border-gold/20 shadow-lg">
                <Users size={40} />
              </div>
              <p className="text-zinc-400 font-serif italic text-lg">Nenhum time cadastrado.</p>
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => handleOpenModal()}
          className="fixed bottom-8 right-8 bg-gold text-premium-black px-8 py-4 rounded-2xl font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-3 hover:scale-[1.05] transition-all active:scale-95 z-40 uppercase tracking-widest text-sm"
        >
          <Plus size={24} />
          Novo Time
        </button>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-premium-black/80 z-50 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass-premium p-8 rounded-[3rem] border border-white/10 shadow-2xl z-50"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-bold italic text-gold">
                    {editingTeam ? 'Editar Time' : 'Novo Time'}
                  </h3>
                  <button onClick={handleCloseModal} className="p-2.5 hover:bg-white/10 rounded-2xl text-zinc-500 border border-white/5">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveTeam} className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome do Time</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ex: Guerreiros"
                      className="w-full px-6 py-4 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-gold bg-white/5 text-white font-medium placeholder:text-zinc-600"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Cor do Time</label>
                    <div className="flex gap-4 flex-wrap">
                      {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#D4AF37', '#14b8a6'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTeamColor(color)}
                          className={`w-11 h-11 rounded-xl transition-all border-2 ${teamColor === color ? 'scale-110 border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-gold text-premium-black py-5 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-95 mt-6 uppercase tracking-widest"
                  >
                    {editingTeam ? 'Salvar Alterações' : 'Criar Time'}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
