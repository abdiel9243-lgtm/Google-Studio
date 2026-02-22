export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'direct';
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'old_testament' | 'new_testament' | 'characters' | 'miracles' | 'parables' | 'books';
  correct_answer: string;
  options: string[] | null;
  reference: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Match {
  id: string;
  mode: 'quick' | 'championship' | 'custom';
  status: 'waiting' | 'active' | 'finished';
  current_round: number;
  target_score?: number;
  max_rounds?: number;
  time_limit?: number;
  teams?: (Team & { score: number })[];
}

export const api = {
  getStats: async () => {
    const res = await fetch('/api/stats');
    return res.json() as Promise<{ questions: number; teams: number; matches: number }>;
  },

  getQuestions: async (params?: { limit?: number; category?: string; difficulty?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    const res = await fetch(`/api/questions?${searchParams.toString()}`);
    return res.json() as Promise<Question[]>;
  },

  createQuestion: async (question: Omit<Question, 'id'>) => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    return res.json();
  },

  getTeams: async () => {
    const res = await fetch('/api/teams');
    return res.json() as Promise<Team[]>;
  },

  createTeam: async (team: { name: string; color: string }) => {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    return res.json();
  },

  deleteTeam: async (id: string) => {
    await fetch(`/api/teams/${id}`, { method: 'DELETE' });
  },

  createMatch: async (match: { mode: string; teams: string[]; target_score?: number; max_rounds?: number; time_limit?: number }) => {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });
    return res.json();
  },

  getMatch: async (id: string) => {
    const res = await fetch(`/api/matches/${id}`);
    return res.json() as Promise<Match>;
  },

  generateQuestions: async () => {
    const res = await fetch('/api/questions/generate', { method: 'POST' });
    return res.json();
  },

  getNextQuestion: async (matchId: string) => {
    const res = await fetch(`/api/matches/${matchId}/next-question`);
    if (res.status === 404) return null;
    return res.json() as Promise<Question>;
  },

  updateScore: async (matchId: string, teamId: string, points: number) => {
    await fetch(`/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, points }),
    });
  },

  updateRound: async (matchId: string, round: number) => {
    await fetch(`/api/matches/${matchId}/round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round }),
    });
  },

  endMatch: async (matchId: string) => {
    await fetch(`/api/matches/${matchId}/end`, { method: 'POST' });
  }
};
