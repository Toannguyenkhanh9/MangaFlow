import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {ChapterItem, getMangaCoverUrl, getMangaTitle, MangaItem} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';

export const FAVORITES_KEY = 'mangaflow.favorites';
export const HISTORY_KEY = 'mangaflow.history';
export const PROGRESS_KEY = 'mangaflow.readingProgress';
export const BOOKMARKS_KEY = 'mangaflow.bookmarks';
export const LIBRARY_ITEMS_KEY = 'mangaflow.libraryItems';

export type LibraryStatus = 'reading' | 'want' | 'completed' | 'paused' | 'favorite';
export type LibraryItem = {manga: MangaItem; language: string; title: string; coverUrl: string | null; status: LibraryStatus; createdAt: string; updatedAt: string};
export type FavoriteItem = {manga: MangaItem; language: string; title: string; coverUrl: string | null; savedAt: string; latestKnownChapterId?: string | null; latestKnownChapterTitle?: string | null; hasNewChapter?: boolean; newChapterTitle?: string | null};
export type HistoryItem = {manga: MangaItem; chapter: ChapterItem; language: string; mangaTitle: string; chapterTitle: string; coverUrl: string | null; pageCount: number; readAt: string};
export type ReadingProgressItem = {manga: MangaItem; chapter: ChapterItem; language: string; mangaTitle: string; chapterTitle: string; coverUrl: string | null; pageIndex: number; pageCount: number; updatedAt: string};
export type BookmarkItem = {id: string; manga: MangaItem; chapter: ChapterItem; language: string; mangaTitle: string; chapterTitle: string; coverUrl: string | null; pageIndex: number; pageCount: number; pageUri?: string; createdAt: string};
export type ReadingStats = {mangaCount: number; chapterCount: number; pageCount: number; bookmarkCount: number};

type LibraryContextValue = {
  loaded: boolean;
  libraryItems: LibraryItem[];
  favorites: FavoriteItem[];
  history: HistoryItem[];
  progress: ReadingProgressItem[];
  bookmarks: BookmarkItem[];
  continueReading: ReadingProgressItem[];
  readingStats: ReadingStats;
  isFavorite: (mangaId: string) => boolean;
  toggleFavorite: (manga: MangaItem, language: string) => Promise<void>;
  removeFavorite: (mangaId: string) => Promise<void>;
  updateFavoriteChapterInfo: (mangaId: string, info: Partial<FavoriteItem>) => Promise<void>;
  getLibraryStatus: (mangaId: string) => LibraryStatus | null;
  setMangaLibraryStatus: (manga: MangaItem, language: string, status: LibraryStatus) => Promise<void>;
  removeFromLibrary: (mangaId: string) => Promise<void>;
  getLibraryItemsByStatus: (status: LibraryStatus) => LibraryItem[];
  addHistory: (payload: {manga: MangaItem; chapter: ChapterItem; language: string; pageCount: number}) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateReadingProgress: (payload: {manga: MangaItem; chapter: ChapterItem; language: string; pageIndex: number; pageCount: number}) => Promise<void>;
  getProgressForChapter: (chapterId: string) => ReadingProgressItem | null;
  getProgressForManga: (mangaId: string) => ReadingProgressItem | null;
  toggleBookmark: (payload: {manga: MangaItem; chapter: ChapterItem; language: string; pageIndex: number; pageCount: number; pageUri?: string}) => Promise<void>;
  isBookmarked: (chapterId: string, pageIndex: number) => boolean;
  removeBookmark: (id: string) => Promise<void>;
  replaceAllLibraryData: (payload: {libraryItems?: LibraryItem[]; favorites?: FavoriteItem[]; history?: HistoryItem[]; progress?: ReadingProgressItem[]; bookmarks?: BookmarkItem[]}) => Promise<void>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);
function safeParse<T>(value: string | null, fallback: T): T { if (!value) return fallback; try { return JSON.parse(value) as T; } catch { return fallback; } }
function sortNewest<T extends {updatedAt?: string; readAt?: string; createdAt?: string; savedAt?: string}>(list: T[]) { return [...list].sort((a, b) => new Date(b.updatedAt || b.readAt || b.createdAt || b.savedAt || '').getTime() - new Date(a.updatedAt || a.readAt || a.createdAt || a.savedAt || '').getTime()); }
function makeLibraryItem(manga: MangaItem, language: string, status: LibraryStatus, old?: LibraryItem): LibraryItem { const now = new Date().toISOString(); return {manga, language, title: getMangaTitle(manga, language), coverUrl: getMangaCoverUrl(manga, 256), status, createdAt: old?.createdAt || now, updatedAt: now}; }

