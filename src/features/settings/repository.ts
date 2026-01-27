import {getDB} from '../../db';
import type {LanguageCode} from '../words/types';

export type Lang = LanguageCode;

const LANGUAGE_DEFAULTS: LanguageCode[] = ['en'];
const LANGUAGE_ALLOWED: LanguageCode[] = ['en', 'ja', 'zh'];

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

async function getSettingValue(key: string): Promise<string | null> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT value FROM settings WHERE key = ? LIMIT 1;',
    [key],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return (result.rows.item(0).value as string | null) ?? null;
}

async function setSettingValue(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
    [key, value],
  );
}

export async function getSelectedLanguages(): Promise<Lang[]> {
  const raw = await getSettingValue('selected_languages');
  if (!raw) {
    return LANGUAGE_DEFAULTS;
  }

  const parsed = parseCsv(raw).filter((lang): lang is LanguageCode =>
    LANGUAGE_ALLOWED.includes(lang as LanguageCode),
  );
  return parsed.length > 0 ? parsed : LANGUAGE_DEFAULTS;
}

export async function setSelectedLanguages(langs: Lang[]): Promise<void> {
  const cleaned = unique(
    langs.filter((lang): lang is LanguageCode =>
      LANGUAGE_ALLOWED.includes(lang as LanguageCode),
    ),
  );
  const finalLangs = cleaned.length > 0 ? cleaned : LANGUAGE_DEFAULTS;
  await setSettingValue('selected_languages', finalLangs.join(','));
}

export async function getSelectedLanguagesOrAll(): Promise<Lang[]> {
  const raw = await getSettingValue('selected_languages');
  if (!raw) {
    return [...LANGUAGE_ALLOWED];
  }

  const parsed = parseCsv(raw).filter((lang): lang is LanguageCode =>
    LANGUAGE_ALLOWED.includes(lang as LanguageCode),
  );
  return parsed.length > 0 ? parsed : [...LANGUAGE_ALLOWED];
}

export async function getSelectedCategories(): Promise<string[] | null> {
  const raw = await getSettingValue('selected_categories');
  if (!raw) {
    return null;
  }

  const parsed = parseCsv(raw);
  return parsed.length > 0 ? parsed : null;
}

export async function setSelectedCategories(cats: string[]): Promise<void> {
  const cleaned = unique(cats.map(cat => cat.trim()).filter(Boolean));
  await setSettingValue('selected_categories', cleaned.join(','));
}
