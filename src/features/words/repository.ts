import {getDB} from '../../db';
import type {Example, Word} from './types';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getWordById(id: string): Promise<Word | null> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM words WHERE id = ? LIMIT 1;',
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows.item(0);
  return {
    id: row.id,
    lang: row.lang,
    word: row.word,
    reading: row.reading ?? null,
    meaningKo: row.meaning_ko,
    category: row.category,
  };
}

export async function getExamplesByWordId(wordId: string): Promise<Example[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM examples WHERE word_id = ?;',
    [wordId],
  );

  const examples: Example[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows.item(index);
    examples.push({
      id: row.id,
      wordId: row.word_id,
      sentenceNative: row.sentence_native,
      sentenceReading: row.sentence_reading ?? null,
      sentenceKo: row.sentence_ko,
      contextTag: row.context_tag,
    });
  }

  return examples;
}

export async function logExposure(
  wordId: string,
  source: string,
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'INSERT INTO exposures (date, word_id, source) VALUES (?, ?, ?);',
    [getTodayDateString(), wordId, source],
  );
}

export async function getTodaysWordIds(limit = 50): Promise<string[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    `SELECT word_id, MAX(rowid) as max_rowid
     FROM exposures
     WHERE date = ?
     GROUP BY word_id
     ORDER BY max_rowid DESC
     LIMIT ?;`,
    [getTodayDateString(), limit],
  );

  const ids: string[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    ids.push(result.rows.item(index).word_id);
  }

  return ids;
}

export async function getWordsByIds(ids: string[]): Promise<Word[]> {
  if (ids.length === 0) {
    return [];
  }

  const db = await getDB();
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await db.executeSql(
    `SELECT * FROM words WHERE id IN (${placeholders});`,
    ids,
  );

  const rows: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows.item(index);
    rows.push({
      id: row.id,
      lang: row.lang,
      word: row.word,
      reading: row.reading ?? null,
      meaningKo: row.meaning_ko,
      category: row.category,
    });
  }

  const orderMap = new Map(ids.map((id, index) => [id, index]));
  return rows.sort(
    (a, b) =>
      (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
  );
}

export async function getBookmarksWordIds(): Promise<string[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT word_id FROM bookmarks ORDER BY created_at DESC;',
  );

  const ids: string[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    ids.push(result.rows.item(index).word_id);
  }

  return ids;
}

export async function toggleBookmark(wordId: string): Promise<boolean> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT word_id FROM bookmarks WHERE word_id = ? LIMIT 1;',
    [wordId],
  );

  if (result.rows.length > 0) {
    await db.executeSql('DELETE FROM bookmarks WHERE word_id = ?;', [wordId]);
    return false;
  }

  await db.executeSql(
    'INSERT OR REPLACE INTO bookmarks (word_id, created_at) VALUES (?, ?);',
    [wordId, new Date().toISOString()],
  );
  return true;
}

export async function getBookmarksMap(): Promise<Set<string>> {
  const db = await getDB();
  const [result] = await db.executeSql('SELECT word_id FROM bookmarks;');

  const ids = new Set<string>();
  for (let index = 0; index < result.rows.length; index += 1) {
    ids.add(result.rows.item(index).word_id);
  }

  return ids;
}
