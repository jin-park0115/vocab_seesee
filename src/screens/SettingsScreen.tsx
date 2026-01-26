import React, {useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text} from 'react-native';

import {
  pickNextWidgetWord,
  writeWidgetSnapshot,
} from '../widgets/widgetSnapshot';

export default function SettingsScreen(): React.JSX.Element {
  const [status, setStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateWidget = async () => {
    setIsUpdating(true);
    setStatus(null);
    try {
      const nextWord = await pickNextWidgetWord();
      if (!nextWord) {
        setStatus('No available word for the widget.');
        return;
      }
      await writeWidgetSnapshot(nextWord);
      setStatus(`Widget updated: ${nextWord.word}`);
    } catch (error) {
      setStatus('Failed to update the widget.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.description}>Language preferences go here.</Text>
      <Pressable
        onPress={handleUpdateWidget}
        disabled={isUpdating}
        style={({pressed}) => [
          styles.button,
          pressed && styles.buttonPressed,
          isUpdating && styles.buttonDisabled,
        ]}>
        <Text style={styles.buttonText}>
          {isUpdating ? 'Updating...' : 'Update Widget'}
        </Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
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
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
});
