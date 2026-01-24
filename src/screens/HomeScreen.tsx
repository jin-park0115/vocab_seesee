import React from 'react';
import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({navigation}: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vocab</Text>
      <Text style={styles.subtitle}>Lightweight word exposure</Text>
      <View style={styles.actions}>
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
        <View style={styles.spacer} />
        <Button
          title="Open demo word"
          onPress={() => navigation.navigate('WordDetail', {id: 'demo'})}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  actions: {
    marginTop: 24,
  },
  spacer: {
    height: 12,
  },
});
