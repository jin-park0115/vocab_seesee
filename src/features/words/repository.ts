import {getDB} from '../../db';
import type {Example, LanguageCode, Word} from './types';

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

export type WordFilterOptions = {
  langs?: LanguageCode[];
  categories?: string[];
};

export async function getWordsByFilters(
  filters: WordFilterOptions = {},
): Promise<Word[]> {
  const db = await getDB();
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.langs && filters.langs.length > 0) {
    const placeholders = filters.langs.map(() => '?').join(', ');
    clauses.push(`lang IN (${placeholders})`);
    params.push(...filters.langs);
  }

  if (filters.categories && filters.categories.length > 0) {
    const placeholders = filters.categories.map(() => '?').join(', ');
    clauses.push(`category IN (${placeholders})`);
    params.push(...filters.categories);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const [result] = await db.executeSql(
    `SELECT * FROM words ${whereClause};`,
    params,
  );

  const words: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows.item(index);
    words.push({
      id: row.id,
      lang: row.lang,
      word: row.word,
      reading: row.reading ?? null,
      meaningKo: row.meaning_ko,
      category: row.category,
    });
  }

  return words;
}

export async function getWordsByCategory(
  categoryKey: string,
  languages: LanguageCode[],
): Promise<Word[]> {
  const db = await getDB();
  const clauses: string[] = ['category = ?'];
  const params: string[] = [categoryKey];

  if (languages && languages.length > 0) {
    const placeholders = languages.map(() => '?').join(', ');
    clauses.push(`lang IN (${placeholders})`);
    params.push(...languages);
  }

  const [result] = await db.executeSql(
    `SELECT * FROM words WHERE ${clauses.join(' AND ')};`,
    params,
  );

  const words: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows.item(index);
    words.push({
      id: row.id,
      lang: row.lang,
      word: row.word,
      reading: row.reading ?? null,
      meaningKo: row.meaning_ko,
      category: row.category,
    });
  }

  return words;
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

export async function isBookmarked(wordId: string): Promise<boolean> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT word_id FROM bookmarks WHERE word_id = ? LIMIT 1;',
    [wordId],
  );

  return result.rows.length > 0;
}

export async function upsertBookmark(wordId: string): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'INSERT OR REPLACE INTO bookmarks (word_id, created_at, last_viewed_at) VALUES (?, ?, ?);',
    [wordId, new Date().toISOString(), null],
  );
}

export async function removeBookmark(wordId: string): Promise<void> {
  const db = await getDB();
  await db.executeSql('DELETE FROM bookmarks WHERE word_id = ?;', [wordId]);
}

export async function touchBookmarkLastViewed(wordId: string): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `UPDATE bookmarks
     SET last_viewed_at = ?
     WHERE word_id = ?;`,
    [new Date().toISOString(), wordId],
  );
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

export async function getBookmarksSorted(): Promise<Word[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    `SELECT w.*
     FROM bookmarks b
     JOIN words w ON w.id = b.word_id
     ORDER BY
       CASE WHEN b.last_viewed_at IS NULL THEN 0 ELSE 1 END,
       b.last_viewed_at ASC,
       b.created_at ASC;`,
  );

  const words: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows.item(index);
    words.push({
      id: row.id,
      lang: row.lang,
      word: row.word,
      reading: row.reading ?? null,
      meaningKo: row.meaning_ko,
      category: row.category,
    });
  }

  return words;
}
