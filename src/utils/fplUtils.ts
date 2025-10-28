export const calculatePriceChange = (currentPrice: number, previousPrice: number): string => {
  const diff = (currentPrice - previousPrice) / 10;
  return diff > 0 ? `+£${diff.toFixed(1)}m` : `£${diff.toFixed(1)}m`;
};

export const calculateForm = (form: string): string => {
  const formValue = parseFloat(form);
  return formValue.toFixed(1);
};

export const getPositionName = (elementType: number): string => {
  switch (elementType) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return '';
  }
};

export const formatPrice = (price: number): string => {
  return `£${(price / 10).toFixed(1)}m`;
};

export const calculatePointsPerGame = (totalPoints: number, gamesPlayed: number): string => {
  if (gamesPlayed === 0) return '0.0';
  return (totalPoints / gamesPlayed).toFixed(1);
};

export const calculateValueForm = (price: number, form: string): string => {
  const formValue = parseFloat(form);
  const priceInMillions = price / 10;
  return (formValue / priceInMillions).toFixed(2);
};

export const getGameweekDeadline = (gameweek: any): string => {
  if (!gameweek?.deadline_time) return '';
  
  const deadline = new Date(gameweek.deadline_time);
  return deadline.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRemainingTime = (deadline: string): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) return 'Deadline passed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const sortPlayersByPosition = (players: any[]): any[] => {
  return players.sort((a, b) => {
    // Sort by position type first
    if (a.element_type !== b.element_type) {
      return a.element_type - b.element_type;
    }
    // Then by total points
    return b.total_points - a.total_points;
  });
};