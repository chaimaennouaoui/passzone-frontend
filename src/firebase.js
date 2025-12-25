import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBORPd6BmUzUUtIu8v0nDqUn_SzZTe0Q38",
  authDomain: "can2025-fanzone-booking.firebaseapp.com",
  projectId: "can2025-fanzone-booking",
  storageBucket: "can2025-fanzone-booking.firebasestorage.app",
  messagingSenderId: "858138953398",
  appId: "1:858138953398:web:166dcf8002f31059fe8817",
  measurementId: "G-59R2FV8H6X",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
