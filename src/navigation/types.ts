import type {NavigatorScreenParams} from '@react-navigation/native';
import type {ChapterItem, MangaItem} from '../api/mangadex';

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Offline: undefined;
  History: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  MangaDetail: {
    manga: MangaItem;
    language: string;
  };
  Reader: {
    manga: MangaItem;
    chapter: ChapterItem;
    title: string;
    language: string;
    initialPageIndex?: number;
    offlinePages?: string[];
    offlineMode?: boolean;
  };
};
