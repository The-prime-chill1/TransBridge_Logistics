import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdlG6Jg-Tf9aBEXUuFbFqfi---rpcDu7Q",
  authDomain: "transbridgelogistics.firebaseapp.com",
  projectId: "transbridgelogistics",
  storageBucket: "transbridgelogistics.firebasestorage.app",
  messagingSenderId: "1008693317966",
  appId: "1:1008693317966:web:fef0c6fddd30637fbe8e1f"
};

// The designated admin email — this user will always get the 'admin' role
export const ADMIN_EMAIL = 'admin@transbridgelogistics.com';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Setup invisible reCAPTCHA for phone auth
export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
    });
  }
};

/**
 * Gets or creates a Firestore user document at users/{uid}.
 * - If the user's email matches ADMIN_EMAIL → role is 'admin'
 * - All other users → role is 'customer'
 * This is called on every auth state change so roles are always in sync.
 */
export const getOrCreateUserDoc = async (firebaseUser) => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  // New user: auto-assign role based on email
  const role = firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'customer';

  const userData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || null,
    displayName: firebaseUser.displayName || null,
    phoneNumber: firebaseUser.phoneNumber || null,
    photoURL: firebaseUser.photoURL || null,
    role,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);
  return userData;
};
