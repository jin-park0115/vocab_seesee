import {getDB} from '../../db';

export function getLocalDateKey(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export async function getAutoPoolWordIds(
  dateKey: string,
  languageKey: string,
): Promise<string[] | null> {
  const db = await getDB();
  const [result] = await db.executeSql(
    `SELECT word_ids
     FROM today_auto_pool
     WHERE date_key = ? AND language_key = ?
     LIMIT 1;`,
    [dateKey, languageKey],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const raw = result.rows.item(0).word_ids as string | null;
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setAutoPoolWordIds(
  dateKey: string,
  languageKey: string,
  wordIds: string[],
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `INSERT OR REPLACE INTO today_auto_pool
      (date_key, language_key, word_ids, created_at)
     VALUES (?, ?, ?, ?);`,
    [dateKey, languageKey, JSON.stringify(wordIds), new Date().toISOString()],
  );
}

export async function getRecentAutoPoolWordIds(
  days: number,
): Promise<string[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    `SELECT word_ids
     FROM today_auto_pool
     ORDER BY date_key DESC
     LIMIT ?;`,
    [Math.max(days, 0)],
  );

  const ids: string[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    const raw = result.rows.item(index).word_ids as string | null;
    if (!raw) {
      continue;
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        ids.push(...parsed);
      }
    } catch {
      // ignore invalid json
    }
  }

  return ids;
}

export async function upsertInjectedItem(
  dateKey: string,
  wordId: string,
  source: string,
  seenAtIso: string,
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `INSERT INTO today_injected_items
      (date_key, word_id, source, last_seen_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date_key, word_id)
     DO UPDATE SET last_seen_at = excluded.last_seen_at,
                   source = excluded.source;`,
    [dateKey, wordId, source, seenAtIso],
  );
}

export async function getInjectedWordIds(
  dateKey: string,
  limit = 200,
): Promise<string[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    `SELECT word_id
     FROM today_injected_items
     WHERE date_key = ?
     ORDER BY last_seen_at DESC
     LIMIT ?;`,
    [dateKey, limit],
  );

  const ids: string[] = [];
  for (let index = 0; index < result.rows.length; index += 1) {
    ids.push(result.rows.item(index).word_id);
  }

  return ids;
}
