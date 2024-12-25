import { supabase } from './supabase';

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: false // Ensure browser redirects after auth
      },
    });
    
    if (error) {
      console.error('Auth error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Detailed auth error:', error);
    throw error;
  }
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