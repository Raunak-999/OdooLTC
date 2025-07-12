import { formatDistanceToNow, format } from 'date-fns';

export function formatTimeAgo(date: Date | any): string {
  try {
    // Handle invalid dates
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'recently';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'recently';
  }
}

export function formatDate(date: Date | any): string {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown date';
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Unknown date';
  }
}

export function formatDateTime(date: Date | any): string {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown date';
    }
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Unknown date';
  }
}

export function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;
  
  if (safeCount === 1) {
    return `${safeCount} ${singular}`;
  }
  return `${safeCount} ${plural || singular + 's'}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
