import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Trophy, PlusCircle, Import, Book } from 'lucide-react';
import { AuthButton } from './AuthButton';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/gin" className="flex items-center">
                <Trophy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-gray-900 dark:text-white font-medium">Gin Rummy</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Link 
                    to="/gin/new"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <PlusCircle className="h-5 w-5 mr-1" />
                    New Game
                  </Link>
                  <Link 
                    to="/gin/import"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Import className="h-5 w-5 mr-1" />
                    Import
                  </Link>
                </>
              )}
              <Link 
                to="/gin/rules"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Book className="h-5 w-5 mr-1" />
                Rules
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}