import RNFS from 'react-native-fs';

import type {Word} from '../features/words/types';
import {getWordsByIds} from '../features/words/repository';
import {getTodayFeed} from '../features/today/TodayService';
import {getAppGroupPath, reloadAllTimelines} from '../native/WidgetBridge';

// Update to the App Group id used in the iOS targets.
const APP_GROUP_ID = 'group.com.yourcompany.vocab';
const WIDGET_SNAPSHOT_FILENAME = 'widget_word.json';

async function getWidgetSnapshotPath(): Promise<string> {
  const appGroupPath = await getAppGroupPath(APP_GROUP_ID);
  const normalizedPath = appGroupPath.endsWith('/')
    ? appGroupPath.slice(0, -1)
    : appGroupPath;
  return `${normalizedPath}/${WIDGET_SNAPSHOT_FILENAME}`;
}

export async function writeWidgetSnapshot(word: Word): Promise<void> {
  const filePath = await getWidgetSnapshotPath();
  const payload = {
    id: word.id,
    lang: word.lang,
    word: word.word,
    meaning_ko: word.meaningKo,
  };

  await RNFS.writeFile(filePath, JSON.stringify(payload), 'utf8');
  reloadAllTimelines();
}

export async function pickNextWidgetWord(): Promise<Word | null> {
  const todayFeed = await getTodayFeed();
  const words = await getWordsByIds(todayFeed.allIds);

  if (words.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * words.length);
  return words[index] ?? null;
}
