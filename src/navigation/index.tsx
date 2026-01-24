import React from 'react';
import {NavigationContainer, type LinkingOptions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WordDetailScreen from '../screens/WordDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  WordDetail: {id?: string} | undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vocab://'],
  config: {
    screens: {
      Home: '',
      Settings: 'settings',
      WordDetail: 'word/:id',
      NotFound: '*',
    },
  },
};

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WordDetail" component={WordDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{title: 'Not Found'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
