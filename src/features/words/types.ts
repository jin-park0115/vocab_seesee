export type LanguageCode = 'en' | 'ja' | 'zh';

export type Word = {
  id: string;
  lang: LanguageCode;
  word: string;
  reading: string | null;
  meaningKo: string;
  category: string;
};

export type Example = {
  id: string;
  wordId: string;
  sentenceNative: string;
  sentenceKo: string;
  contextTag: string;
};
