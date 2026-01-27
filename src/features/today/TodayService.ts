import type {LanguageCode} from '../words/types';
import {getSelectedLanguages} from '../settings/repository';
import {getWordsByFilters} from '../words/repository';
import {
  getAutoPoolWordIds,
  getInjectedWordIds,
  getLocalDateKey,
  getRecentAutoPoolWordIds,
  setAutoPoolWordIds,
  upsertInjectedItem,
} from './repository';

export type TodayFeed = {
  injectedIds: string[];
  autoIds: string[];
  allIds: string[];
};

export type InjectSource = 'widget' | 'lockscreen' | 'deeplink';

const AUTO_PER_LANGUAGE = 5;
const RECENT_DAYS_WINDOW = 7;

function buildLanguageKey(langs: LanguageCode[]): string {
  return [...langs].sort().join(',');
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pseudocode: stable shuffle with deterministic seed
// seed = hash(dateKey + languageKey)
// rng = seededRandom(seed)
// for i from array.length - 1 down to 1:
//   j = floor(rng() * (i + 1))
//   swap(array[i], array[j])
function stableShuffle<T>(items: T[], seedInput: string): T[] {
  const result = [...items];
  const seed = hashSeed(seedInput);
  const rng = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

async function pickAutoPoolForLanguage(
  lang: LanguageCode,
  perLang: number,
  recentIds: Set<string>,
  seedInput: string,
): Promise<string[]> {
  const words = await getWordsByFilters({langs: [lang]});
  if (words.length === 0) {
    return [];
  }

  const filtered = words.filter(word => !recentIds.has(word.id));
  const candidates = filtered.length >= perLang ? filtered : words;
  const shuffled = stableShuffle(candidates, seedInput);
  return shuffled.slice(0, perLang).map(word => word.id);
}

export async function ensureAutoPoolForToday(): Promise<string[]> {
  const dateKey = getLocalDateKey();
  const langs = await getSelectedLanguages();
  const languageKey = buildLanguageKey(langs);

  const existing = await getAutoPoolWordIds(dateKey, languageKey);
  if (existing) {
    return existing;
  }

  const recentIds = new Set(await getRecentAutoPoolWordIds(RECENT_DAYS_WINDOW));
  const perLang = AUTO_PER_LANGUAGE;
  const sampled: string[] = [];

  for (const lang of langs) {
    const seedInput = `${dateKey}:${languageKey}`;
    const picks = await pickAutoPoolForLanguage(
      lang,
      perLang,
      recentIds,
      seedInput,
    );
    sampled.push(...picks);
  }

  const finalIds = stableShuffle(sampled, `${dateKey}:${languageKey}`);
  await setAutoPoolWordIds(dateKey, languageKey, finalIds);
  return finalIds;
}

export async function injectTodayWord(
  wordId: string,
  source: InjectSource,
): Promise<void> {
  const dateKey = getLocalDateKey();
  await upsertInjectedItem(dateKey, wordId, source, new Date().toISOString());
}

export async function getTodayFeed(): Promise<TodayFeed> {
  const dateKey = getLocalDateKey();
  const [injectedIds, autoIds] = await Promise.all([
    getInjectedWordIds(dateKey),
    ensureAutoPoolForToday(),
  ]);

  const injectedSet = new Set(injectedIds);
  const dedupedAuto = autoIds.filter(id => !injectedSet.has(id));
  const allIds = [...injectedIds, ...dedupedAuto];

  return {injectedIds, autoIds, allIds};
}
