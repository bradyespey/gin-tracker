import type { Game, GameFormData, Stats } from '../types/game';

export function calculateScore(knock: boolean, deadwoodDifference?: number, score?: number): number {
  if (knock) {
    return Number(deadwoodDifference || 0);
  }
  return Number(score || 25);
}

export function calculateStats(games: Game[]): Stats {
  if (!games.length) {
    return {
      bradyScore: 0,
      jennyScore: 0,
      totalGames: 0,
      bradyWins: 0,
      jennyWins: 0,
      averageScore: 0,
      ginPercentage: 0,
      knockPercentage: 0,
      undercutPercentage: 0,
    };
  }

  const stats = games.reduce(
    (acc, game) => {
      const score = Number(game.score || 0);
      
      if (game.winner === 'Brady') {
        acc.bradyWins++;
        acc.bradyScore += score;
      } else {
        acc.jennyWins++;
        acc.jennyScore += score;
      }

      if (!game.knock) acc.ginCount++;
      if (game.knock) acc.knockCount++;
      if (game.undercut_by) acc.undercutCount++;
      
      acc.totalScore += score;
      return acc;
    },
    {
      bradyWins: 0,
      jennyWins: 0,
      bradyScore: 0,
      jennyScore: 0,
      ginCount: 0,
      knockCount: 0,
      undercutCount: 0,
      totalScore: 0,
    }
  );

  const totalGames = games.length;

  return {
    bradyScore: stats.bradyScore,
    jennyScore: stats.jennyScore,
    totalGames,
    bradyWins: stats.bradyWins,
    jennyWins: stats.jennyWins,
    averageScore: Math.round(stats.totalScore / totalGames),
    ginPercentage: Math.round((stats.ginCount / totalGames) * 100),
    knockPercentage: Math.round((stats.knockCount / totalGames) * 100),
    undercutPercentage: Math.round((stats.undercutCount / totalGames) * 100),
  };
}