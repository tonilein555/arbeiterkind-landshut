import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mzhnxmgftqxbivecgnna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_PASSWORD = 'arbeiterkind2025landshut'

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState({});
  const [admin, setAdmin] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden:', error);
      alert('Fehler beim Laden der Fragen. Siehe Konsole.');
    } else {
      console.log('Geladene Fragen:', data);
      setQuestions(data);
    }
  }

  async function submitQuestion() {
    if (!newQuestion.trim()) return;

    const { error } = await supabase
      .from('questions')
      .insert([{ text: newQuestion, category: 'Sonstiges' }]);

    if (error) {
      console.error('Fehler beim Senden:', error);
      alert('Fehler beim Senden der Frage.');
    } else {
      setNewQuestion('');
      fetchQuestions();
    }
  }

  async function submitAnswer(questionId) {
    const answerText = newAnswer[questionId];
    if (!answerText?.trim()) return;

    const { error } = await supabase
      .from('answers')
      .insert([{ text: answerText, question_id: questionId, likes: 0 }]);

    if (error) {
      console.error('Fehler beim Antworten:', error);
      alert('Fehler beim Absenden der Antwort.');
    } else {
      setNewAnswer((prev) => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
      sendEmailNotification(questionId);
    }
  }

  async function likeAnswer(answerId) {
    const { error } = await supabase.rpc('increment_like', { answer_id_input: answerId });
    if (error) {
      console.error('Fehler beim Liken:', error);
    } else {
      fetchQuestions();
    }
  }

  async function hideQuestion(id) {
    const { error } = await supabase
      .from('questions')
      .update({ hidden: true })
      .eq('id', id);
    if (error) {
      console.error('Fehler beim Verstecken:', error);
    } else {
      fetchQuestions();
    }
  }

  function loginAsAdmin() {
    if (loginAttempt === ADMIN_PASSWORD) {
      setAdmin(true);
    } else {
      alert('Falsches Passwort');
    }
  }

  async function sendEmailNotification(questionId) {
    console.log(`Sende Mail: Neue Antwort zu Frage ${questionId}`);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Frag uns alles!</h1>

      {!admin && (
        <div className="mb-6">
          <input
            type="password"
            placeholder="Admin-Passwort"
            value={loginAttempt}
            onChange={(e) => setLoginAttempt(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <button
            onClick={loginAsAdmin}
            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded"
          >
            Als Admin einloggen
          </button>
        </div>
      )}

      <div className="mb-6">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Deine Frage..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        ></textarea>
        <button
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={submitQuestion}
        >
          Frage absenden
        </button>
      </div>

      <div>
        {questions.map((q) => (
          <div key={q.id} className="border p-4 mb-4 rounded">
            <div className="flex justify-between">
              <p className="font-semibold">{q.text}</p>
              {admin && (
                <button
                  onClick={() => hideQuestion(q.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Verstecken
                </button>
              )}
            </div>

            <div className="mt-2 pl-4">
              {q.answers.map((a) => (
                <div key={a.id} className="border-t py-2 flex justify-between items-center">
                  <span>{a.text}</span>
                  <button
                    onClick={() => likeAnswer(a.id)}
                    className="text-sm text-gray-600 hover:text-red-500"
                  >
                    ❤️ {a.likes}
                  </button>
                </div>
              ))}
            </div>

            {admin && (
              <div className="mt-2">
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Antwort schreiben..."
                  value={newAnswer[q.id] || ''}
                  onChange={(e) => setNewAnswer({ ...newAnswer, [q.id]: e.target.value })}
                ></textarea>
                <button
                  className="mt-1 bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => submitAnswer(q.id)}
                >
                  Antwort senden
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

