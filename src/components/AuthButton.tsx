import React from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, signOut } from '../lib/auth';
import { LogIn, LogOut } from 'lucide-react';

export function AuthButton() {
  const { user } = useAuth();

  return user ? (
    <button
      onClick={() => signOut()}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <LogOut className="h-5 w-5 mr-2" />
      Sign Out
    </button>
  ) : (
    <button
      onClick={() => signInWithGoogle()}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <LogIn className="h-5 w-5 mr-2" />
      Sign In
    </button>
  );
}