export interface Game {
  id: string;
  game_number: number;
  date: string;
  winner: 'Brady' | 'Jenny';
  score: number;
  went_first: 'Brady' | 'Jenny';
  knock: boolean;
  undercut_by?: 'Brady' | 'Jenny' | null;
  deadwood_difference?: number;
  created_at: string;
  updated_at: string;
}

export interface GameFormData {
  date: string;
  winner: 'Brady' | 'Jenny';
  went_first: 'Brady' | 'Jenny';
  knock: boolean;
  score?: number;
  deadwood_difference?: number;
  undercut_by?: 'Brady' | 'Jenny' | null;
}

export interface Stats {
  bradyScore: number;
  jennyScore: number;
  totalGames: number;
  bradyWins: number;
  jennyWins: number;
  lastGame?: Game;
  averageScore: number;
  ginPercentage: number;
  knockPercentage: number;
  undercutPercentage: number;
}