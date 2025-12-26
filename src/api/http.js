import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// ✅ API URL depuis Netlify (CRA)
const API_URL = process.env.REACT_APP_API_URL;

export const http = axios.create({
  baseURL: `${API_URL}/api`,
});

// ✅ attendre firebase user (une seule fois)
function waitForUser(auth) {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

http.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    let user = auth.currentUser;

    // ✅ attendre firebase
    if (!user) {
      user = await waitForUser(auth);
    }

    // ✅ ajouter token si connecté
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
