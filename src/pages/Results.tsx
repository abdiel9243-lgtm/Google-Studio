import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, Match } from '../lib/api';
import { Trophy, Home, RotateCcw, Share2, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import PageTransition from '../components/PageTransition';
import clsx from 'clsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getMatch(id).then((data) => {
        setMatch(data);
        setLoading(false);
      });
    }
  }, [id]);

  const exportToPDF = () => {
    if (!match) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Resultado da Partida - Desafio Bíblico', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    doc.text(`Modo: ${match.mode}`, 14, 37);
    
    const tableData = sortedTeams.map((team, index) => [
      index + 1,
      team.name,
      team.score,
      team.skips_used || 0
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Posição', 'Time', 'Pontuação', 'Pulos Usados']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`resultado-partida-${id}.pdf`);
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-400">Carregando resultados...</div>;
  if (!match || !match.teams) return <div className="text-center p-10">Partida não encontrada</div>;

  // Sort teams by score descending
  const sortedTeams = [...match.teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const isDraw = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score;

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-yellow-100 p-8 rounded-full shadow-xl border-4 border-yellow-200"
        >
          <Trophy size={64} className="text-yellow-600" fill="currentColor" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            {isDraw ? "Empate!" : "Fim de Jogo!"}
          </h1>
          <p className="text-slate-500 text-lg">
            {isDraw ? "Que disputa acirrada!" : `Parabéns, ${winner.name}!`}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="w-full max-w-sm space-y-3">
          {sortedTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "flex items-center justify-between p-4 rounded-2xl border-2 shadow-sm",
                index === 0 ? "bg-white border-yellow-400 ring-2 ring-yellow-100" : "bg-white border-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={clsx(
                  "font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs",
                  index === 0 ? "bg-yellow-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {index + 1}
                </span>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="font-medium text-slate-800">{team.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 leading-none">{team.score}</p>
                  {team.skips_used > 0 && (
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                      {team.skips_used} {team.skips_used === 1 ? 'pulo' : 'pulos'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          <button 
            onClick={exportToPDF}
            className="bg-emerald-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Exportar PDF
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/setup" className="bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              <RotateCcw size={20} />
              Nova
            </Link>
            <Link to="/" className="bg-white text-slate-700 border border-slate-200 p-4 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2">
              <Home size={20} />
              Início
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
