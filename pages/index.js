'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getTheme } from '../theme'

const supabase = createClient(
  'https://mzhnxmgftqxbivecgnna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'
)

const CATEGORY_LIST = ['Studium', 'Finanzen', 'Alltag', 'Sonstiges']

export default function Page() {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [admin, setAdmin] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [answerInputs, setAnswerInputs] = useState({})
  const [showAdminLogin, setShowAdminLogin] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [stats, setStats] = useState({ total: 0, open: 0, answered: 0, byCategory: {} })

  const theme = getTheme(isDark)
  const ADMIN_PASSWORD = 'arbeiterkind2025landshut'

  useEffect(() => {
    fetchQuestions()
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setIsDark(e.matches)
      document.body.style.backgroundColor = e.matches ? '#000' : '#fff'
    }
    setIsDark(mql.matches)
    document.body.style.backgroundColor = mql.matches ? '#000' : '#fff'
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [admin])

  async function fetchQuestions() {
    let query = supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('hidden', false)
      .order('created_at', { ascending: false })

    if (!admin) {
      query = query.not('answers', 'is', null)
    }

    const { data, error } = await query

    if (!error && data) {
      setQuestions(data)
      if (admin) {
        const total = data.length
        const answered = data.filter((q) => q.answers && q.answers.length > 0).length
        const open = total - answered
        const byCategory = CATEGORY_LIST.reduce((acc, cat) => {
          acc[cat] = data.filter(q => q.category === cat).length
          return acc
        }, {})
        setStats({ total, open, answered, byCategory })
      }
    }
  }

  async function submitQuestion() {
    if (!newQuestion.trim()) return
    const { error } = await supabase.from('questions').insert({
      text: newQuestion,
      category: selectedCategory,
      hidden: false
    })
    if (!error) {
      setNewQuestion('')
      setSelectedCategory('')
      setSuccessMessage('Frage erfolgreich eingereicht!')
      fetchQuestions()
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  async function submitAnswer(questionId) {
    const text = answerInputs[questionId]
    if (!text) return
    const { error } = await supabase.from('answers').insert({ text, question_id: questionId })
    if (!error) {
      setAnswerInputs({ ...answerInputs, [questionId]: '' })
      fetchQuestions()
    }
  }

  async function hideQuestion(id) {
    const { error } = await supabase.from('questions').update({ hidden: true }).eq('id', id)
    if (!error) fetchQuestions()
  }

  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setAdmin(true)
      setPasswordInput('')
      setShowAdminLogin(false)
    } else {
      alert('Falsches Passwort')
    }
  }

  function handleLogout() {
    setAdmin(false)
  }

  return (
    <main
      style={{
        background: theme.background,
        color: theme.text,
        minHeight: '100vh',
        maxWidth: 600,
        margin: '0 auto',
        padding: 20,
        paddingTop: 60,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
        Q&amp;A mit ArbeiterKind.de Landshut
      </h1>

      {admin && (
        <div style={{ marginTop: 20, marginBottom: 20 }} aria-label="Admin-Statistik">
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Admin-Dashboard</h2>
          <ul>
            <li>Fragen insgesamt: {stats.total}</li>
            <li>Offene Fragen: {stats.open}</li>
            <li>Beantwortete Fragen: {stats.answered}</li>
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <li key={cat}>📂 {cat}: {count}</li>
            ))}
          </ul>
        </div>
      )}

      {!admin && (
        <div style={{ marginBottom: 20, width: '100%' }}>
          <label htmlFor="questionInput" style={{ display: 'none' }}>Frage eingeben</label>
          <textarea
            id="questionInput"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={{
              width: '100%', height: 80, padding: 10,
              fontSize: 16, borderRadius: 4,
              border: `1px solid ${theme.boxBorder}`,
              backgroundColor: theme.boxBackground,
              color: theme.text,
              marginBottom: 10
            }}
            aria-label="Fragetext eingeben"
          />
          <label htmlFor="categorySelect">Kategorie wählen</label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%', padding: 8, marginBottom: 10,
              borderRadius: 4, backgroundColor: theme.boxBackground,
              color: theme.text, border: `1px solid ${theme.boxBorder}`
            }}
            aria-label="Kategorie auswählen"
          >
            <option value="">-- Kategorie wählen --</option>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={submitQuestion}
            style={{
              backgroundColor: theme.buttonBackground,
              color: theme.buttonText,
              padding: '10px 20px', border: 'none',
              borderRadius: 4, cursor: 'pointer'
            }}
            aria-label="Frage absenden"
          >
            Frage absenden
          </button>
          {successMessage && (
            <p style={{ color: 'green', marginTop: 10 }}>{successMessage}</p>
          )}
        </div>
      )}

      {questions.map((q) => {
        const answer = q.answers?.[0]
        return (
          <div
            key={q.id}
            style={{
              border: `1px solid ${theme.boxBorder}`,
              borderRadius: 6, padding: 12,
              marginBottom: 20, width: '100%',
              backgroundColor: theme.boxBackground
            }}
          >
            <p style={{ fontWeight: 'bold' }}>{q.text}</p>
            {q.category && <p style={{ fontSize: 12, color: theme.placeholder }}>Kategorie: {q.category}</p>}
            <p style={{ fontSize: 12, color: theme.placeholder }}>
              Eingereicht am: {new Date(q.created_at).toLocaleDateString()}
            </p>
            {answer ? (
              <div
                style={{
                  backgroundColor: theme.answerBackground,
                  padding: 10, borderRadius: 4, marginTop: 8,
                  color: theme.answerText, border: `1px solid ${theme.boxBorder}`
                }}
              >
                {answer.text}
                <p style={{ fontSize: 12, color: theme.placeholder, marginTop: 6 }}>
                  Beantwortet am: {new Date(answer.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : admin ? (
              <>
                <label htmlFor={`answer-${q.id}`} style={{ display: 'none' }}>Antwort schreiben</label>
                <textarea
                  id={`answer-${q.id}`}
                  value={answerInputs[q.id] || ''}
                  onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                  style={{
                    width: '100%', height: 60, marginTop: 10, borderRadius: 4, padding: 8,
                    backgroundColor: theme.boxBackground, color: theme.text,
                    border: `1px solid ${theme.boxBorder}`
                  }}
                  aria-label="Antwort schreiben"
                />
                <button
                  onClick={() => submitAnswer(q.id)}
                  style={{
                    marginTop: 8, backgroundColor: 'green', color: 'white',
                    padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer'
                  }}
                  aria-label="Antwort senden"
                >
                  Antwort senden
                </button>
                <button
                  onClick={() => hideQuestion(q.id)}
                  style={{ float: 'right', marginTop: 8, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Frage verstecken"
                >
                  Verstecken
                </button>
              </>
            ) : null}
          </div>
        )
      })}

      {/* ... Admin-Login bleibt unverändert ... */}
    </main>
  )
}



