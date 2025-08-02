'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getTheme } from '../theme'

const CATEGORY_LIST = [
  'Thema auswählen …',
  'Studium',
  'Finanzen',
  'Alltag',
  'Ehrenamt',
  'Sonstiges',
  'Meine Frage betrifft mehrere Themen',
]

const CATEGORY_COLORS = {
  Studium: '#007bff',
  Finanzen: '#28a745',
  Alltag: '#ffc107',
  Ehrenamt: '#6610f2',
  Sonstiges: '#6c757d',
  'Meine Frage betrifft mehrere Themen': '#17a2b8',
}

const supabase = createClient(
  'https://mzhnxmgftqxbivecgnna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'
)

export default function Page() {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [category, setCategory] = useState(CATEGORY_LIST[0])
  const [admin, setAdmin] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [answerInputs, setAnswerInputs] = useState({})
  const [showAdminLogin, setShowAdminLogin] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [categoryStats, setCategoryStats] = useState({})
  const [filterCategory, setFilterCategory] = useState(null)

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

    if (error) {
      console.error('Fehler beim Laden', error)
    } else {
      setQuestions(data)

      const stats = {}
      data.forEach((q) => {
        const cat = q.category || 'Ohne Thema'
        stats[cat] = (stats[cat] || 0) + 1
      })
      setCategoryStats(stats)
    }
  }

  async function submitQuestion() {
    if (!newQuestion.trim()) return
    if (category === 'Thema auswählen …') {
      alert('Bitte wähle ein Thema aus.')
      return
    }

    const { error } = await supabase.from('questions').insert({
      text: newQuestion,
      hidden: false,
      category: category,
    })

    if (error) {
      console.error('Fehler beim Senden der Frage', error)
    } else {
      setNewQuestion('')
      setCategory(CATEGORY_LIST[0])
      setSuccessMessage('Frage erfolgreich eingereicht!')
      fetchQuestions()
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }
  async function submitAnswer(questionId) {
    const text = answerInputs[questionId]
    if (!text) return

    const { error } = await supabase.from('answers').insert({
      text,
      question_id: questionId,
    })

    if (error) {
      console.error('Fehler beim Senden der Antwort', error)
    } else {
      setAnswerInputs({ ...answerInputs, [questionId]: '' })
      fetchQuestions()
    }
  }

  async function hideQuestion(id) {
    const { error } = await supabase
      .from('questions')
      .update({ hidden: true })
      .eq('id', id)

    if (error) {
      console.error('Fehler beim Verstecken', error)
    } else {
      fetchQuestions()
    }
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

  const visibleQuestions = filterCategory
    ? questions.filter((q) => q.category === filterCategory)
    : questions

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
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
        Q&amp;A mit ArbeiterKind.de Landshut
      </h1>

      {!admin && (
        <p style={{ textAlign: 'center', marginBottom: 20 }}>
          Stell&#39; uns gerne im nachfolgenden Textfeld Deine Frage(n) und wähle bitte ein passendes Thema aus. Wir freuen uns auf Deine Frage(n)!
        </p>
      )}

      {!admin && (
        <div style={{ marginBottom: 20, width: '100%' }}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            aria-label="Frage eingeben"
            style={{
              width: '100%',
              height: 80,
              padding: 10,
              fontSize: 16,
              borderRadius: 4,
              border: `1px solid ${theme.boxBorder}`,
              backgroundColor: theme.boxBackground,
              color: theme.text,
              marginBottom: 10,
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              marginBottom: 10,
              fontSize: 16,
              borderRadius: 4,
              backgroundColor: theme.boxBackground,
              color: theme.text,
              border: `1px solid ${theme.boxBorder}`,
            }}
          >
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={submitQuestion}
            style={{
              backgroundColor: theme.buttonBackground,
              color: theme.buttonText,
              border: 'none',
              padding: '10px 20px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Frage absenden
          </button>
          {successMessage && (
            <p style={{ color: 'green', marginTop: 10 }}>{successMessage}</p>
          )}
        </div>
      )}

      {admin && (
        <>
          <div
            style={{
              width: '100%',
              marginBottom: 20,
              backgroundColor: theme.boxBackground,
              color: theme.text,
              padding: 16,
              borderRadius: 8,
              border: `1px solid ${theme.boxBorder}`,
              boxShadow: isDark ? 'none' : '0 0 10px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Themenübersicht</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 0' }}>Themen</th>
                  <th style={{ textAlign: 'right', padding: '6px 0' }}>Fragen</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryStats).map(([cat, count]) => (
                  <tr key={cat}>
                    <td style={{ padding: '4px 0' }}>{cat}</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ width: '100%', marginBottom: 20 }}>
            <h3>Fragen filtern:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => setFilterCategory(null)}
                style={{
                  backgroundColor: '#999',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Alle Fragen anzeigen
              </button>
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    backgroundColor: CATEGORY_COLORS[cat],
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {visibleQuestions.map((q) => {
        const answer = q.answers?.[0]
        return (
          <div
            key={q.id}
            style={{
              border: `1px solid ${theme.boxBorder}`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 20,
              width: '100%',
              backgroundColor: theme.boxBackground,
            }}
          >
            <p style={{ fontWeight: 'bold' }}>{q.text}</p>
            <p style={{ fontSize: 12, color: theme.placeholder }}>
              Eingereicht am: {new Date(q.created_at).toLocaleDateString()} • Thema: {q.category || '–'}
            </p>
            {answer ? (
              <div
                style={{
                  backgroundColor: theme.answerBackground,
                  padding: 10,
                  borderRadius: 4,
                  marginTop: 8,
                  color: theme.answerText,
                  border: `1px solid ${theme.boxBorder}`,
                }}
              >
                {answer.text}
                <p
                  style={{
                    fontSize: 12,
                    color: theme.placeholder,
                    marginTop: 6,
                  }}
                >
                  Beantwortet am:{' '}
                  {new Date(answer.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : admin ? (
              <>
                <textarea
                  value={answerInputs[q.id] || ''}
                  onChange={(e) =>
                    setAnswerInputs({
                      ...answerInputs,
                      [q.id]: e.target.value,
                    })
                  }
                  placeholder="Antwort schreiben..."
                  style={{
                    width: '100%',
                    height: 60,
                    marginTop: 10,
                    borderRadius: 4,
                    padding: 8,
                    backgroundColor: theme.boxBackground,
                    color: theme.text,
                    border: `1px solid ${theme.boxBorder}`,
                  }}
                />
                <button
                  onClick={() => submitAnswer(q.id)}
                  style={{
                    marginTop: 8,
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Antwort senden
                </button>
              </>
            ) : null}
          </div>
        )
      })}

      {!admin && showAdminLogin && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: theme.adminBoxBackground,
            padding: 16,
            borderRadius: 8,
            width: 260,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            color: theme.adminText,
          }}
        >
          <button
            onClick={() => setShowAdminLogin(false)}
            style={{
              position: 'absolute',
              top: 4,
              right: 8,
              background: 'none',
              border: 'none',
              color: theme.placeholder,
              fontSize: 26,
              cursor: 'pointer',
            }}
            aria-label="Schließen"
          >
            ×
          </button>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin-Passwort"
            style={{
              width: '100%',
              padding: 8,
              marginBottom: 8,
              backgroundColor: theme.background,
              border: `1px solid ${theme.boxBorder}`,
              color: theme.text,
              borderRadius: 4,
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              backgroundColor: 'mediumorchid',
              color: 'white',
              width: '100%',
              padding: 10,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Als Admin einloggen
          </button>
        </div>
      )}

      {admin && (
        <button
          onClick={handleLogout}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            backgroundColor: '#444',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      )}
{!admin && (
  <div
    style={{
      marginTop: 40,
      padding: 20,
      borderRadius: 8,
      backgroundColor: theme.boxBackground,
      border: `1px solid ${theme.boxBorder}`,
      width: '100%',
      textAlign: 'center',
      color: theme.text,
      fontSize: 14,
    }}
  >
    <h3 style={{ marginBottom: 10 }}>Kontakt</h3>
    <p>
      Hast du Fragen oder Anregungen? Kontaktiere uns gerne per E-Mail an{' '}
      <a
        href="mailto:landshut@arbeiterkind.de"
        style={{ color: theme.link, textDecoration: 'none' }}
      >
        landshut@arbeiterkind.de
      </a>
      .
    </p>
  </div>
)}
    </main>
  )
}
