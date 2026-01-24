import {getDB} from '../../db';
import type {Example, Word} from './types';

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
      sentenceKo: row.sentence_ko,
      contextTag: row.context_tag,
    });
  }

  return examples;
}
