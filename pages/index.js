'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mzhnxmgftqxbivecgnna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'
)

export default function Page() {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [admin, setAdmin] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [answerInputs, setAnswerInputs] = useState({})
  const [showAdminLogin, setShowAdminLogin] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [isDark, setIsDark] = useState(false)

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
    return () => {
      mql.removeEventListener('change', handleChange)
    }
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
    }
  }

  async function submitQuestion() {
    if (!newQuestion.trim()) return

    const { error } = await supabase.from('questions').insert({
      text: newQuestion,
      hidden: false,
    })

    if (error) {
      console.error('Fehler beim Senden der Frage', error)
    } else {
      setNewQuestion('')
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

  return (
    <main
      style={{
        background: isDark ? '#000' : '#fff',
        color: isDark ? '#fff' : '#000',
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
      <p style={{ textAlign: 'center', marginBottom: 20 }}>
        Stell&#39; uns gerne hier Deine Fragen. Wir freuen uns darüber!
      </p>

      {!admin && (
        <div style={{ marginBottom: 20, width: '100%', textAlign: 'left' }}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Deine Frage..."
            style={{
              width: '100%',
              height: 80,
              padding: 10,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc',
              backgroundColor: isDark ? '#111' : '#eee',
              color: isDark ? '#fff' : '#000',
              marginBottom: 10,
              '::placeholder': {
                color: isDark ? '#aaa' : '#888',
              },
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={submitQuestion}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Frage absenden
            </button>
          </div>
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
              border: '1px solid #444',
              borderRadius: 6,
              padding: 12,
              marginBottom: 20,
              width: '100%',
              backgroundColor: isDark ? '#000' : '#fb0000ff',
            }}
          >
            <p style={{ fontWeight: 'bold' }}>{q.text}</p>
            <p style={{ fontSize: 12, color: '#888' }}>
              Eingereicht am: {new Date(q.created_at).toLocaleDateString()}
            </p>
            {answer ? (
              <div
                style={{
                  backgroundColor: isDark ? '#111' : '#e5e5e5',
                  padding: 10,
                  borderRadius: 4,
                  marginTop: 8,
                  color: isDark ? '#fff' : '#e5e5e5',
                  border: isDark ? '1px solid #444' : '1px solid #ccc',
                }}
              >
                {answer.text}
                <p
                  style={{
                    fontSize: 12,
                    color: isDark ? '#ccc' : '#666',
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
                    backgroundColor: isDark ? '#111' : '#eee',
                    color: isDark ? 'white' : 'black',
                    border: '1px solid #555',
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
                <button
                  onClick={() => hideQuestion(q.id)}
                  style={{
                    float: 'right',
                    marginTop: 8,
                    color: 'red',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Verstecken
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
            backgroundColor: isDark ? '#222' : '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            width: 260,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
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
              color: '#888',
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
              backgroundColor: isDark ? '#111' : '#fff',
              border: '1px solid #555',
              color: isDark ? 'white' : 'black',
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
    </main>
  )
}
