import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import {
  getExamplesByWordId,
  getWordById,
  isBookmarked,
  logExposure,
  touchBookmarkLastViewed,
} from '../features/words/repository';
import type {Example, Word} from '../features/words/types';

type Props = {
  wordId?: string | null;
  visible: boolean;
  onClose: () => void;
  onToggleSaved: () => void;
  isSaved: boolean;
  useModal?: boolean;
};

export default function WordDetailSheet({
  wordId,
  visible,
  onClose,
  onToggleSaved,
  isSaved,
  useModal = true,
}: Props): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState<Word | null>(null);
  const [examples, setExamples] = useState<Example[]>([]);
  const modalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  const validWordId = useMemo(() => {
    if (!wordId) {
      return null;
    }
    const trimmed = wordId.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [wordId]);

  useEffect(() => {
    if (!useModal) {
      return;
    }
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [useModal, visible]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!validWordId) {
        setWord(null);
        setExamples([]);
        setLoading(false);
        return;
      }

      if (useModal && !visible) {
        return;
      }

      setLoading(true);
      await logExposure(validWordId, 'app');
      const loadedWord = await getWordById(validWordId);
      const loadedExamples = loadedWord
        ? await getExamplesByWordId(loadedWord.id)
        : [];
      const bookmarked = loadedWord
        ? await isBookmarked(loadedWord.id)
        : false;
      if (bookmarked && loadedWord) {
        await touchBookmarkLastViewed(loadedWord.id);
      }

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
  }, [validWordId, useModal, visible]);

  const ScrollComponent = useModal ? BottomSheetScrollView : ScrollView;
  const showContent = !useModal || visible;

  const renderHandle = useCallback(() => {
    return (
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
    );
  }, [onClose]);

  const content = (
    <View style={styles.sheet}>
      <ScrollComponent
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {showContent ? (
          loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.stateText}>Loading word...</Text>
            </View>
          ) : !validWordId || !word ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateTitle}>Not Found</Text>
              <Text style={styles.stateText}>
                The word id is missing or invalid.
              </Text>
              <Text style={styles.stateText}>Swipe down to close.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.meta}>
                {word.lang.toUpperCase()} · {word.category}
              </Text>
              <View style={styles.wordRow}>
                <Text style={styles.word}>{word.word}</Text>
                <Pressable style={styles.bookmarkButton} onPress={onToggleSaved}>
                  <Text style={styles.bookmarkIcon}>{isSaved ? '★' : '☆'}</Text>
                  <Text style={styles.bookmarkLabel}>Save</Text>
                </Pressable>
              </View>
              <Text style={styles.reading}>{word.reading ?? '-'}</Text>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MEANING</Text>
                <View style={styles.card}>
                  <Text style={styles.meaning}>{word.meaningKo}</Text>
                </View>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EXAMPLES</Text>
                {examples.length === 0 ? (
                  <Text style={styles.emptyText}>No examples yet.</Text>
                ) : (
                  examples.map(example => (
                    <View key={example.id} style={styles.card}>
                      <Text style={styles.exampleNative}>
                        {example.sentenceNative}
                      </Text>
                      {example.sentenceReading ? (
                        <Text style={styles.exampleReading}>
                          {example.sentenceReading}
                        </Text>
                      ) : null}
                      <Text style={styles.exampleKo}>{example.sentenceKo}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )
        ) : null}
      </ScrollComponent>
    </View>
  );

  if (!useModal) {
    return <SafeAreaView style={styles.screenContainer}>{content}</SafeAreaView>;
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      handleComponent={renderHandle}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          pressBehavior="close"
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={styles.sheetBackground}>
      <View style={styles.sheetContent}>{content}</View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  sheet: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheetBackground: {
    backgroundColor: '#f4f6ff',
  },
  sheetContent: {
    flex: 1,
  },
  handleContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6ff',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5f5',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#64748b',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 18,
  },
  meta: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  word: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
  },
  reading: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    gap: 6,
  },
  meaning: {
    fontSize: 16,
    color: '#1e293b',
  },
  exampleNative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  exampleReading: {
    fontSize: 12,
    color: '#64748b',
  },
  exampleKo: {
    fontSize: 13,
    color: '#475569',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  bookmarkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
  },
  bookmarkIcon: {
    fontSize: 18,
    color: '#f59e0b',
  },
  bookmarkLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  stateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
