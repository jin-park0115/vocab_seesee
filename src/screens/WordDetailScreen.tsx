import React, {useEffect, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation';
import WordDetailSheet from '../components/WordDetailSheet';
import {getBookmarksMap, toggleBookmark} from '../features/words/repository';
import NotFoundScreen from './NotFoundScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

export default function WordDetailScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const id = route.params?.id;
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
        const saved = await toggleBookmark(id.trim());
        setIsSaved(saved);
      }}
      isSaved={isSaved}
    />
  );
}
