import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Users, Pencil, X } from 'lucide-react';
import { api, Team } from '../lib/api';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#ef4444'); // Default red

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
    if (confirm('Tem certeza que deseja excluir este time?')) {
      await api.deleteTeam(id);
      loadTeams();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  return (
    <PageTransition>
      <div className="space-y-6 relative min-h-[80vh]">
        
        {/* Team List */}
        <div className="space-y-4">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center"
              style={{ borderColor: `${team.color}40` }} // 25% opacity border
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm" 
                  style={{ backgroundColor: team.color }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{team.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Criado em {formatDate(team.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(team)} 
                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  <Pencil size={20} />
                </button>
                <button 
                  onClick={() => handleDeleteTeam(team.id)} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {teams.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Users size={32} />
              </div>
              <p className="text-slate-500 font-medium">Nenhum time cadastrado.</p>
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => handleOpenModal()}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition active:scale-95 z-40"
        >
          <Plus size={20} />
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
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs bg-white p-6 rounded-3xl shadow-xl z-50"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingTeam ? 'Editar Time' : 'Novo Time'}
                  </h3>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveTeam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Time</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ex: Guerreiros"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Cor do Time</label>
                    <div className="flex gap-3 flex-wrap">
                      {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTeamColor(color)}
                          className={`w-10 h-10 rounded-full transition-transform ${teamColor === color ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition active:scale-95 mt-4"
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
