import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { isAdminEmail } from "./roles";

export default function RequireAdmin({ children }) {
  const { email, loading } = useAuth();

  if (loading) return <div className="card">Chargement...</div>;
  if (!email) return <Navigate to="/login" replace />;

  // si fan tente d'ouvrir admin => fan
  if (!isAdminEmail(email)) return <Navigate to="/fanzones" replace />;

  return children;
}
