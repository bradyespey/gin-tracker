import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out', error);
    throw error;
  }
};

export const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || '').split(',');

export const isAllowedEmail = (email?: string | null) => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email);
};

