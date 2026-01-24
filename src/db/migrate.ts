import {getDB} from './index';

const WORDS = [
  {
    id: 'en_1',
    lang: 'en',
    word: 'serene',
    reading: null,
    meaningKo: '고요한',
    category: 'emotion',
  },
  {
    id: 'en_2',
    lang: 'en',
    word: 'wander',
    reading: null,
    meaningKo: '거닐다',
    category: 'travel',
  },
  {
    id: 'ja_1',
    lang: 'ja',
    word: 'おはよう',
    reading: 'ohayou',
    meaningKo: '좋은 아침',
    category: 'daily',
  },
  {
    id: 'ja_2',
    lang: 'ja',
    word: '旅',
    reading: 'たび',
    meaningKo: '여행',
    category: 'travel',
  },
  {
    id: 'zh_1',
    lang: 'zh',
    word: '你好',
    reading: 'ni hao',
    meaningKo: '안녕',
    category: 'daily',
  },
  {
    id: 'zh_2',
    lang: 'zh',
    word: '慢慢来',
    reading: 'man man lai',
    meaningKo: '천천히',
    category: 'emotion',
  },
  {
    id: 'zh_3',
    lang: 'zh',
    word: '机场',
    reading: 'ji chang',
    meaningKo: '공항',
    category: 'travel',
  },
  {
    id: 'en_3',
    lang: 'en',
    word: 'cozy',
    reading: null,
    meaningKo: '아늑한',
    category: 'daily',
  },
  {
    id: 'ja_3',
    lang: 'ja',
    word: '好き',
    reading: 'すき',
    meaningKo: '좋아함',
    category: 'emotion',
  },
  {
    id: 'zh_4',
    lang: 'zh',
    word: '味道',
    reading: 'wei dao',
    meaningKo: '맛/향',
    category: 'food',
  },
];

const EXAMPLES = [
  {
    id: 'ex_en_1',
    wordId: 'en_1',
    sentenceNative: 'A serene morning by the lake.',
    sentenceKo: '호숫가의 고요한 아침.',
    contextTag: 'daily',
  },
  {
    id: 'ex_ja_1',
    wordId: 'ja_1',
    sentenceNative: 'おはよう、今日はいい天気だね。',
    sentenceKo: '좋은 아침, 오늘은 날씨가 좋네.',
    contextTag: 'daily',
  },
  {
    id: 'ex_zh_3',
    wordId: 'zh_3',
    sentenceNative: '我在机场等你。',
    sentenceKo: '나는 공항에서 너를 기다리고 있어.',
    contextTag: 'travel',
  },
];

export async function migrateAndSeed(): Promise<void> {
  const db = await getDB();

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY,
      lang TEXT,
      word TEXT,
      reading TEXT NULL,
      meaning_ko TEXT,
      category TEXT
    );`,
  );

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS examples (
      id TEXT PRIMARY KEY,
      word_id TEXT,
      sentence_native TEXT,
      sentence_ko TEXT,
      context_tag TEXT
    );`,
  );

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS bookmarks (
      word_id TEXT PRIMARY KEY,
      created_at TEXT
    );`,
  );

  const [countResult] = await db.executeSql(
    'SELECT COUNT(*) as count FROM words;',
  );
  const count = countResult.rows.item(0).count as number;

  if (count > 0) {
    return;
  }

  for (const word of WORDS) {
    await db.executeSql(
      `INSERT INTO words (id, lang, word, reading, meaning_ko, category)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        word.id,
        word.lang,
        word.word,
        word.reading,
        word.meaningKo,
        word.category,
      ],
    );
  }

  for (const example of EXAMPLES) {
    await db.executeSql(
      `INSERT INTO examples (id, word_id, sentence_native, sentence_ko, context_tag)
       VALUES (?, ?, ?, ?, ?);`,
      [
        example.id,
        example.wordId,
        example.sentenceNative,
        example.sentenceKo,
        example.contextTag,
      ],
    );
  }
}
