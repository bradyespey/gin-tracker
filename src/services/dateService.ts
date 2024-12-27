import { format, parseISO } from 'date-fns';

export function getLocalDate(): string {
  const now = new Date();
  return format(now, 'yyyy-MM-dd');
}

export function formatDateForDisplay(date: string): string {
  const parsedDate = parseISO(date);
  return format(parsedDate, 'MM/dd/yyyy');
}