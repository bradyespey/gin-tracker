import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface GameRow {
  date: string;
  winner: 'Brady' | 'Jenny';
  score: string;
  wentFirst: 'Brady' | 'Jenny';
  knock: boolean;
  undercutBy: 'Brady' | 'Jenny' | '';
}

const INITIAL_ROW: GameRow = {
  date: new Date().toISOString().split('T')[0],
  winner: 'Brady',
  score: '',
  wentFirst: 'Brady',
  knock: false,
  undercutBy: '',
};

export function ImportGames() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<GameRow[]>([{ ...INITIAL_ROW }]);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-red-600">Please sign in to import games.</p>
      </div>
    );
  }

  const addRow = () => {
    setRows([...rows, { ...INITIAL_ROW }]);
  };

  const updateRow = (index: number, field: keyof GameRow, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('games').insert(
        rows.map(row => ({
          date: row.date,
          winner: row.winner,
          score: parseInt(row.score),
          went_first: row.wentFirst,
          knock: row.knock,
          undercut_by: row.undercutBy || null
        }))
      );

      if (error) throw error;
      navigate('/gin');
    } catch (error) {
      console.error('Error importing games:', error);
      alert('Error importing games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Import Games</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Winner</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Went First</th>
                <th className="px-4 py-2">Knock</th>
                <th className="px-4 py-2">Undercut By</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(index, 'date', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.winner}
                      onChange={(e) => updateRow(index, 'winner', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="Brady">Brady</option>
                      <option value="Jenny">Jenny</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.score}
                      onChange={(e) => updateRow(index, 'score', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.wentFirst}
                      onChange={(e) => updateRow(index, 'wentFirst', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="Brady">Brady</option>
                      <option value="Jenny">Jenny</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={row.knock}
                      onChange={(e) => updateRow(index, 'knock', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.undercutBy}
                      onChange={(e) => updateRow(index, 'undercutBy', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={!row.knock}
                    >
                      <option value="">No Undercut</option>
                      <option value="Brady">Brady</option>
                      <option value="Jenny">Jenny</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Row
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Importing...' : 'Import Games'}
          </button>
        </div>
      </form>
    </div>
  );
}