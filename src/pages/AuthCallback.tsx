import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Handle the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // Set the session using the access token
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (error) {
            throw error;
          }

          if (session) {
            // Successfully authenticated
            navigate('/gin');
            return;
          }
        }

        // Fallback: try to get existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/gin');
          return;
        }

        // If no session, redirect to home
        navigate('/gin');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/gin');
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}