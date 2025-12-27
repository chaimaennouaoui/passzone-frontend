import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      nav("/fanzones", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <div className="card authCard">
        <div className="h1">Créer un compte</div>
        <div className="p">Inscription rapide pour réserver.</div>

        <div style={{ height: 14 }} />

        <form onSubmit={onSubmit} className="stack">
          <div>
            <div className="small">Email</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <div className="small">Mot de passe</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="badge"
              style={{
                borderColor: "rgba(193,39,45,.35)",
                background: "rgba(193,39,45,.10)",
              }}
            >
              {error}
            </div>
          )}

          <button className="btn btnGreen" disabled={loading}>
            {loading ? "Création..." : "Créer le compte"}
          </button>

          <div className="small">
            Déjà un compte ?{" "}
            <Link to="/login" style={{ color: "var(--green)", fontWeight: 800 }}>
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
