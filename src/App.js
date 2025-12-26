import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./ui/theme.css";

import { AuthProvider, useAuth } from "./auth/AuthProvider";
import RequireAdmin from "./auth/RequireAdmin";
import RequireFan from "./auth/RequireFan";

import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FanZones from "./pages/FanZones";
import MyReservations from "./pages/MyReservations";
import { Topbar } from "./ui/components";

function FanShell({ children }) {
  const { email, logout } = useAuth();
  return (
    <>
      <Topbar email={email} onLogout={logout} />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* FAN ONLY */}
          <Route
            path="/fanzones"
            element={
              <RequireFan>
                <FanShell>
                  <FanZones />
                </FanShell>
              </RequireFan>
            }
          />

          <Route
            path="/my"
            element={
              <RequireFan>
                <FanShell>
                  <MyReservations />
                </FanShell>
              </RequireFan>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