export function LibraryProvider({children}: {children: ReactNode}) {
  const [loaded, setLoaded] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<ReadingProgressItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => { async function load() {
    const [libraryRaw, favRaw, historyRaw, progressRaw, bookmarksRaw] = await Promise.all([AsyncStorage.getItem(LIBRARY_ITEMS_KEY), AsyncStorage.getItem(FAVORITES_KEY), AsyncStorage.getItem(HISTORY_KEY), AsyncStorage.getItem(PROGRESS_KEY), AsyncStorage.getItem(BOOKMARKS_KEY)]);
    setLibraryItems(safeParse<LibraryItem[]>(libraryRaw, []));
    setFavorites(safeParse<FavoriteItem[]>(favRaw, []));
    setHistory(safeParse<HistoryItem[]>(historyRaw, []));
    setProgress(safeParse<ReadingProgressItem[]>(progressRaw, []));
    setBookmarks(safeParse<BookmarkItem[]>(bookmarksRaw, []));
    setLoaded(true);
  } load().catch(() => setLoaded(true)); }, []);

  async function saveLibraryItems(next: LibraryItem[]) { setLibraryItems(next); await AsyncStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(next)); }
  async function saveFavorites(next: FavoriteItem[]) { setFavorites(next); await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); }
  async function saveHistory(next: HistoryItem[]) { setHistory(next); await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)); }
  async function saveProgress(next: ReadingProgressItem[]) { setProgress(next); await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); }
  async function saveBookmarks(next: BookmarkItem[]) { setBookmarks(next); await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)); }

  function isFavorite(mangaId: string) { return favorites.some(item => item.manga.id === mangaId); }
  function getLibraryStatus(mangaId: string) { return libraryItems.find(item => item.manga.id === mangaId)?.status || null; }
  function getLibraryItemsByStatus(status: LibraryStatus) { return sortNewest(libraryItems.filter(item => item.status === status)); }
  async function removeFavorite(mangaId: string) { await saveFavorites(favorites.filter(item => item.manga.id !== mangaId)); }
  async function removeFromLibrary(mangaId: string) { await saveLibraryItems(libraryItems.filter(item => item.manga.id !== mangaId)); }
  async function setMangaLibraryStatus(manga: MangaItem, language: string, status: LibraryStatus) {
    const old = libraryItems.find(item => item.manga.id === manga.id);
    const item = makeLibraryItem(manga, language, status, old);
    await saveLibraryItems([item, ...libraryItems.filter(oldItem => oldItem.manga.id !== manga.id)].slice(0, 500));
    if (status === 'favorite' && !isFavorite(manga.id)) {
      const fav: FavoriteItem = {manga, language, title: item.title, coverUrl: item.coverUrl, savedAt: new Date().toISOString(), latestKnownChapterId: null, latestKnownChapterTitle: null, hasNewChapter: false, newChapterTitle: null};
      await saveFavorites([fav, ...favorites].slice(0, 300));
    }
  }
  async function toggleFavorite(manga: MangaItem, language: string) {
    if (isFavorite(manga.id)) { await removeFavorite(manga.id); return; }
    const item: FavoriteItem = {manga, language, title: getMangaTitle(manga, language), coverUrl: getMangaCoverUrl(manga, 256), savedAt: new Date().toISOString(), latestKnownChapterId: null, latestKnownChapterTitle: null, hasNewChapter: false, newChapterTitle: null};
    await saveFavorites([item, ...favorites].slice(0, 300));
    await setMangaLibraryStatus(manga, language, 'favorite');
  }
  async function updateFavoriteChapterInfo(mangaId: string, info: Partial<FavoriteItem>) { await saveFavorites(favorites.map(item => item.manga.id === mangaId ? {...item, ...info} : item)); }
  async function addHistory(payload: {manga: MangaItem; chapter: ChapterItem; language: string; pageCount: number}) {
    const item: HistoryItem = {manga: payload.manga, chapter: payload.chapter, language: payload.language, mangaTitle: getMangaTitle(payload.manga, payload.language), chapterTitle: cleanChapterTitle(payload.chapter.attributes.chapter, payload.chapter.attributes.title), coverUrl: getMangaCoverUrl(payload.manga, 256), pageCount: payload.pageCount, readAt: new Date().toISOString()};
    await saveHistory([item, ...history.filter(old => old.chapter.id !== payload.chapter.id)].slice(0, 500));
  }
  async function clearHistory() { await saveHistory([]); }
  async function updateReadingProgress(payload: {manga: MangaItem; chapter: ChapterItem; language: string; pageIndex: number; pageCount: number}) {
    const item: ReadingProgressItem = {manga: payload.manga, chapter: payload.chapter, language: payload.language, mangaTitle: getMangaTitle(payload.manga, payload.language), chapterTitle: cleanChapterTitle(payload.chapter.attributes.chapter, payload.chapter.attributes.title), coverUrl: getMangaCoverUrl(payload.manga, 256), pageIndex: Math.max(0, payload.pageIndex), pageCount: Math.max(0, payload.pageCount), updatedAt: new Date().toISOString()};
    await saveProgress([item, ...progress.filter(old => old.chapter.id !== payload.chapter.id)].slice(0, 800));
    if (!getLibraryStatus(payload.manga.id)) await setMangaLibraryStatus(payload.manga, payload.language, 'reading');
  }
  function getProgressForChapter(chapterId: string) { return progress.find(item => item.chapter.id === chapterId) || null; }
  function getProgressForManga(mangaId: string) { return sortNewest(progress.filter(item => item.manga.id === mangaId))[0] || null; }
  function bookmarkId(chapterId: string, pageIndex: number) { return `${chapterId}_${pageIndex}`; }
  function isBookmarked(chapterId: string, pageIndex: number) { return bookmarks.some(item => item.id === bookmarkId(chapterId, pageIndex)); }
  async function removeBookmark(id: string) { await saveBookmarks(bookmarks.filter(item => item.id !== id)); }
  async function toggleBookmark(payload: {manga: MangaItem; chapter: ChapterItem; language: string; pageIndex: number; pageCount: number; pageUri?: string}) {
    const id = bookmarkId(payload.chapter.id, payload.pageIndex);
    if (bookmarks.some(item => item.id === id)) { await removeBookmark(id); return; }
    const item: BookmarkItem = {id, manga: payload.manga, chapter: payload.chapter, language: payload.language, mangaTitle: getMangaTitle(payload.manga, payload.language), chapterTitle: cleanChapterTitle(payload.chapter.attributes.chapter, payload.chapter.attributes.title), coverUrl: getMangaCoverUrl(payload.manga, 256), pageIndex: payload.pageIndex, pageCount: payload.pageCount, pageUri: payload.pageUri, createdAt: new Date().toISOString()};
    await saveBookmarks([item, ...bookmarks].slice(0, 800));
  }
  async function replaceAllLibraryData(payload: {libraryItems?: LibraryItem[]; favorites?: FavoriteItem[]; history?: HistoryItem[]; progress?: ReadingProgressItem[]; bookmarks?: BookmarkItem[]}) { await Promise.all([saveLibraryItems(payload.libraryItems || []), saveFavorites(payload.favorites || []), saveHistory(payload.history || []), saveProgress(payload.progress || []), saveBookmarks(payload.bookmarks || [])]); }

  const continueReading = useMemo(() => sortNewest(progress).slice(0, 12), [progress]);
  const readingStats = useMemo<ReadingStats>(() => ({mangaCount: new Set(progress.map(item => item.manga.id)).size, chapterCount: history.length, pageCount: progress.reduce((sum, item) => sum + Math.min(item.pageIndex + 1, item.pageCount || 0), 0), bookmarkCount: bookmarks.length}), [progress, history, bookmarks]);
  const value = useMemo(() => ({loaded, libraryItems, favorites, history, progress, bookmarks, continueReading, readingStats, isFavorite, toggleFavorite, removeFavorite, updateFavoriteChapterInfo, getLibraryStatus, setMangaLibraryStatus, removeFromLibrary, getLibraryItemsByStatus, addHistory, clearHistory, updateReadingProgress, getProgressForChapter, getProgressForManga, toggleBookmark, isBookmarked, removeBookmark, replaceAllLibraryData}), [loaded, libraryItems, favorites, history, progress, bookmarks, continueReading, readingStats]);
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() { const context = useContext(LibraryContext); if (!context) throw new Error('useLibrary must be used inside LibraryProvider'); return context; }
