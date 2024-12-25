export interface Game {
  id: string;
  date: string;
  winner: 'Brady' | 'Jenny';
  score: number;
  went_first: 'Brady' | 'Jenny';
  knock: boolean;
  undercut_by?: 'Brady' | 'Jenny';
  created_at: string;
  updated_at: string;
}

export interface Stats {
  bradyScore: number;
  jennyScore: number;
  totalGames: number;
  bradyWins: number;
  jennyWins: number;
  lastUpdated: string;
}