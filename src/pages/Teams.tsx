import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { api, Team } from '../lib/api';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3b82f6');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await api.getTeams();
    setTeams(data);
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    await api.createTeam({ name: newTeamName, color: newTeamColor });
    setNewTeamName('');
    loadTeams();
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este time?')) {
      await api.deleteTeam(id);
      loadTeams();
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">Times</h2>
        </div>

        <form onSubmit={handleAddTeam} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-2 items-center">
          <input
            type="color"
            value={newTeamColor}
            onChange={(e) => setNewTeamColor(e.target.value)}
            className="w-10 h-10 rounded-full border-none cursor-pointer"
          />
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Nome do time"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition">
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: team.color }}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{team.name}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Time {team.color}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteTeam(team.id)} 
                className="bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 p-3 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Plus size={32} />
              </div>
              <p className="text-slate-500 font-medium">Nenhum time cadastrado.</p>
              <p className="text-slate-400 text-sm mt-1">Adicione times para começar.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
