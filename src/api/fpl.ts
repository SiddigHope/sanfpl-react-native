import axios from 'axios';

// let BASE_URL = 'https://api.allorigins.win/raw?url=https://fantasy.premierleague.com/api';
let BASE_URL = 'https://fantasy.premierleague.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  // headers:{
  //   "Access-Control-Allow-Origin":"http://192.168.8.7:8081/"
  // }
});

export const fetchBootstrapData = async () => {
  try {
    const response = await api.get('/bootstrap-static/');
    return response.data;
  } catch (error) {
    console.error('Error fetching bootstrap data:', error);
    throw error;
  }
};

export const fetchTeamPicks = async (teamId: number, gameweek: number) => {
  try {
    const response = await api.get(`/entry/${teamId}/event/${gameweek}/picks/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team picks:', error);
    throw error;
  }
};

export const fetchPlayerDetails = async (playerId: number) => {
  try {
    const response = await api.get(`/element-summary/${playerId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player details:', error);
    throw error;
  }
};

export const fetchFixtures = async () => {
  try {
    const response = await api.get('/fixtures/');
    return response.data;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
};

export const fetchLivePoints = async (gameweek: number) => {
  try {
    const response = await api.get(`/event/${gameweek}/live/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live points:', error);
    throw error;
  }
};