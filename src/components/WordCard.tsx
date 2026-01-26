import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {Word} from '../features/words/types';

type Props = {
  word: Word;
  isSaved: boolean;
  showSavedBadge?: boolean;
  onPress: () => void;
  onToggleSaved: () => void;
};

export default function WordCard({
  word,
  isSaved,
  showSavedBadge = false,
  onPress,
  onToggleSaved,
}: Props): React.JSX.Element {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {word.lang.toUpperCase()} · {word.category}
          </Text>
          {showSavedBadge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Saved</Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={onToggleSaved}
          hitSlop={8}
          style={({pressed}) => [
            styles.starButton,
            pressed ? styles.starPressed : null,
          ]}>
          <Text style={styles.star}>{isSaved ? '★' : '☆'}</Text>
        </Pressable>
      </View>
      <Text style={styles.word}>{word.word}</Text>
      <Text style={styles.meaning} numberOfLines={1}>
        {word.meaningKo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 10,
    color: '#64748b',
  },
  starButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  starPressed: {
    opacity: 0.7,
  },
  star: {
    fontSize: 18,
    color: '#f59e0b',
  },
  word: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  meaning: {
    fontSize: 13,
    color: '#64748b',
  },
});
