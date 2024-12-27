export function getLocalDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function formatDateForDisplay(date: string) {
  return new Date(date).toLocaleDateString();
}