export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
};

export const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getStatusColor = (wastagePercent: number): string => {
  if (wastagePercent <= 8) return 'green';
  if (wastagePercent <= 15) return 'amber';
  return 'red';
};

export const getStatusLabel = (wastagePercent: number): string => {
  if (wastagePercent <= 8) return 'On Track';
  if (wastagePercent <= 15) return 'Warning';
  return 'Critical';
};
