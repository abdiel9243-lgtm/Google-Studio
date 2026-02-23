import { v4 as uuidv4 } from 'uuid';
import { initialQuestions } from '../data/initialQuestions';
import { GoogleGenAI } from '@google/genai';

// --- Types ---

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'direct';
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'old_testament' | 'new_testament' | 'characters' | 'miracles' | 'parables' | 'books';
  correct_answer: string;
  options: string[] | null;
  reference: string;
  created_at?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface MatchTeam extends Team {
  score: number;
  skips_used: number;
}

export interface Match {
  id: string;
  mode: 'quick' | 'championship' | 'custom' | 'classic' | 'speed' | 'thematic';
  status: 'waiting' | 'active' | 'finished';
  current_round: number;
  target_score?: number;
  max_rounds?: number;
  time_limit?: number;
  skips_allowed?: number;
  category_filter?: string;
  teams: MatchTeam[];
  created_at: string;
  asked_questions: string[]; // IDs of asked questions
}

// --- Local Storage Helpers ---

const STORAGE_KEYS = {
  QUESTIONS: 'biblical_challenge_questions',
  TEAMS: 'biblical_challenge_teams',
  MATCHES: 'biblical_challenge_matches',
  INIT: 'biblical_challenge_initialized'
};

const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize Data
if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
  // Add IDs to initial questions if missing
  const questionsWithIds = initialQuestions.map(q => ({
    ...q,
    id: uuidv4(),
    created_at: new Date().toISOString()
  }));
  setStorage(STORAGE_KEYS.QUESTIONS, questionsWithIds);
  setStorage(STORAGE_KEYS.TEAMS, []);
  setStorage(STORAGE_KEYS.MATCHES, []);
  localStorage.setItem(STORAGE_KEYS.INIT, 'true');
}

// --- API Implementation ---

