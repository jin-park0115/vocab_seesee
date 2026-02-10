import React, {useEffect, useState} from 'react';
import {ActivityIndicator, SafeAreaView, StyleSheet, Text} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {migrateAndSeed} from '../db/migrate';
import AppNavigator from '../navigation';

export default function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        console.log('[DB] migrateAndSeed start');
        await migrateAndSeed();
        console.log('[DB] migrateAndSeed done');
        if (isMounted) {
          setReady(true);
        }
      } catch (err) {
        console.log('[DB] migrateAndSeed error', err);
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

  return (
    <GestureHandlerRootView style={styles.flex}>
      <BottomSheetModalProvider>
        <AppNavigator />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
