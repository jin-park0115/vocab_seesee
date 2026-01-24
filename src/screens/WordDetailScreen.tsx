import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation';
import {getExamplesByWordId, getWordById} from '../features/words/repository';
import type {Example, Word} from '../features/words/types';
import NotFoundScreen from './NotFoundScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

export default function WordDetailScreen({route}: Props): React.JSX.Element {
  const id = route.params?.id;
  const isValidId = typeof id === 'string' && id.trim().length > 0;

  const [loading, setLoading] = useState(true);
  const [word, setWord] = useState<Word | null>(null);
  const [examples, setExamples] = useState<Example[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isValidId) {
        setLoading(false);
        return;
      }

      const loadedWord = await getWordById(id.trim());
      const loadedExamples = loadedWord
        ? await getExamplesByWordId(loadedWord.id)
        : [];

      if (isMounted) {
        setWord(loadedWord);
        setExamples(loadedExamples);
        setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isValidId]);

  if (!isValidId) {
    return <NotFoundScreen />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading word...</Text>
      </SafeAreaView>
    );
  }

  if (!word) {
    return <NotFoundScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Word Detail</Text>
      <View style={styles.card}>
        <Text style={styles.word}>{word.word}</Text>
        <Text style={styles.reading}>{word.reading ?? '-'}</Text>
        <Text style={styles.meaning}>{word.meaningKo}</Text>
        <Text style={styles.meta}>
          {word.lang.toUpperCase()} · {word.category}
        </Text>
      </View>
      <View style={styles.examples}>
        <Text style={styles.sectionTitle}>Examples</Text>
        {examples.length === 0 ? (
          <Text style={styles.emptyText}>No examples yet.</Text>
        ) : (
          examples.map(example => (
            <View key={example.id} style={styles.exampleCard}>
              <Text style={styles.exampleNative}>
                {example.sentenceNative}
              </Text>
              {example.sentenceReading ? (
                <Text style={styles.exampleReading}>
                  {example.sentenceReading}
                </Text>
              ) : null}
              <Text style={styles.exampleKo}>{example.sentenceKo}</Text>
              <Text style={styles.exampleTag}>#{example.contextTag}</Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#666',
  },
  word: {
    fontSize: 22,
    fontWeight: '700',
  },
  reading: {
    marginTop: 6,
    fontSize: 16,
    color: '#666',
  },
  meaning: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  examples: {
    marginTop: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exampleCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f6f6f6',
    gap: 4,
  },
  exampleNative: {
    fontSize: 14,
    fontWeight: '600',
  },
  exampleKo: {
    fontSize: 13,
    color: '#555',
  },
  exampleReading: {
    fontSize: 12,
    color: '#777',
  },
  exampleTag: {
    fontSize: 11,
    color: '#888',
  },
  emptyText: {
    fontSize: 13,
    color: '#777',
  },
});
