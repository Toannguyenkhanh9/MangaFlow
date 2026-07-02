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
  AppColors,
  getThemeColors,
  ThemeMode,
} from '../theme/themes';
import {
  AppLanguage,
  t as translate,
  TranslationKey,
} from '../i18n/translations';

const APP_LANGUAGE_KEY = 'mangaflow.appLanguage';
const CONTENT_LANGUAGE_KEY = 'mangaflow.contentLanguage';
const OLD_LANGUAGE_KEY = 'mangaflow.language';
const THEME_KEY = 'mangaflow.theme';
const REMOVE_ADS_KEY = 'mangaflow.removeAds';
export const READER_SETTINGS_KEY = 'mangaflow.readerSettings';

export type ReaderDirection = 'vertical' | 'horizontal';
export type ReaderTheme = 'black' | 'white' | 'sepia' | 'gray';

export type ReaderSettings = {
  direction: ReaderDirection;
  dataSaverDefault: boolean;
  pageGap: number;
  theme: ReaderTheme;
  keepAwake: boolean;
};

const defaultReaderSettings: ReaderSettings = {
  direction: 'vertical',
  dataSaverDefault: true,
  pageGap: 0,
  theme: 'black',
  keepAwake: true,
};

type AppPreferencesContextValue = {
  loaded: boolean;
  appLanguage: AppLanguage;
  contentLanguage: string;
  language: string;
  themeMode: ThemeMode;
  removeAds: boolean;
  colors: AppColors;
  readerSettings: ReaderSettings;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setAppLanguage: (value: AppLanguage) => Promise<void>;
  setContentLanguage: (value: string) => Promise<void>;
  setLanguage: (value: string) => Promise<void>;
  setThemeMode: (value: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setRemoveAds: (value: boolean) => Promise<void>;
  setReaderSettings: (value: ReaderSettings) => Promise<void>;
  updateReaderSettings: (value: Partial<ReaderSettings>) => Promise<void>;
};

const AppPreferencesContext =
  createContext<AppPreferencesContextValue | null>(null);

function normalizeAppLanguage(value: string | null): AppLanguage {
  if (
    value === 'vi' ||
    value === 'en' ||
    value === 'ja' ||
    value === 'ko' ||
    value === 'zh' ||
    value === 'es' ||
    value === 'fr' ||
    value === 'de' ||
    value === 'th' ||
    value === 'id' ||
    value === 'pt'
  ) {
    return value;
  }

  return 'vi';
}

function parseReaderSettings(raw: string | null): ReaderSettings {
  if (!raw) {
    return defaultReaderSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;

    return {
      direction:
        parsed.direction === 'horizontal' || parsed.direction === 'vertical'
          ? parsed.direction
          : defaultReaderSettings.direction,
      dataSaverDefault:
        typeof parsed.dataSaverDefault === 'boolean'
          ? parsed.dataSaverDefault
          : defaultReaderSettings.dataSaverDefault,
      pageGap:
        typeof parsed.pageGap === 'number'
          ? Math.max(0, Math.min(24, parsed.pageGap))
          : defaultReaderSettings.pageGap,
      theme:
        parsed.theme === 'black' ||
        parsed.theme === 'white' ||
        parsed.theme === 'sepia' ||
        parsed.theme === 'gray'
          ? parsed.theme
          : defaultReaderSettings.theme,
      keepAwake:
        typeof parsed.keepAwake === 'boolean'
          ? parsed.keepAwake
          : defaultReaderSettings.keepAwake,
    };
  } catch {
    return defaultReaderSettings;
  }
}

export function AppPreferencesProvider({children}: {children: ReactNode}) {
  const [loaded, setLoaded] = useState(false);
  const [appLanguageState, setAppLanguageState] =
    useState<AppLanguage>('vi');
  const [contentLanguageState, setContentLanguageState] = useState('en');
  const [themeModeState, setThemeModeState] = useState<ThemeMode>('dark');
  const [removeAdsState, setRemoveAdsState] = useState(false);
  const [readerSettingsState, setReaderSettingsState] =
    useState<ReaderSettings>(defaultReaderSettings);

  useEffect(() => {
    async function load() {
      const [
        savedAppLanguage,
        savedContentLanguage,
        oldLanguage,
        savedTheme,
        savedRemoveAds,
        savedReaderSettings,
      ] = await Promise.all([
        AsyncStorage.getItem(APP_LANGUAGE_KEY),
        AsyncStorage.getItem(CONTENT_LANGUAGE_KEY),
        AsyncStorage.getItem(OLD_LANGUAGE_KEY),
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(REMOVE_ADS_KEY),
        AsyncStorage.getItem(READER_SETTINGS_KEY),
      ]);

      setAppLanguageState(normalizeAppLanguage(savedAppLanguage));

      if (savedContentLanguage || oldLanguage) {
        setContentLanguageState(savedContentLanguage || oldLanguage || 'en');
      }

      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeModeState(savedTheme);
      }

      setRemoveAdsState(savedRemoveAds === 'true');
      setReaderSettingsState(parseReaderSettings(savedReaderSettings));
      setLoaded(true);
    }

    load().catch(() => setLoaded(true));
  }, []);

  async function setAppLanguage(value: AppLanguage) {
    setAppLanguageState(value);
    await AsyncStorage.setItem(APP_LANGUAGE_KEY, value);
  }

  async function setContentLanguage(value: string) {
    setContentLanguageState(value);
    await AsyncStorage.setItem(CONTENT_LANGUAGE_KEY, value);
    await AsyncStorage.setItem(OLD_LANGUAGE_KEY, value);
  }

  async function setLanguage(value: string) {
    await setContentLanguage(value);
  }

  async function setThemeMode(value: ThemeMode) {
    setThemeModeState(value);
    await AsyncStorage.setItem(THEME_KEY, value);
  }

  async function toggleTheme() {
    const next = themeModeState === 'dark' ? 'light' : 'dark';
    await setThemeMode(next);
  }

  async function setRemoveAds(value: boolean) {
    setRemoveAdsState(value);
    await AsyncStorage.setItem(REMOVE_ADS_KEY, String(value));
  }

  async function setReaderSettings(value: ReaderSettings) {
    const next = parseReaderSettings(JSON.stringify(value));
    setReaderSettingsState(next);
    await AsyncStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(next));
  }

  async function updateReaderSettings(value: Partial<ReaderSettings>) {
    await setReaderSettings({
      ...readerSettingsState,
      ...value,
    });
  }

  const colors = useMemo(
    () => getThemeColors(themeModeState),
    [themeModeState],
  );

  const value = useMemo(
    () => ({
      loaded,
      appLanguage: appLanguageState,
      contentLanguage: contentLanguageState,
      language: contentLanguageState,
      themeMode: themeModeState,
      removeAds: removeAdsState,
      colors,
      readerSettings: readerSettingsState,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        translate(appLanguageState, key, params),
      setAppLanguage,
      setContentLanguage,
      setLanguage,
      setThemeMode,
      toggleTheme,
      setRemoveAds,
      setReaderSettings,
      updateReaderSettings,
    }),
    [
      loaded,
      appLanguageState,
      contentLanguageState,
      themeModeState,
      removeAdsState,
      colors,
      readerSettingsState,
    ],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error(
      'useAppPreferences must be used inside AppPreferencesProvider',
    );
  }

  return context;
}
