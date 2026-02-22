import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'biblical_challenge.db');
const db = new Database(dbPath);

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT NOT NULL, -- multiple_choice, true_false, direct
    difficulty TEXT NOT NULL, -- easy, medium, hard
    category TEXT NOT NULL, -- old_testament, new_testament, characters, miracles, parables, books
    correct_answer TEXT NOT NULL,
    options TEXT, -- JSON string
    reference TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL, -- quick, championship, custom
    status TEXT NOT NULL, -- waiting, active, finished
    current_round INTEGER DEFAULT 0,
    target_score INTEGER,
    max_rounds INTEGER,
    time_limit INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS match_teams (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    FOREIGN KEY(match_id) REFERENCES matches(id),
    FOREIGN KEY(team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS match_questions (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    answered_by_team_id TEXT,
    is_correct BOOLEAN,
    response_time INTEGER, -- in milliseconds
    points_awarded INTEGER,
    FOREIGN KEY(match_id) REFERENCES matches(id),
    FOREIGN KEY(question_id) REFERENCES questions(id),
    FOREIGN KEY(answered_by_team_id) REFERENCES teams(id)
  );
`);

import { initialQuestions } from './src/data/initialQuestions.ts';

// Sync Initial Data
console.log('Syncing initial questions...');
const checkQuestion = db.prepare('SELECT id FROM questions WHERE text = ?');
const insertQuestion = db.prepare(`
  INSERT INTO questions (id, text, type, difficulty, category, correct_answer, options, reference)
  VALUES (@id, @text, @type, @difficulty, @category, @correct_answer, @options, @reference)
`);

const syncQuestions = db.transaction((questions) => {
  let added = 0;
  for (const q of questions) {
    if (q.type !== 'multiple_choice') continue; // Only allow multiple choice
    
    const existing = checkQuestion.get(q.text);
    if (!existing) {
      insertQuestion.run({ ...q, id: uuidv4(), options: JSON.stringify(q.options) });
      added++;
    }
  }
  if (added > 0) {
    console.log(`Added ${added} new questions from initialQuestions.`);
  } else {
    console.log('No new questions to add.');
  }
});

syncQuestions(initialQuestions);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Questions
  app.get('/api/questions', (req, res) => {
    const { limit, category, difficulty } = req.query;
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    query += ' ORDER BY RANDOM()';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
    }

    const questions = db.prepare(query).all(...params);
    res.json(questions);
  });

  app.post('/api/questions', (req, res) => {
    const { text, type, difficulty, category, correct_answer, options, reference } = req.body;
    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO questions (id, text, type, difficulty, category, correct_answer, options, reference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, text, type, difficulty, category, correct_answer, JSON.stringify(options), reference);
      res.json({ id, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teams
  app.get('/api/teams', (req, res) => {
    const teams = db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all();
    res.json(teams);
  });

  app.post('/api/teams', (req, res) => {
    const { name, color } = req.body;
    const id = uuidv4();
    try {
      db.prepare('INSERT INTO teams (id, name, color) VALUES (?, ?, ?)').run(id, name, color);
      res.json({ id, name, color });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/teams/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM teams WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Matches
  app.post('/api/matches', (req, res) => {
    const { mode, target_score, max_rounds, time_limit, teams } = req.body; // teams is array of team IDs
    const id = uuidv4();
    
    const createMatch = db.transaction(() => {
      db.prepare(`
        INSERT INTO matches (id, mode, status, current_round, target_score, max_rounds, time_limit)
        VALUES (?, ?, 'active', 1, ?, ?, ?)
      `).run(id, mode, target_score, max_rounds, time_limit);

      const insertTeam = db.prepare('INSERT INTO match_teams (id, match_id, team_id) VALUES (?, ?, ?)');
      for (const teamId of teams) {
        insertTeam.run(uuidv4(), id, teamId);
      }
    });

    try {
      createMatch();
      res.json({ id, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/matches/:id/round', (req, res) => {
    const { id } = req.params;
    const { round } = req.body;
    try {
      db.prepare('UPDATE matches SET current_round = ? WHERE id = ?').run(round, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/matches', (req, res) => {
    const matches = db.prepare(`
      SELECT m.*, 
        (SELECT json_group_array(json_object('name', t.name, 'score', mt.score, 'color', t.color))
         FROM match_teams mt 
         JOIN teams t ON mt.team_id = t.id 
         WHERE mt.match_id = m.id) as teams_json,
        (SELECT AVG(response_time) FROM match_questions WHERE match_id = m.id) as avg_response_time
      FROM matches m 
      ORDER BY created_at DESC
    `).all();
    
    // Parse the JSON string for teams
    const matchesWithParsedTeams = matches.map((match: any) => ({
      ...match,
      teams: JSON.parse(match.teams_json || '[]'),
      avg_response_time: match.avg_response_time || 0
    }));

    res.json(matchesWithParsedTeams);
  });

  app.delete('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    try {
      const deleteMatch = db.transaction(() => {
        db.prepare('DELETE FROM match_questions WHERE match_id = ?').run(id);
        db.prepare('DELETE FROM match_teams WHERE match_id = ?').run(id);
        db.prepare('DELETE FROM matches WHERE id = ?').run(id);
      });
      deleteMatch();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const teams = db.prepare(`
      SELECT t.*, mt.score, mt.id as match_team_id 
      FROM match_teams mt 
      JOIN teams t ON mt.team_id = t.id 
      WHERE mt.match_id = ?
    `).all(id);

    res.json({ ...match, teams });
  });

  app.post('/api/matches/:id/score', (req, res) => {
    const { id } = req.params;
    const { team_id, points } = req.body;
    
    try {
      db.prepare('UPDATE match_teams SET score = score + ? WHERE match_id = ? AND team_id = ?').run(points, id, team_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/matches/:id/end', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("UPDATE matches SET status = 'finished' WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  app.get('/api/matches/:id/next-question', (req, res) => {
    const { id } = req.params;
    
    // Get questions already asked in this match
    const askedQuestions = db.prepare('SELECT question_id FROM match_questions WHERE match_id = ?').all(id) as { question_id: string }[];
    const askedIds = askedQuestions.map(q => q.question_id);

    // Get a random question not in the list
    let query = 'SELECT * FROM questions';
    const params: any[] = [];
    
    if (askedIds.length > 0) {
      query += ` WHERE id NOT IN (${askedIds.map(() => '?').join(',')})`;
      params.push(...askedIds);
    }
    
    query += ' ORDER BY RANDOM() LIMIT 1';
    
    const question = db.prepare(query).get(...params);
    
    if (!question) {
      return res.status(404).json({ error: 'No more questions available' });
    }
    
    res.json(question);
  });

  // AI Generation
  app.post('/api/questions/generate', async (req, res) => {
    try {
      const prompt = `
        Generate 20 unique biblical questions for a quiz game in Portuguese (Brazil).
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

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error('No text response from AI');
      
      // Extract JSON from markdown code block if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      
      const questions = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      
      const insert = db.prepare(`
        INSERT INTO questions (id, text, type, difficulty, category, correct_answer, options, reference)
        VALUES (@id, @text, @type, @difficulty, @category, @correct_answer, @options, @reference)
      `);

      const insertMany = db.transaction((qs) => {
        for (const q of qs) {
          insert.run({
            ...q,
            id: uuidv4(),
            options: q.options ? JSON.stringify(q.options) : null
          });
        }
      });

      insertMany(questions);
      res.json({ success: true, count: questions.length });
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Backup & Restore
  app.get('/api/backup', (req, res) => {
    const backup = {
      questions: db.prepare('SELECT * FROM questions').all(),
      teams: db.prepare('SELECT * FROM teams').all(),
      matches: db.prepare('SELECT * FROM matches').all(),
      match_teams: db.prepare('SELECT * FROM match_teams').all(),
      match_questions: db.prepare('SELECT * FROM match_questions').all(),
    };
    res.json(backup);
  });

  app.post('/api/restore', (req, res) => {
    const { questions, teams, matches, match_teams, match_questions } = req.body;
    
    try {
      const restore = db.transaction(() => {
        // Clear existing data
        db.prepare('DELETE FROM match_questions').run();
        db.prepare('DELETE FROM match_teams').run();
        db.prepare('DELETE FROM matches').run();
        db.prepare('DELETE FROM teams').run();
        db.prepare('DELETE FROM questions').run();

        // Insert new data
        const insertQuestion = db.prepare('INSERT INTO questions (id, text, type, difficulty, category, correct_answer, options, reference, created_at) VALUES (@id, @text, @type, @difficulty, @category, @correct_answer, @options, @reference, @created_at)');
        const insertTeam = db.prepare('INSERT INTO teams (id, name, color, created_at) VALUES (@id, @name, @color, @created_at)');
        const insertMatch = db.prepare('INSERT INTO matches (id, mode, status, current_round, target_score, max_rounds, time_limit, created_at) VALUES (@id, @mode, @status, @current_round, @target_score, @max_rounds, @time_limit, @created_at)');
        const insertMatchTeam = db.prepare('INSERT INTO match_teams (id, match_id, team_id, score) VALUES (@id, @match_id, @team_id, @score)');
        const insertMatchQuestion = db.prepare('INSERT INTO match_questions (id, match_id, question_id, answered_by_team_id, is_correct, response_time, points_awarded) VALUES (@id, @match_id, @question_id, @answered_by_team_id, @is_correct, @response_time, @points_awarded)');

        for (const q of questions || []) insertQuestion.run(q);
        for (const t of teams || []) insertTeam.run(t);
        for (const m of matches || []) insertMatch.run(m);
        for (const mt of match_teams || []) insertMatchTeam.run(mt);
        for (const mq of match_questions || []) insertMatchQuestion.run(mq);
      });

      restore();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats
  app.get('/api/stats', (req, res) => {
    const questions = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
    const teams = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
    const matches = db.prepare('SELECT COUNT(*) as count FROM matches').get() as { count: number };
    
    res.json({
      questions: questions.count,
      teams: teams.count,
      matches: matches.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
