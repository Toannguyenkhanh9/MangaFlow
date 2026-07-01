import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getMangaCoverUrl,
  getMangaTitle,
  MangaItem,
  ChapterItem,
} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';

const FAVORITES_KEY = 'mangaflow.favorites';
const HISTORY_KEY = 'mangaflow.history';

export type FavoriteItem = {
  manga: MangaItem;
  language: string;
  title: string;
  coverUrl: string | null;
  savedAt: string;
};

export type HistoryItem = {
  manga: MangaItem;
  chapter: ChapterItem;
  language: string;
  mangaTitle: string;
  chapterTitle: string;
  coverUrl: string | null;
  pageCount: number;
  readAt: string;
};

type LibraryContextValue = {
  loaded: boolean;
  favorites: FavoriteItem[];
  history: HistoryItem[];
  isFavorite: (mangaId: string) => boolean;
  toggleFavorite: (manga: MangaItem, language: string) => Promise<void>;
  removeFavorite: (mangaId: string) => Promise<void>;
  addHistory: (payload: {
    manga: MangaItem;
    chapter: ChapterItem;
    language: string;
    pageCount: number;
  }) => Promise<void>;
  clearHistory: () => Promise<void>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function LibraryProvider({children}: {children: ReactNode}) {
  const [loaded, setLoaded] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function load() {
      const [favRaw, historyRaw] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);

      setFavorites(safeParse<FavoriteItem[]>(favRaw, []));
      setHistory(safeParse<HistoryItem[]>(historyRaw, []));
      setLoaded(true);
    }

    load().catch(() => setLoaded(true));
  }, []);

  async function saveFavorites(next: FavoriteItem[]) {
    setFavorites(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }

  async function saveHistory(next: HistoryItem[]) {
    setHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function isFavorite(mangaId: string) {
    return favorites.some(item => item.manga.id === mangaId);
  }

  async function removeFavorite(mangaId: string) {
    const next = favorites.filter(item => item.manga.id !== mangaId);
    await saveFavorites(next);
  }

  async function toggleFavorite(manga: MangaItem, language: string) {
    if (isFavorite(manga.id)) {
      await removeFavorite(manga.id);
      return;
    }

    const item: FavoriteItem = {
      manga,
      language,
      title: getMangaTitle(manga, language),
      coverUrl: getMangaCoverUrl(manga, 256),
      savedAt: new Date().toISOString(),
    };

    await saveFavorites([item, ...favorites].slice(0, 200));
  }

  async function addHistory(payload: {
    manga: MangaItem;
    chapter: ChapterItem;
    language: string;
    pageCount: number;
  }) {
    const item: HistoryItem = {
      manga: payload.manga,
      chapter: payload.chapter,
      language: payload.language,
      mangaTitle: getMangaTitle(payload.manga, payload.language),
      chapterTitle: cleanChapterTitle(
        payload.chapter.attributes.chapter,
        payload.chapter.attributes.title,
      ),
      coverUrl: getMangaCoverUrl(payload.manga, 256),
      pageCount: payload.pageCount,
      readAt: new Date().toISOString(),
    };

    const withoutDuplicate = history.filter(
      old => old.chapter.id !== payload.chapter.id,
    );

    await saveHistory([item, ...withoutDuplicate].slice(0, 300));
  }

  async function clearHistory() {
    await saveHistory([]);
  }

  const value = useMemo(
    () => ({
      loaded,
      favorites,
      history,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      addHistory,
      clearHistory,
    }),
    [loaded, favorites, history],
  );

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error('useLibrary must be used inside LibraryProvider');
  }

  return context;
}
