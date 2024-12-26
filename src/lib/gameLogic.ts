import { Game, Stats } from '../types/game';

export function calculateScore(knock: boolean, deadwoodDifference?: number): number {
  if (!knock) {
    // Gin bonus (25) + deadwood points
    return 25;
  }
  return deadwoodDifference || 0;
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
      if (game.winner === 'Brady') {
        acc.bradyWins++;
        acc.bradyScore += game.score;
      } else {
        acc.jennyWins++;
        acc.jennyScore += game.score;
      }

      if (!game.knock) acc.ginCount++;
      if (game.knock) acc.knockCount++;
      if (game.undercut_by) acc.undercutCount++;
      
      acc.totalScore += game.score;
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
    lastGame: games[games.length - 1],
    averageScore: Math.round(stats.totalScore / totalGames),
    ginPercentage: Math.round((stats.ginCount / totalGames) * 100),
    knockPercentage: Math.round((stats.knockCount / totalGames) * 100),
    undercutPercentage: Math.round((stats.undercutCount / totalGames) * 100),
  };
}