import React, {useEffect, useState} from 'react';
import {ActivityIndicator, SafeAreaView, StyleSheet, Text} from 'react-native';

import {migrateAndSeed} from '../db/migrate';
import AppNavigator from '../navigation';

export default function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await migrateAndSeed();
        if (isMounted) {
          setReady(true);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to initialize local database.');
        }
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {error ?? 'Preparing local database...'}
        </Text>
      </SafeAreaView>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
