import type { GameFormData } from '../types/game';

export function calculateScore(formData: GameFormData): number {
  return formData.knock ? (formData.deadwood_difference || 0) : 25;
}

export function getEmptyGame(): GameFormData {
  return {
    date: new Date().toISOString().split('T')[0],
    winner: 'Brady',
    went_first: 'Brady',
    knock: false,
  };
}