import { create } from 'zustand';
import { fetchBootstrapData, fetchFixtures, fetchTeamPicks } from '../api/fpl';

interface Player {
  photo: any;
  value_form: string;
  code: number;
  selected_by_percent: string;
  transfers_out_event: number;
  transfers_in_event: number;
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  form: string;
  total_points: number;
  status: string;
  team_short_name:string;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface FPLState {
  players: Player[];
  teams: Team[];
  currentGameweek: number;
  isLoading: boolean;
  error: string | null;
  teamId: string | null;
  // Actions
  setTeamId: (id: string) => void;
  fetchGlobalData: () => Promise<void>;
  fetchUserTeam: (gameweek: number) => Promise<void>;
  userTeam: any | null;
  fixtures: any|null,
  bank: any|null
}

export const useFPLStore = create<FPLState>((set, get) => ({
  players: [],
  teams: [],
  currentGameweek: 1,
  isLoading: false,
  error: null,
  teamId: null,
  userTeam: null,
  fixtures: [],
  bank:0,
  setTeamId: (id) => set({ teamId: id }),

  fetchGlobalData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [data, fixturesData] = await Promise.all([
      fetchBootstrapData(),
      fetchFixtures(),
    ]);
      set({
        players: data.elements,
        teams: data.teams,
        currentGameweek: data.events.find((event: any) => event.is_current)?.id || 1,
        fixtures: fixturesData,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch global data', isLoading: false });
    }
  },

  fetchUserTeam: async (gameweek) => {
    const { teamId } = get();
    if (!teamId) return;

    set({ isLoading: true, error: null });
    try {
      const data = await fetchTeamPicks(parseInt(teamId), gameweek);
      set({ userTeam: data, bank:data?.entry_history?.bank, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch team data', isLoading: false });
    }
  },
}));