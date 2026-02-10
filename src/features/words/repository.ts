import {getDB} from '../../db';
import type {Example, LanguageCode, Word} from './types';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

type WordsSchema = {
  hasCategory: boolean;
  hasCategories: boolean;
  hasWord: boolean;
  hasText: boolean;
  hasMeaningKo: boolean;
  hasMeaning: boolean;
  hasLang: boolean;
  hasLanguage: boolean;
  hasReading: boolean;
  hasPronunciation: boolean;
};

let wordsSchemaCache: WordsSchema | null = null;

async function getWordsSchema(): Promise<WordsSchema> {
  if (wordsSchemaCache) {
    return wordsSchemaCache;
  }
  const db = await getDB();
  const [result] = await db.executeSql("PRAGMA table_info('words');");
  const columns = new Set<string>();
  for (let index = 0; index < result.rows.length; index += 1) {
    columns.add(result.rows.item(index).name);
  }
  wordsSchemaCache = {
    hasCategory: columns.has('category'),
    hasCategories: columns.has('categories'),
    hasWord: columns.has('word'),
    hasText: columns.has('text'),
    hasMeaningKo: columns.has('meaning_ko'),
    hasMeaning: columns.has('meaning'),
    hasLang: columns.has('lang'),
    hasLanguage: columns.has('language'),
    hasReading: columns.has('reading'),
    hasPronunciation: columns.has('pronunciation'),
  };
  return wordsSchemaCache;
}

function parseCategories(raw: unknown): string[] {
  if (typeof raw !== 'string') {
    return [];
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return [];
  }
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return trimmed.split(',').map(value => value.trim()).filter(Boolean);
  }
}

function normalizeWordRow(row: any): Word {
  const category =
    row.category ??
    parseCategories(row.categories)[0] ??
    row.vibe ??
    '';
  return {
    id: row.id,
    lang: row.lang ?? row.language ?? 'en',
    word: row.word ?? row.text ?? '',
    reading: (row.reading ?? row.pronunciation ?? null) as string | null,
    meaningKo: row.meaning_ko ?? row.meaning ?? '',
    category,
  };
}

async function getWordsSelectColumns(): Promise<{
  columns: string;
  langExpr: string;
  categoryExpr: string | null;
  hasCategories: boolean;
  hasCategory: boolean;
}> {
  const schema = await getWordsSchema();
  const langExpr = schema.hasLang
    ? 'lang'
    : schema.hasLanguage
      ? 'language'
      : "'en'";
  const wordExpr = schema.hasWord ? 'word' : schema.hasText ? 'text' : "''";
  const readingExpr = schema.hasReading
    ? 'reading'
    : schema.hasPronunciation
      ? 'pronunciation'
      : 'NULL';
  const meaningExpr = schema.hasMeaningKo
    ? 'meaning_ko'
    : schema.hasMeaning
      ? 'meaning'
      : "''";
  const categoryExpr = schema.hasCategory
    ? 'category'
    : schema.hasCategories
      ? 'categories'
      : null;
  const columns = [
    'id',
    `${langExpr} as lang`,
    `${wordExpr} as word`,
    `${readingExpr} as reading`,
    `${meaningExpr} as meaning_ko`,
    categoryExpr ? `${categoryExpr} as category` : "'' as category",
    schema.hasCategories ? 'categories' : "'' as categories",
    schema.hasLanguage ? 'language' : "'' as language",
    schema.hasText ? 'text' : "'' as text",
    schema.hasMeaning ? 'meaning' : "'' as meaning",
    schema.hasPronunciation ? 'pronunciation' : "'' as pronunciation",
    schema.hasCategory ? 'category' : "'' as category_raw",
    schema.hasWord ? 'word' : "'' as word_raw",
    schema.hasReading ? 'reading' : "'' as reading_raw",
    schema.hasMeaningKo ? 'meaning_ko' : "'' as meaning_ko_raw",
    schema.hasLang ? 'lang' : "'' as lang_raw",
  ].join(', ');
  return {columns, langExpr, categoryExpr, hasCategories: schema.hasCategories, hasCategory: schema.hasCategory};
}

export async function getWordById(id: string): Promise<Word | null> {
  const db = await getDB();
  const {columns} = await getWordsSelectColumns();
  const [result] = await db.executeSql(
    `SELECT ${columns} FROM words WHERE id = ? LIMIT 1;`,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return normalizeWordRow(result.rows.item(0));
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
  const {columns} = await getWordsSelectColumns();
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await db.executeSql(
    `SELECT ${columns} FROM words WHERE id IN (${placeholders});`,
    ids,
  );

  const rows: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    rows.push(normalizeWordRow(result.rows.item(index)));
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
  const {columns, langExpr, categoryExpr, hasCategories, hasCategory} =
    await getWordsSelectColumns();
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.langs && filters.langs.length > 0) {
    const placeholders = filters.langs.map(() => '?').join(', ');
    clauses.push(`${langExpr} IN (${placeholders})`);
    params.push(...filters.langs);
  }

  if (filters.categories && filters.categories.length > 0) {
    if (hasCategory && categoryExpr) {
      const placeholders = filters.categories.map(() => '?').join(', ');
      clauses.push(`${categoryExpr} IN (${placeholders})`);
      params.push(...filters.categories);
    } else if (hasCategories) {
      const likeClauses = filters.categories.map(() => `categories LIKE ?`);
      clauses.push(`(${likeClauses.join(' OR ')})`);
      params.push(
        ...filters.categories.map(value => `%\"${value}\"%`),
      );
    }
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const [result] = await db.executeSql(
    `SELECT ${columns} FROM words ${whereClause};`,
    params,
  );

  const words: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    words.push(normalizeWordRow(result.rows.item(index)));
  }

  return words;
}

export async function getWordsByCategory(
  categoryKey: string,
  languages: LanguageCode[],
): Promise<Word[]> {
  const db = await getDB();
  const {columns, langExpr, categoryExpr, hasCategories, hasCategory} =
    await getWordsSelectColumns();
  const clauses: string[] = [];
  const params: string[] = [];

  if (hasCategory && categoryExpr) {
    clauses.push(`${categoryExpr} = ?`);
    params.push(categoryKey);
  } else if (hasCategories) {
    clauses.push('categories LIKE ?');
    params.push(`%\"${categoryKey}\"%`);
  }

  if (languages && languages.length > 0) {
    const placeholders = languages.map(() => '?').join(', ');
    clauses.push(`${langExpr} IN (${placeholders})`);
    params.push(...languages);
  }

  const [result] = await db.executeSql(
    `SELECT ${columns} FROM words ${
      clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
    };`,
    params,
  );

  const words: Word[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    words.push(normalizeWordRow(result.rows.item(index)));
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
