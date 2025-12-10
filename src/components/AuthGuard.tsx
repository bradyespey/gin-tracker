//src/components/AuthGuard.tsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { isAllowedEmail } from '../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isDemo } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Allow access if user is logged in OR it's demo mode
  if ((!user || !isAllowedEmail(user.email)) && !isDemo) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Please sign in with an authorized email to access this feature.</p>
      </div>
    );
  }

  return <>{children}</>;
}