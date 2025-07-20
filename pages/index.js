import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mzhnxmgftqxbivecgnna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_PASSWORD = 'arbeiterkind2025landshut'

export default function Home() {
  const [fragen, setFragen] = useState([])
  const [frage, setFrage] = useState('')
  const [admin, setAdmin] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    ladeFragen()
  }, [])

  async function ladeFragen() {
    const { data, error } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Fehler beim Laden', error)
    } else {
      setFragen(data)
    }
  }

  async function sendeFrage() {
    if (!frage.trim()) return
    const { error } = await supabase.from('questions').insert({ text: frage })
    if (error) {
      alert('Fehler beim Senden der Frage')
    } else {
      setFrage('')
      ladeFragen()
    }
  }

  async function antworte(questionId, text) {
    if (!text.trim()) return
    const { error } = await supabase.from('answers').insert({
      text,
      question_id: questionId,
    })
    if (error) {
      alert('Fehler beim Senden der Antwort')
    } else {
      ladeFragen()
    }
  }

  async function versteckeFrage(id) {
    await supabase.from('questions').update({ hidden: true }).eq('id', id)
    ladeFragen()
  }

  function login() {
    if (password === ADMIN_PASSWORD) {
      setAdmin(true)
      setPassword('')
    } else {
      alert('Falsches Passwort')
    }
  }

  function logout() {
    setAdmin(false)
  }

  return (
    <main
      style={{
        background: 'var(--background)',
        color: 'white',
        minHeight: '100vh',
        padding: 20,
        maxWidth: 600,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Frage stellen */}
      <h2>Frag uns alles!</h2>
      <textarea
        value={frage}
        onChange={(e) => setFrage(e.target.value)}
        placeholder="Deine Frage..."
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 4,
          marginBottom: 10,
          border: '1px solid #ccc',
          background: '#111',
          color: 'white',
        }}
      />
      <br />
      <button
        onClick={sendeFrage}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Frage absenden
      </button>

      {/* Fragen und Antworten */}
      <div style={{ marginTop: 40 }}>
        {fragen.map((frage) => (
          <div
            key={frage.id}
            style={{
              border: '1px solid #444',
              borderRadius: 6,
              padding: 10,
              marginBottom: 20,
            }}
          >
            <strong>{frage.text}</strong>
            <div style={{ fontSize: 12, color: '#bbb' }}>
              Eingereicht am:{' '}
              {new Date(frage.created_at).toLocaleDateString('de-DE')}
            </div>

            {frage.answers.length > 0 ? (
              <div
                style={{
                  background: '#222',
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 4,
                }}
              >
                {frage.answers[0].text}
                <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                  Beantwortet am:{' '}
                  {new Date(frage.answers[0].created_at).toLocaleDateString(
                    'de-DE'
                  )}
                </div>
              </div>
            ) : admin ? (
              <div style={{ marginTop: 10 }}>
                <textarea
                  placeholder="Antwort schreiben..."
                  onBlur={(e) => antworte(frage.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #666',
                    background: '#111',
                    color: 'white',
                  }}
                />
              </div>
            ) : null}

            {/* Verstecken-Button für Admin */}
            {admin && (
              <button
                onClick={() => versteckeFrage(frage.id)}
                style={{
                  marginTop: 8,
                  padding: 5,
                  background: 'crimson',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Verstecken
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Admin Panel rechts unten */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: '#222',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          zIndex: 999,
          width: 250,
        }}
      >
        {!admin ? (
          <>
            <input
              type="password"
              placeholder="Admin-Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 4,
                marginBottom: 10,
                border: '1px solid #ccc',
                background: '#111',
                color: 'white',
              }}
            />
            <button
              onClick={login}
              style={{
                width: '100%',
                padding: '10px',
                background: 'mediumorchid',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Als Admin einloggen
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'gray',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        )}
      </div>
    </main>
  )
}












