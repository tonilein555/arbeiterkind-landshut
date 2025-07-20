import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mzhnxmgftqxbivecgnna.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aG54bWdmdHF4Yml2ZWNnbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTIwODAsImV4cCI6MjA2ODUyODA4MH0.zfwLmqNxCHO-x33Ys0kRKOZg55r4dhDqysKHnRNk4EM"
);

export default function Home() {
  const [frage, setFrage] = useState("");
  const [antworten, setAntworten] = useState({});
  const [fragen, setFragen] = useState([]);
  const [antwortText, setAntwortText] = useState({});
  const [admin, setAdmin] = useState(false);
  const [passwort, setPasswort] = useState("");
  const [nachricht, setNachricht] = useState("");

  useEffect(() => {
    ladeFragen();
  }, []);

  async function ladeFragen() {
    const { data, error } = await supabase
      .from("questions")
      .select("*, answers(*)")
      .eq("hidden", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fehler beim Laden", error);
    } else {
      setFragen(data);
    }
  }

  async function frageAbschicken() {
    if (!frage.trim()) return;

    const { error } = await supabase.from("questions").insert({ text: frage });
    if (error) {
      alert("Fehler beim Absenden.");
    } else {
      setNachricht("Frage erfolgreich gesendet!");
      setFrage("");
      ladeFragen();
      setTimeout(() => setNachricht(""), 2000);
    }
  }

  async function antworteSenden(question_id) {
    if (!antwortText[question_id]?.trim()) return;

    const { error } = await supabase.from("answers").insert({
      text: antwortText[question_id],
      question_id,
    });

    if (error) {
      alert("Fehler beim Senden der Antwort.");
    } else {
      setAntwortText((prev) => ({ ...prev, [question_id]: "" }));
      ladeFragen();
    }
  }

  async function toggleHidden(id, hidden) {
    await supabase.from("questions").update({ hidden: !hidden }).eq("id", id);
    ladeFragen();
  }

  async function likeFrage(id) {
    const likedKey = `liked-${id}`;
    if (localStorage.getItem(likedKey)) return;

    const frage = fragen.find((f) => f.id === id);
    const neueLikes = (frage.likes || 0) + 1;

    const { error } = await supabase.from("questions").update({ likes: neueLikes }).eq("id", id);
    if (!error) {
      localStorage.setItem(likedKey, "true");
      ladeFragen();
    }
  }

  function login() {
    if (passwort === "admin123") {
      setAdmin(true);
      setPasswort("");
    } else {
      alert("Falsches Passwort");
    }
  }

  function logout() {
    setAdmin(false);
  }

  return (
    <main style={{ background: "var(--background)", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1>Frag uns alles!</h1>

      {/* Frage absenden */}
      {!admin && (
        <>
          <textarea
            placeholder="Deine Frage..."
            value={frage}
            onChange={(e) => setFrage(e.target.value)}
            style={{ display: "block", width: "100%", padding: 10, marginBottom: 10, border: "1px solid gray", borderRadius: 4 }}
          />
          <button onClick={frageAbschicken} style={{ padding: "10px 20px", background: "dodgerblue", color: "white", border: "none", borderRadius: 4 }}>
            Frage absenden
          </button>
          {nachricht && <p style={{ color: "lightgreen" }}>{nachricht}</p>}
        </>
      )}

      {/* Fragen & Antworten */}
      {fragen.map((frage) => (
        <div key={frage.id} style={{ border: "1px solid #555", padding: 10, marginTop: 20, borderRadius: 4 }}>
          <strong>{frage.text}</strong>
          <p style={{ fontSize: "0.8em", color: "gray" }}>Eingereicht am: {new Date(frage.created_at).toLocaleDateString()}</p>

          {frage.answers.length > 0 && (
            <>
              <div style={{ marginTop: 10, background: "#111", padding: 10, borderRadius: 4 }}>
                {frage.answers.map((a) => (
                  <div key={a.id}>
                    <p style={{ marginBottom: 4 }}>{a.text}</p>
                    <p style={{ fontSize: "0.75em", color: "gray" }}>
                      Beantwortet am: {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Like Button */}
          {!admin && frage.answers.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button onClick={() => likeFrage(frage.id)} style={{ background: "transparent", color: "hotpink", border: "none", cursor: "pointer" }}>
                ❤️ {frage.likes || 0}
              </button>
            </div>
          )}

          {/* Admin Antwortfeld */}
          {admin && (
            <>
              <textarea
                placeholder="Antwort schreiben..."
                value={antwortText[frage.id] || ""}
                onChange={(e) => setAntwortText({ ...antwortText, [frage.id]: e.target.value })}
                style={{ width: "100%", marginTop: 10, padding: 10, border: "1px solid gray", borderRadius: 4 }}
              />
              <button onClick={() => antworteSenden(frage.id)} style={{ marginTop: 5, background: "limegreen", color: "white", padding: "8px 12px", border: "none", borderRadius: 4 }}>
                Antwort senden
              </button>
              <button onClick={() => toggleHidden(frage.id, frage.hidden)} style={{ marginLeft: 10, color: "red", background: "transparent", border: "none" }}>
                {frage.hidden ? "Einblenden" : "Verstecken"}
              </button>
            </>
          )}
        </div>
      ))}

      {/* Admin Login */}
      {!admin && (
        <div style={{ marginTop: 50 }}>
          <input
            type="password"
            placeholder="Admin-Passwort"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            style={{ padding: 10, borderRadius: 4, width: "100%", border: "1px solid gray", marginBottom: 10 }}
          />
          <button onClick={login} style={{ background: "mediumorchid", color: "white", padding: "10px 20px", border: "none", borderRadius: 4 }}>
            Als Admin einloggen
          </button>
        </div>
      )}

      {admin && (
        <button onClick={logout} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 4 }}>
          Logout
        </button>
      )}
    </main>
  );
}








