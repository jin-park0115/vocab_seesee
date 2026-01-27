import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';

import WordCard from '../components/WordCard';
import type {RootStackParamList} from '../navigation';
import type {Word} from '../features/words/types';
import {
  getBookmarksMap,
  getWordsByCategory,
  removeBookmark,
  upsertBookmark,
} from '../features/words/repository';
import {getSelectedLanguagesOrAll} from '../features/settings/repository';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryWords'>;

export default function CategoryWordsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {categoryKey, title} = route.params;
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<Word[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    const [langs, bookmarksSet] = await Promise.all([
      getSelectedLanguagesOrAll(),
      getBookmarksMap(),
    ]);

    const list = await getWordsByCategory(categoryKey, langs);
    setWords(list);
    setBookmarks(bookmarksSet);
    setLoading(false);
  }, [categoryKey]);

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
    navigation.navigate('WordDetail', {id: wordId});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Browse this category</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading words...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {words.length === 0 ? (
            <Text style={styles.emptyText}>
              No words yet for this category.
            </Text>
          ) : (
            <View style={styles.cardList}>
              {words.map(word => (
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
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  header: {
    padding: 24,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748b',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyText: {
    color: '#64748b',
  },
  cardList: {
    gap: 16,
  },
});
