import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkoLIrPGhsB0G7GeLoK6jGWtg-cC9A1CQ",
  authDomain: "quan-li-cau-ca.firebaseapp.com",
  projectId: "quan-li-cau-ca",
  storageBucket: "quan-li-cau-ca.firebasestorage.app",
  messagingSenderId: "1006413833330",
  appId: "1:1006413833330:web:d57b046a4ced07e2fc4eeb",
  measurementId: "G-CTZ466TSPQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, db, googleProvider, signInWithPopup, signOut };
