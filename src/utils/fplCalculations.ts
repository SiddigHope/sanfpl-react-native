import { useMemo } from 'react';

export interface EnrichedPlayer {
  id: number;
  web_name: string;
  team: number;
  team_short_name: string;
  element_type: number;
  position: string;
  now_cost: number;
  form: string;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  fixture_difficulty: number;
  predicted_points: number;
  captain_score: number;
}

export const calculateFixtureDifficulty = (fixtures: any[], teamId: number, gameweek: number): number => {
  const nextFixture = fixtures.find(f => 
    (f.team_h === teamId || f.team_a === teamId) && 
    f.event === gameweek
  );

  if (!nextFixture) return 3; // Default difficulty

  return teamId === nextFixture.team_h 
    ? nextFixture.team_h_difficulty 
    : nextFixture.team_a_difficulty;
};

export const calculatePredictedPoints = (player: any, fixtureDifficulty: number): number => {
  const form = parseFloat(player.form) || 0;
  const minutes = player.minutes;
  const gamesPlayed = Math.max(1, Math.floor(minutes / 90));
  const pointsPerGame = player.total_points / gamesPlayed;

  // Base prediction on form and average points, adjusted by fixture difficulty
  const basePrediction = ((form * 2) + pointsPerGame) / 3;
  const difficultyFactor = (6 - fixtureDifficulty) / 5; // Convert 1-5 difficulty to 1-0 factor

  return Math.round((basePrediction * difficultyFactor) * 10) / 10;
};

export const calculateCaptainScore = (player: any, predictedPoints: number): number => {
  const form = parseFloat(player.form) || 0;
  const chanceOfPlaying = player.chance_of_playing_next_round ?? 100;

  const score = (
    (form * 0.4) + 
    (predictedPoints * 0.3) - 
    (player.fixture_difficulty * 0.2) + 
    (chanceOfPlaying / 100 * 0.1)
  );

  return Math.round(score * 100) / 100;
};

export const enrichPlayer = (player: any, teams: any[], fixtures: any[], gameweek: number): EnrichedPlayer => {
  const team = teams.find(t => t.id === player.team);
  const fixtureDifficulty = calculateFixtureDifficulty(fixtures, player.team, gameweek);
  const predictedPoints = calculatePredictedPoints(player, fixtureDifficulty);

  return {
    ...player,
    team_short_name: team?.short_name || '',
    position: ['GK', 'DEF', 'MID', 'FWD'][player.element_type - 1],
    fixture_difficulty: fixtureDifficulty,
    predicted_points: predictedPoints,
    captain_score: calculateCaptainScore({
      ...player,
      fixture_difficulty: fixtureDifficulty
    }, predictedPoints)
  };
};

export const useEnrichedPlayers = (players: any[], teams: any[], fixtures: any[], gameweek: number) => {
  return useMemo(() => {
    return players.map(player => enrichPlayer(player, teams, fixtures, gameweek));
  }, [players, teams, fixtures, gameweek]);
};

export const optimizeTeam = (players: EnrichedPlayer[], formation: string = '3-4-3'): {
  starting: EnrichedPlayer[];
  bench: EnrichedPlayer[];
  captain: EnrichedPlayer;
  viceCaptain: EnrichedPlayer;
} => {
  // Sort players by position and predicted points
  const gks = players.filter(p => p.position === 'GK').sort((a, b) => b.predicted_points - a.predicted_points);
  const defs = players.filter(p => p.position === 'DEF').sort((a, b) => b.predicted_points - a.predicted_points);
  const mids = players.filter(p => p.position === 'MID').sort((a, b) => b.predicted_points - a.predicted_points);
  const fwds = players.filter(p => p.position === 'FWD').sort((a, b) => b.predicted_points - a.predicted_points);

  // Parse formation
  const [numDef, numMid, numFwd] = formation.split('-').map(Number);

  // Select starting XI based on formation
  const starting = [
    gks[0], // Starting GK
    ...defs.slice(0, numDef),
    ...mids.slice(0, numMid),
    ...fwds.slice(0, numFwd)
  ];

  // Remaining players to bench
  const bench = [
    gks[1], // Backup GK
    ...defs.slice(numDef),
    ...mids.slice(numMid),
    ...fwds.slice(numFwd)
  ];

  // Sort all players by captain score for captain selection
  const sortedByCaptaincy = [...starting].sort((a, b) => b.captain_score - a.captain_score);

  return {
    starting,
    bench,
    captain: sortedByCaptaincy[0],
    viceCaptain: sortedByCaptaincy[1]
  };
};

export const calculateTeamRating = (players: EnrichedPlayer[]): number => {
  const totalPossiblePoints = players.length * 10; // Assume 10 is max predicted points
  const totalPredictedPoints = players.reduce((sum, player) => sum + player.predicted_points, 0);
  
  return Math.round((totalPredictedPoints / totalPossiblePoints) * 100);
};