export const api = {
  getStats: async () => {
    const questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const teams = getStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    return { questions: questions.length, teams: teams.length, matches: matches.length };
  },

  getQuestions: async (params?: { limit?: number; category?: string; difficulty?: string; search?: string }) => {
    let questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    
    if (params?.category) questions = questions.filter(q => q.category === params.category);
    if (params?.difficulty) questions = questions.filter(q => q.difficulty === params.difficulty);
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      questions = questions.filter(q => q.text.toLowerCase().includes(searchLower));
    }
    
    // Sort by created_at desc
    questions.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    if (params?.limit) questions = questions.slice(0, params.limit);
    
    return questions;
  },

  createQuestion: async (question: Omit<Question, 'id'>) => {
    const questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const newQuestion = { ...question, id: uuidv4(), created_at: new Date().toISOString() };
    questions.unshift(newQuestion as Question);
    setStorage(STORAGE_KEYS.QUESTIONS, questions);
    return { id: newQuestion.id, success: true };
  },

  updateQuestion: async (id: string, updates: Partial<Question>) => {
    const questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      questions[index] = { ...questions[index], ...updates };
      setStorage(STORAGE_KEYS.QUESTIONS, questions);
    }
    return { success: true };
  },

  deleteQuestion: async (id: string) => {
    let questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    questions = questions.filter(q => q.id !== id);
    setStorage(STORAGE_KEYS.QUESTIONS, questions);
  },

  getTeams: async () => {
    const teams = getStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    return teams.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },

  createTeam: async (team: { name: string; color: string }) => {
    const teams = getStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    const newTeam = { ...team, id: uuidv4(), created_at: new Date().toISOString() };
    teams.unshift(newTeam);
    setStorage(STORAGE_KEYS.TEAMS, teams);
    return newTeam;
  },

  updateTeam: async (id: string, updates: { name: string; color: string }) => {
    const teams = getStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...updates };
      setStorage(STORAGE_KEYS.TEAMS, teams);
    }
    return { success: true };
  },

  deleteTeam: async (id: string) => {
    let teams = getStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    teams = teams.filter(t => t.id !== id);
    setStorage(STORAGE_KEYS.TEAMS, teams);
  },

  createMatch: async (matchData: { mode: string; teams: string[]; target_score?: number; max_rounds?: number; time_limit?: number; skips_allowed?: number; category_filter?: string }) => {
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    const allTeams = getStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    
    const selectedTeams = allTeams
      .filter(t => matchData.teams.includes(t.id))
      .map(t => ({ ...t, score: 0, skips_used: 0 }));

    const newMatch: Match = {
      id: uuidv4(),
      mode: matchData.mode as any,
      status: 'active',
      current_round: 1,
      target_score: matchData.target_score,
      max_rounds: matchData.max_rounds,
      time_limit: matchData.time_limit,
      skips_allowed: matchData.skips_allowed,
      category_filter: matchData.category_filter,
      teams: selectedTeams,
      created_at: new Date().toISOString(),
      asked_questions: []
    };

    matches.unshift(newMatch);
    setStorage(STORAGE_KEYS.MATCHES, matches);
    return { id: newMatch.id, success: true };
  },

  getMatches: async () => {
    return getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
  },

  deleteMatch: async (id: string) => {
    let matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    matches = matches.filter(m => m.id !== id);
    setStorage(STORAGE_KEYS.MATCHES, matches);
  },

  getMatch: async (id: string) => {
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    const match = matches.find(m => m.id === id);
    if (!match) throw new Error('Match not found');
    return match;
  },

  generateQuestions: async () => {
    // Client-side AI generation
    // Note: This exposes the API key in the client bundle. 
    // For a personal APK/Project, this is acceptable but should be noted.
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key not configured');
    }

    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Generate 10 unique biblical questions for a quiz game in Portuguese (Brazil).
      Focus on diverse categories: Old Testament, New Testament, Characters, Miracles, Parables, Books.
      Vary difficulty: Easy, Medium, Hard.
      Type: ALWAYS "multiple_choice".
      Each question MUST have 4 options.
      
      Return a JSON array with this schema:
      [
        {
          "text": "Question text",
          "type": "multiple_choice",
          "difficulty": "easy" | "medium" | "hard",
          "category": "old_testament" | "new_testament" | "characters" | "miracles" | "parables" | "books",
          "correct_answer": "Answer string",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "reference": "Book Chapter:Verse"
        }
      ]
    `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error('No text response from AI');
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Failed to parse AI response');
      
      const newQuestions = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      
      const currentQuestions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
      let addedCount = 0;
      
      for (const q of newQuestions) {
        // Simple duplicate check
        if (!currentQuestions.some(ex => ex.text === q.text)) {
          currentQuestions.unshift({
            ...q,
            id: uuidv4(),
            created_at: new Date().toISOString()
          });
          addedCount++;
        }
      }
      
      setStorage(STORAGE_KEYS.QUESTIONS, currentQuestions);
      return { success: true, count: addedCount };
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  },

  getNextQuestion: async (matchId: string) => {
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return null;
    
    const match = matches[matchIndex];
    let questions = getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);

    // Filter by category if needed
    if (match.category_filter) {
      const standardCategories = ['old_testament', 'new_testament', 'characters', 'miracles', 'parables', 'books'];
      if (standardCategories.includes(match.category_filter)) {
        questions = questions.filter(q => q.category === match.category_filter);
      } else {
        // Book filter
        questions = questions.filter(q => 
          q.category === match.category_filter || 
          q.reference.startsWith(match.category_filter!)
        );
      }
    }

    // Filter out asked questions
    const availableQuestions = questions.filter(q => !match.asked_questions?.includes(q.id));

    if (availableQuestions.length === 0) return null;

    // Pick random
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    // Update match with asked question
    if (!match.asked_questions) match.asked_questions = [];
    match.asked_questions.push(selectedQuestion.id);
    matches[matchIndex] = match;
    setStorage(STORAGE_KEYS.MATCHES, matches);

    return selectedQuestion;
  },

  updateScore: async (matchId: string, teamId: string, points: number, skip?: boolean) => {
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    const match = matches[matchIndex];
    const teamIndex = match.teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      match.teams[teamIndex].score += points;
      if (skip) {
        match.teams[teamIndex].skips_used = (match.teams[teamIndex].skips_used || 0) + 1;
      }
      matches[matchIndex] = match;
      setStorage(STORAGE_KEYS.MATCHES, matches);
    }
  },

  updateRound: async (matchId: string, round: number) => {
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      matches[matchIndex].current_round = round;
      setStorage(STORAGE_KEYS.MATCHES, matches);
    }
  },

  endMatch: async (matchId: string) => {
    const matches = getStorage<Match[]>(STORAGE_KEYS.MATCHES, []);
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      matches[matchIndex].status = 'finished';
      setStorage(STORAGE_KEYS.MATCHES, matches);
    }
  },

  // Backup/Restore for Client Side
  getBackupData: async () => {
    return {
      questions: getStorage(STORAGE_KEYS.QUESTIONS, []),
      teams: getStorage(STORAGE_KEYS.TEAMS, []),
      matches: getStorage(STORAGE_KEYS.MATCHES, [])
    };
  },

  restoreBackupData: async (data: any) => {
    if (data.questions) setStorage(STORAGE_KEYS.QUESTIONS, data.questions);
    if (data.teams) setStorage(STORAGE_KEYS.TEAMS, data.teams);
    if (data.matches) setStorage(STORAGE_KEYS.MATCHES, data.matches);
  }
};
