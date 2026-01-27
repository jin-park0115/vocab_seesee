import React, {useEffect, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation';
import WordDetailSheet from '../components/WordDetailSheet';
import {
  getBookmarksMap,
  removeBookmark,
  upsertBookmark,
} from '../features/words/repository';
import {injectTodayWord} from '../features/today/TodayService';
import NotFoundScreen from './NotFoundScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

export default function WordDetailScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const id = route.params?.id;
  const source = route.params?.source;
  const isValidId = typeof id === 'string' && id.trim().length > 0;
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isValidId) {
      return;
    }
    const load = async () => {
      const bookmarks = await getBookmarksMap();
      setIsSaved(bookmarks.has(id.trim()));
    };
    load();
  }, [id, isValidId]);

  useEffect(() => {
    if (!isValidId) {
      return;
    }
    if (!source) {
      return;
    }
    if (source === 'widget' || source === 'lockscreen' || source === 'deeplink') {
      injectTodayWord(id.trim(), source);
    }
  }, [id, isValidId, source]);

  if (!isValidId) {
    return <NotFoundScreen />;
  }

  return (
    <WordDetailSheet
      wordId={id}
      visible
      useModal={false}
      onClose={() => navigation.goBack()}
      onToggleSaved={async () => {
        if (isSaved) {
          await removeBookmark(id.trim());
          setIsSaved(false);
        } else {
          await upsertBookmark(id.trim());
          setIsSaved(true);
        }
      }}
      isSaved={isSaved}
    />
  );
}
