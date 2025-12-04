import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import linking from './linking.config';
import { StackNavigator } from './src/navigation/StackNavigator';

export default function App() {
    const [state, setState] = React.useState()
    return (
        <NavigationContainer linking={linking}>
            <StackNavigator />
        </NavigationContainer>
    );
}
