'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Supabase-Client
const supabase = createClient(
  'https://mzhnxmgftqxbivecgnna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'
)

// Resend-E-Mail Setup
const resend = new Resend('re_c5LajKX3_8ukEX39EwVTtK4VLqBm77tkv')

export default function Page() {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [admin, setAdmin] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [answerInputs, setAnswerInputs] = useState({})
  const [showAdminLogin, setShowAdminLogin] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')

  const ADMIN_PASSWORD = 'arbeiterkind2025landshut'

  const isDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden', error)
    } else {
      // Nur anzeigen, wenn Admin ODER beantwortet
      const filtered = admin
        ? data
        : data.filter((q) => q.answers && q.answers.length > 0)
      setQuestions(filtered)
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
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchQuestions()

      // E-Mail Benachrichtigung senden
      try {
        await resend.emails.send({
          from: 'fragen@arbeiterkind.de',
          to: 'landshut@arbeiterkind.de',
          subject: 'Neue Frage eingereicht',
          html: `<p>Neue Frage: ${newQuestion}</p>`,
        })
      } catch (e) {
        console.error('E-Mail-Fehler:', e)
      }
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
      fetchQuestions()
    } else {
      alert('Falsches Passwort')
    }
  }

  function handleLogout() {
    setAdmin(false)
    fetchQuestions()
  }

  return (
    <div
      style={{
        backgroundColor: isDark ? '#000' : '#fff',
        color: isDark ? '#fff' : '#000',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <main
        style={{
          backgroundColor: isDark ? '#111' : '#fff',
          maxWidth: 600,
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 8,
          boxShadow: isDark
            ? '0 0 10px rgba(255,255,255,0.1)'
            : '0 0 10px rgba(0,0,0,0.1)',
          padding: 20,
          paddingTop: 60,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
          Q&amp;A mit ArbeiterKind.de Landshut
        </h1>
        <p style={{ textAlign: 'center', marginBottom: 20 }}>
          Stell&#39; uns gerne hier Deine Fragen. Wir freuen uns darüber!
        </p>

        {/* Erfolgsnachricht */}
        {successMessage && (
          <p
            style={{
              backgroundColor: 'green',
              color: 'white',
              padding: 10,
              borderRadius: 4,
              marginBottom: 20,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {successMessage}
          </p>
        )}

        {/* Frage einreichen */}
        {!admin && (
          <div style={{ marginBottom: 20, width: '100%' }}>
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
                border: '1px solid #555',
                backgroundColor: isDark ? '#111' : '#f1f1f1',
                color: isDark ? 'white' : 'black',
                marginBottom: 10,
              }}
            />
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
        )}

        {/* Fragen- & Antworten-Anzeige */}
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
              }}
            >
              <p style={{ fontWeight: 'bold' }}>{q.text}</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>
                Eingereicht am: {new Date(q.created_at).toLocaleDateString()}
              </p>
              {answer ? (
                <div
                  style={{
                    backgroundColor: isDark ? '#222' : '#eaeaea',
                    padding: 10,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  {answer.text}
                  <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
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
                      backgroundColor: isDark ? '#111' : '#f1f1f1',
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

        {/* Admin Login Box */}
        {!admin && showAdminLogin && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              backgroundColor: isDark ? '#222' : '#f9f9f9',
              padding: 16,
              borderRadius: 8,
              width: 260,
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
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

        {/* Logout Button */}
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
    </div>
  )
}

























