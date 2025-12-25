import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { isAdminEmail } from "./roles";

export default function RequireFan({ children }) {
  const { email, loading } = useAuth();

  if (loading) return <div className="card">Chargement...</div>;
  if (!email) return <Navigate to="/login" replace />;

  // si admin tente d'ouvrir pages fan => admin
  if (isAdminEmail(email)) return <Navigate to="/admin" replace />;

  return children;
}
