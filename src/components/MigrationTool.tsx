import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import type { Game } from '../types/game';

export function MigrationTool() {
  const [status, setStatus] = useState<string>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setFirebaseUser(result.user);
      addLog(`Signed in as ${result.user.email}`);
    } catch (error) {
      addLog(`Sign in error: ${error}`);
    }
  };

  const migrate = async () => {
    if (!firebaseUser) {
      addLog('Please sign in to Firebase first');
      return;
    }

    setStatus('running');
    addLog('Starting migration...');

    try {
      // 1. Fetch from Supabase
      addLog('Fetching games from Supabase...');
      const { data: games, error } = await supabase
        .from('games')
        .select('*');

      if (error) {
        console.error('Supabase fetch error:', error);
        addLog(
          `Supabase error: ${
            'message' in error ? (error as any).message : JSON.stringify(error)
          }`
        );
        throw error;
      }
      if (!games) {
        addLog('No games found in Supabase');
        setStatus('completed');
        return;
      }

      addLog(`Found ${games.length} games. Starting import...`);

      // 2. Write to Firestore in batches
      const batchSize = 400; // Firestore limit is 500
      const chunks = [];
      for (let i = 0; i < games.length; i += batchSize) {
        chunks.push(games.slice(i, i + batchSize));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((game: Game) => {
          const docRef = doc(db, 'games', game.id);
          // Convert date strings to timestamps if needed, or keep as ISO strings
          // Supabase returns strings, Firestore can store strings or Timestamps. 
          // The app uses ISO strings, so we keep them as is.
          batch.set(docRef, game);
        });
        await batch.commit();
        addLog(`Processed batch of ${chunk.length} games`);
      }

      addLog('Migration completed successfully!');
      setStatus('completed');

    } catch (error: unknown) {
      console.error('Migration error:', error);
      addLog(
        `Error: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      );
      setStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Migration Tool</h1>
      
      <div className="mb-6 space-y-4">
        {!firebaseUser ? (
          <button
            onClick={signIn}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign in to Firebase
          </button>
        ) : (
          <div className="text-green-600 mb-2">Signed in as: {firebaseUser.email}</div>
        )}

        <button
          onClick={migrate}
          disabled={!firebaseUser || status === 'running'}
          className={`px-4 py-2 rounded text-white ${
            !firebaseUser || status === 'running' 
              ? 'bg-gray-400' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Start Migration
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
        {log.map((entry, i) => (
          <div key={i} className="mb-1">{entry}</div>
        ))}
      </div>
    </div>
  );
}

