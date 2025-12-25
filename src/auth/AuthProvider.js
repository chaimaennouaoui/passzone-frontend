import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// ✅ Mets ici TON email admin (celui que tu utilises pour te connecter)
const ADMIN_EMAILS = ["admin@gmail.com"]; // change-le plus tard

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => {
    const email = user?.email || null;
    const isAdmin = email ? ADMIN_EMAILS.some(a => a.toLowerCase() === email.toLowerCase()) : false;

    return {
      user,
      email,
      isAdmin,
      loading,
      logout: () => signOut(auth),
      // plus tard: getToken() pour le backend
      getIdToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
    };
  }, [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
