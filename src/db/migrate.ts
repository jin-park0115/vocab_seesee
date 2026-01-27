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
    sentenceReading: null,
    sentenceKo: '호숫가의 고요한 아침.',
    contextTag: 'daily',
  },
  {
    id: 'ex_ja_1',
    wordId: 'ja_1',
    sentenceNative: 'おはよう、今日はいい天気だね。',
    sentenceReading: 'Ohayou, kyou wa ii tenki da ne.',
    sentenceKo: '좋은 아침, 오늘은 날씨가 좋네.',
    contextTag: 'daily',
  },
  {
    id: 'ex_zh_3',
    wordId: 'zh_3',
    sentenceNative: '我在机场等你。',
    sentenceReading: 'Wo zai ji chang deng ni.',
    sentenceKo: '나는 공항에서 너를 기다리고 있어.',
    contextTag: 'travel',
  },
];

export async function migrateAndSeed(): Promise<void> {
  const db = await getDB();

  const [versionResult] = await db.executeSql('PRAGMA user_version;');
  const currentVersion = versionResult.rows.item(0).user_version as number;

  if (currentVersion < 1) {
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
        sentence_reading TEXT,
        sentence_ko TEXT,
        context_tag TEXT
      );`,
    );

    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS bookmarks (
        word_id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        last_viewed_at TEXT NULL
      );`,
    );

    for (const word of WORDS) {
      await db.executeSql(
        `INSERT OR IGNORE INTO words (id, lang, word, reading, meaning_ko, category)
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
        `INSERT OR IGNORE INTO examples (id, word_id, sentence_native, sentence_reading, sentence_ko, context_tag)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          example.id,
          example.wordId,
          example.sentenceNative,
          example.sentenceReading,
          example.sentenceKo,
          example.contextTag,
        ],
      );
    }

    await db.executeSql('PRAGMA user_version = 1;');
  }

  if (currentVersion < 2) {
    const [examplesInfo] = await db.executeSql(
      "PRAGMA table_info('examples');",
    );
    let hasReadingColumn = false;
    for (let index = 0; index < examplesInfo.rows.length; index += 1) {
      const row = examplesInfo.rows.item(index);
      if (row.name === 'sentence_reading') {
        hasReadingColumn = true;
        break;
      }
    }
    if (!hasReadingColumn) {
      await db.executeSql(
        'ALTER TABLE examples ADD COLUMN sentence_reading TEXT;',
      );
    }

    for (const example of EXAMPLES) {
      if (example.sentenceReading) {
        await db.executeSql(
          `UPDATE examples
           SET sentence_reading = ?
           WHERE id = ? AND (sentence_reading IS NULL OR sentence_reading = '');`,
          [example.sentenceReading, example.id],
        );
      }
    }

    await db.executeSql('PRAGMA user_version = 2;');
  }

  if (currentVersion < 3) {
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS exposures (
        date TEXT,
        word_id TEXT,
        source TEXT
      );`,
    );

    await db.executeSql('PRAGMA user_version = 3;');
  }

  if (currentVersion < 4) {
    const [bookmarkInfo] = await db.executeSql(
      "PRAGMA table_info('bookmarks');",
    );
    let hasCreatedAt = false;
    let hasLastViewedAt = false;
    for (let index = 0; index < bookmarkInfo.rows.length; index += 1) {
      const row = bookmarkInfo.rows.item(index);
      if (row.name === 'created_at') {
        hasCreatedAt = true;
      }
      if (row.name === 'last_viewed_at') {
        hasLastViewedAt = true;
      }
    }

    if (!hasCreatedAt) {
      await db.executeSql('ALTER TABLE bookmarks ADD COLUMN created_at TEXT;');
    }
    if (!hasLastViewedAt) {
      await db.executeSql(
        'ALTER TABLE bookmarks ADD COLUMN last_viewed_at TEXT;',
      );
    }

    await db.executeSql(
      'UPDATE bookmarks SET created_at = ? WHERE created_at IS NULL;',
      [new Date().toISOString()],
    );

    await db.executeSql('PRAGMA user_version = 4;');
  }

  if (currentVersion < 5) {
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );`,
    );

    await db.executeSql(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);',
      ['selected_languages', 'en'],
    );
    await db.executeSql(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);',
      ['selected_categories', ''],
    );

    await db.executeSql('PRAGMA user_version = 5;');
  }

  if (currentVersion < 6) {
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS today_auto_pool (
        date_key TEXT NOT NULL,
        language_key TEXT NOT NULL,
        word_ids TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (date_key, language_key)
      );`,
    );

    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS today_injected_items (
        date_key TEXT NOT NULL,
        word_id TEXT NOT NULL,
        source TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        PRIMARY KEY (date_key, word_id)
      );`,
    );

    await db.executeSql('PRAGMA user_version = 6;');
  }
}
