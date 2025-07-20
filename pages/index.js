"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mzhnxmgftqxbivecgnna.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM"
);

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAnswers, setNewAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from("questions")
      .select("*, answers(*)")
      .eq("hidden", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fehler beim Laden", error);
      return;
    }

    setQuestions(data);
  }

  async function submitQuestion() {
    if (!newQuestion.trim()) return;
    await supabase.from("questions").insert({ text: newQuestion });
    setNewQuestion("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    fetchQuestions();
  }

  async function login() {
    if (adminPassword === "[DEIN_ADMIN_PASSWORT]") {
      setIsAdmin(true);
      fetchQuestions();
    } else {
      alert("Falsches Passwort");
    }
  }

  async function submitAnswer(questionId) {
    const text = newAnswers[questionId];
    if (!text) return;

    await supabase.from("answers").insert({
      question_id: questionId,
      text,
    });
    setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
    fetchQuestions();
  }

  async function hideQuestion(id) {
    await supabase.from("questions").update({ hidden: true }).eq("id", id);
    fetchQuestions();
  }

  async function likeAnswer(id) {
    const { data, error } = await supabase
      .from("answers")
      .select("likes")
      .eq("id", id)
      .single();

    if (!error && data) {
      await supabase
        .from("answers")
        .update({ likes: data.likes + 1 })
        .eq("id", id);
      fetchQuestions();
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE");
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Frag uns alles!</h1>

      {!isAdmin ? (
        <>
          <input
            type="password"
            placeholder="Admin-Passwort"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-2 mb-2 border border-gray-400 rounded bg-black text-white"
          />
          <button
            onClick={login}
            className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
          >
            Als Admin einloggen
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsAdmin(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        >
          Logout
        </button>
      )}

      {!isAdmin && (
        <>
          <textarea
            placeholder="Deine Frage..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full p-2 mb-2 border border-gray-400 rounded bg-black text-white"
          />
          <button
            onClick={submitQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Frage absenden
          </button>
          {submitted && (
            <p className="text-green-500 mt-2">Frage erfolgreich gesendet!</p>
          )}
        </>
      )}

      <div className="mt-8 space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="border border-gray-700 p-4 rounded bg-zinc-900"
          >
            <div className="flex justify-between items-center">
              <strong>{q.text}</strong>
              {isAdmin && (
                <button
                  onClick={() => hideQuestion(q.id)}
                  className="text-red-500 text-sm"
                >
                  Verstecken
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Eingereicht am: {formatDate(q.created_at)}
            </p>

            {q.answers.map((a) => (
              <div
                key={a.id}
                className="border-t border-gray-600 py-2"
              >
                <div className="flex justify-between items-center">
                  <span>{a.text}</span>
                  <button
                    onClick={() => likeAnswer(a.id)}
                    className="text-sm text-gray-400 hover:text-red-400"
                  >
                    ❤️ {a.likes}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Beantwortet am: {formatDate(a.created_at)}
                </p>
              </div>
            ))}

            {isAdmin && (
              <div className="mt-2">
                <textarea
                  placeholder="Antwort schreiben..."
                  value={newAnswers[q.id] || ""}
                  onChange={(e) =>
                    setNewAnswers({ ...newAnswers, [q.id]: e.target.value })
                  }
                  className="w-full p-2 border border-gray-400 rounded bg-black text-white"
                />
                <button
                  onClick={() => submitAnswer(q.id)}
                  className="bg-green-500 text-white px-4 py-1 rounded mt-1"
                >
                  Antwort senden
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}



