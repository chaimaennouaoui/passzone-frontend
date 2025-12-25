import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { isAdminEmail } from "../auth/roles";

export default function Login() {
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
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ admin => /admin, fan => /fanzones
      nav(isAdminEmail(email) ? "/admin" : "/fanzones", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const adminTyping = isAdminEmail(email);

  return (
    <div className="authPage">
      <div className="card authCard">
        <div className="h1">{adminTyping ? "Connexion Admin" : "Connexion"}</div>
        <div className="p">
         
             Connectez-vous à Pass Zone.
        </div>

        <div style={{ height: 12 }} />

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

          <button className="btn btnGreen" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          
          {!adminTyping && (
            <div className="small">
              Pas de compte ?{" "}
              <Link to="/register" style={{ color: "var(--red)", fontWeight: 700 }}>
                Créer un compte
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
