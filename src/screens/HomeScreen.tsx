import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';

import WordCard from '../components/WordCard';
import WordDetailSheet from '../components/WordDetailSheet';
import {
  getBookmarksMap,
  getBookmarksSorted,
  getTodaysWordIds,
  getWordsByIds,
  removeBookmark,
  upsertBookmark,
} from '../features/words/repository';
import type {Word} from '../features/words/types';
import type {RootStackParamList} from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({navigation}: Props): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [todayWords, setTodayWords] = useState<Word[]>([]);
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [todayIds, bookmarksSet, savedList] = await Promise.all([
      getTodaysWordIds(),
      getBookmarksMap(),
      getBookmarksSorted(),
    ]);

    const todayList = await getWordsByIds(todayIds);

    setTodayWords(todayList);
    setSavedWords(savedList);
    setBookmarks(bookmarksSet);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleToggleBookmark = useCallback(
    async (wordId: string) => {
      if (bookmarks.has(wordId)) {
        await removeBookmark(wordId);
      } else {
        await upsertBookmark(wordId);
      }
      await loadData();
    },
    [bookmarks, loadData],
  );

  const handleOpenWord = (wordId: string) => {
    setSelectedWordId(wordId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.subtitle}>Words you've seen today</Text>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsText}>Settings</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading your words...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Words</Text>
              {todayWords.length === 0 ? (
                <Text style={styles.emptyText}>
                  Tap a word from the widget to start.
                </Text>
              ) : (
                <View style={styles.cardList}>
                  {todayWords.map(word => (
                    <WordCard
                      key={word.id}
                      word={word}
                      isSaved={bookmarks.has(word.id)}
                      onPress={() => handleOpenWord(word.id)}
                      onToggleSaved={() => handleToggleBookmark(word.id)}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Words</Text>
              <Text style={styles.sectionCaption}>
                Haven't seen these in a while
              </Text>
              {savedWords.length === 0 ? (
                <Text style={styles.emptyText}>
                  Save words to see them here.
                </Text>
              ) : (
                <View style={styles.cardList}>
                  {savedWords.map(word => (
                    <WordCard
                      key={word.id}
                      word={word}
                      isSaved={bookmarks.has(word.id)}
                      showSavedBadge
                      onPress={() => handleOpenWord(word.id)}
                      onToggleSaved={() => handleToggleBookmark(word.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <WordDetailSheet
        wordId={selectedWordId}
        visible={!!selectedWordId}
        onClose={() => setSelectedWordId(null)}
        onToggleSaved={() => {
          if (selectedWordId) {
            handleToggleBookmark(selectedWordId);
          }
        }}
        isSaved={selectedWordId ? bookmarks.has(selectedWordId) : false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  settingsText: {
    fontSize: 12,
    color: '#334155',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionCaption: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  cardList: {
    gap: 12,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
