import AsyncStorage from '@react-native-async-storage/async-storage';
import {Share} from 'react-native';
import {
  BOOKMARKS_KEY,
  FAVORITES_KEY,
  LIBRARY_ITEMS_KEY,
  HISTORY_KEY,
  PROGRESS_KEY,
} from '../context/LibraryContext';
import {READER_SETTINGS_KEY} from '../context/AppPreferencesContext';
import {OFFLINE_KEY} from './downloads';

const BACKUP_VERSION = 2;

const KEYS = [
  'mangaflow.appLanguage',
  'mangaflow.contentLanguage',
  'mangaflow.language',
  'mangaflow.theme',
  READER_SETTINGS_KEY,
  LIBRARY_ITEMS_KEY,
  FAVORITES_KEY,
  HISTORY_KEY,
  PROGRESS_KEY,
  BOOKMARKS_KEY,
  OFFLINE_KEY,
];

export type MangaFlowBackup = {
  version: number;
  createdAt: string;
  data: Record<string, string | null>;
};

export async function createBackupJson() {
  const pairs = await AsyncStorage.multiGet(KEYS);
  const data: Record<string, string | null> = {};

  pairs.forEach(([key, value]) => {
    data[key] = value;
  });

  const backup: MangaFlowBackup = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    data,
  };

  return JSON.stringify(backup);
}

export async function shareBackup() {
  const json = await createBackupJson();

  await Share.share({
    title: 'MangaFlow Backup',
    message: json,
  });

  return json;
}

export async function restoreBackupJson(json: string) {
  const parsed = JSON.parse(json) as MangaFlowBackup;

  if (!parsed || typeof parsed !== 'object' || !parsed.data) {
    throw new Error('Invalid backup');
  }

  const pairs: Array<[string, string]> = [];

  Object.entries(parsed.data).forEach(([key, value]) => {
    if (KEYS.includes(key) && typeof value === 'string') {
      pairs.push([key, value]);
    }
  });

  await AsyncStorage.multiSet(pairs);
}
