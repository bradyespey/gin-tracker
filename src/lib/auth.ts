import { supabase } from './supabase';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function isAllowedEmail(email: string | undefined) {
  if (!email) return false;
  const allowedEmails = import.meta.env.VITE_ALLOWED_EMAILS?.split(',') || [];
  return allowedEmails.includes(email);
}