import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'vocab.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabase({name: DB_NAME, location: 'default'});
  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (!dbInstance) {
    return;
  }

  await dbInstance.close();
  dbInstance = null;
}
