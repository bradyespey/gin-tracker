import type { GameFormData } from '../types/game';

export function calculateScore(formData: GameFormData): number {
  if (formData.knock) {
    return formData.deadwood_difference || 0;
  }
  return formData.score || 25;
}

export function getEmptyGame(): GameFormData {
  return {
    date: new Date().toISOString().split('T')[0],
    winner: 'Brady',
    went_first: 'Brady',
    knock: false,
    score: 25
  };
}