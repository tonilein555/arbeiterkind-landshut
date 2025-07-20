'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mzhnxmgftqxbivecgnna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_PASSWORD = 'arbeiterkind2025landshut'

export default function App() {
  const [admin, setAdmin] = useState(false)
  const [password, setPassword] = useState('')
  const [frage, setFrage] = useState('')
  const [fragen, setFragen] = useState([])

  // Frage absenden
  const sendeFrage = async () => {
    if (!frage.trim()) return
    await supabase.from('questions').insert([{ text: frage }])
    setFrage('')
    ladeFragen()
  }

  // Fragen laden
  const ladeFragen = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('hidden', false)
      .order('created_at', { ascending: false })

    if (!error) setFragen(data)
    else console.error('Fehler beim Laden', error)
  }

  // Admin Login
  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAdmin(true)
      setPassword('')
    }
  }

  // Admin Logout
  const logout = () => {
    setAdmin(false)
  }

  useEffect(() => {
    ladeFragen()
  }, [])

  // Antwort-Formular (Admin)
  const antworte = async (questionId, text) => {
    if (!text.trim()) return
    await supabase.from('answers').insert([{ question_id: questionId, text }])
    ladeFragen()
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

      {/* Alle Fragen mit Antworten */}
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
          </div>
        ))}
      </div>

      {/* Admin Login (nur wenn nicht eingeloggt) */}
      {!admin && (
        <div style={{ marginTop: 50 }}>
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
            }}
          />
          <br />
          <button
            onClick={login}
            style={{
              padding: '10px 20px',
              background: 'mediumorchid',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Als Admin einloggen
          </button>
        </div>
      )}

      {/* Logout Button (nur sichtbar wenn eingeloggt) */}
      {admin && (
        <button
          onClick={logout}
          style={{
            marginTop: 30,
            padding: '10px 20px',
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
    </main>
  )
}











