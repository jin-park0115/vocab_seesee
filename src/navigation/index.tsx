import React from 'react';
import {NavigationContainer, type LinkingOptions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import TabsNavigator from './Tabs';
import CategoryWordsScreen from '../screens/CategoryWordsScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WordDetailScreen from '../screens/WordDetailScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
  WordDetail: {id?: string; source?: 'widget' | 'lockscreen' | 'deeplink'} | undefined;
  CategoryWords: {categoryKey: string; title: string};
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vocab://'],
  config: {
    screens: {
      Tabs: '',
      Settings: 'settings',
      WordDetail: 'word/:id',
      NotFound: '*',
    },
  },
};

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Tabs">
        <Stack.Screen
          name="Tabs"
          component={TabsNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen name="CategoryWords" component={CategoryWordsScreen} />
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
