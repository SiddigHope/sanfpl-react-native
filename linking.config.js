import * as Linking from 'expo-linking';

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      MainTabs: {
        path: '',
        screens: {
          Home: '',
          Transfers: 'transfers',
          'Price Changes': 'price-changes',
          Fixtures: 'fixtures',
          Predictions: 'predictions',
        },
      },
      MyTeam: 'my-team',
      TeamRating: 'team-rating',
      PlayerInfo: 'player-info/:playerName?',
      TransferPlayerSelection: 'transfer/:playerName?',
      Captaincy: 'captaincy',
      MatchDetails: 'match/:matchId?',
      PlayerFixtureInfo: 'player-fixture/:playerName?',
    },
  },
};

export default linking;
