import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import type {ChapterItem, MangaItem} from '../api/mangadex';
import {
  getChapterPages,
  getMangaCoverUrl,
  getMangaTitle,
} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';

export const OFFLINE_KEY = 'mangaflow.offlineChapters';

export type OfflineChapter = {
  id: string;
  manga: MangaItem;
  chapter: ChapterItem;
  mangaId: string;
  mangaTitle: string;
  coverUrl: string | null;
  chapterId: string;
  chapterTitle: string;
  language: string;
  pageCount: number;
  pages: string[];
  createdAt: string;
  totalBytes: number;
};

function getOfflineRoot() {
  return `${RNFS.DocumentDirectoryPath}/mangaflow_offline`;
}

function getChapterFolder(chapterId: string) {
  return `${getOfflineRoot()}/${chapterId}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readOfflineList() {
  const raw = await AsyncStorage.getItem(OFFLINE_KEY);
  return safeParse<OfflineChapter[]>(raw, []);
}

async function saveOfflineList(list: OfflineChapter[]) {
  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
}

export async function listOfflineChapters() {
  return readOfflineList();
}

export async function isChapterDownloaded(chapterId: string) {
  const list = await readOfflineList();
  return list.some(item => item.chapterId === chapterId);
}

export async function downloadChapterOffline(params: {
  manga: MangaItem;
  chapter: ChapterItem;
  language: string;
  dataSaver?: boolean;
  onProgress?: (progress: {
    current: number;
    total: number;
    percent: number;
  }) => void;
}) {
  const {
    manga,
    chapter,
    language,
    dataSaver = true,
    onProgress,
  } = params;

  const chapterId = chapter.id;
  const pages = await getChapterPages(chapterId, dataSaver);

  const root = getOfflineRoot();
  const folder = getChapterFolder(chapterId);

  await RNFS.mkdir(root);
  await RNFS.mkdir(folder);

  const localPages: string[] = [];
  let totalBytes = 0;

  for (let index = 0; index < pages.length; index += 1) {
    const remoteUrl = pages[index];

    const ext =
      remoteUrl.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';

    const localPath = `${folder}/page_${String(index + 1).padStart(
      3,
      '0',
    )}.${ext}`;

    const result = await RNFS.downloadFile({
      fromUrl: remoteUrl,
      toFile: localPath,
    }).promise;

    if (result.statusCode < 200 || result.statusCode >= 300) {
      throw new Error(`Download failed: ${result.statusCode}`);
    }

    const stat = await RNFS.stat(localPath);
    totalBytes += Number(stat.size || 0);

    localPages.push(`file://${localPath}`);

    onProgress?.({
      current: index + 1,
      total: pages.length,
      percent: Math.round(((index + 1) / pages.length) * 100),
    });
  }

  const item: OfflineChapter = {
    id: chapterId,
    manga,
    chapter,
    mangaId: manga.id,
    mangaTitle: getMangaTitle(manga, language),
    coverUrl: getMangaCoverUrl(manga, 256),
    chapterId,
    chapterTitle: cleanChapterTitle(
      chapter.attributes.chapter,
      chapter.attributes.title,
    ),
    language,
    pageCount: localPages.length,
    pages: localPages,
    createdAt: new Date().toISOString(),
    totalBytes,
  };

  const list = await readOfflineList();
  const next = [
    item,
    ...list.filter(old => old.chapterId !== chapterId),
  ];

  await saveOfflineList(next);

  return item;
}

export async function deleteOfflineChapter(chapterId: string) {
  const list = await readOfflineList();
  const folder = getChapterFolder(chapterId);

  if (await RNFS.exists(folder)) {
    await RNFS.unlink(folder);
  }

  const next = list.filter(item => item.chapterId !== chapterId);
  await saveOfflineList(next);
}

export async function clearAllOfflineChapters() {
  const root = getOfflineRoot();

  if (await RNFS.exists(root)) {
    await RNFS.unlink(root);
  }

  await saveOfflineList([]);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
