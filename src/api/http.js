import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const http = axios.create({
  baseURL: "http://localhost:8080/api",
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

    // ✅ si pas encore prêt, attendre
    if (!user) {
      user = await waitForUser(auth);
    }

    // ✅ si user existe => mettre token
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
