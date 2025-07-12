import { formatDistanceToNow, format } from 'date-fns';

export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy \'at\' h:mm a');
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) {
    return `${count} ${singular}`;
  }
  return `${count} ${plural || singular + 's'}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
