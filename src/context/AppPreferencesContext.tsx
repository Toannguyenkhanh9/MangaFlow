import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {AppColors, getThemeColors, ThemeMode} from '../theme/themes';
import {AppLanguage, t as translate, TranslationKey} from '../i18n/translations';

const APP_LANGUAGE_KEY = 'mangaflow.appLanguage';
const CONTENT_LANGUAGE_KEY = 'mangaflow.contentLanguage';
const OLD_LANGUAGE_KEY = 'mangaflow.language';
const THEME_KEY = 'mangaflow.theme';
const REMOVE_ADS_KEY = 'mangaflow.removeAds';

type AppPreferencesContextValue = {
  loaded: boolean;
  appLanguage: AppLanguage;
  contentLanguage: string;
  language: string;
  themeMode: ThemeMode;
  removeAds: boolean;
  colors: AppColors;
  t: (key: TranslationKey) => string;
  setAppLanguage: (value: AppLanguage) => Promise<void>;
  setContentLanguage: (value: string) => Promise<void>;
  setLanguage: (value: string) => Promise<void>;
  setThemeMode: (value: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setRemoveAds: (value: boolean) => Promise<void>;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function normalizeAppLanguage(value: string | null): AppLanguage {
  if (value === 'vi' || value === 'en' || value === 'ja' || value === 'ko' || value === 'zh' || value === 'es' || value === 'fr' || value === 'de' || value === 'th' || value === 'id' || value === 'pt') {
    return value;
  }
  return 'vi';
}

export function AppPreferencesProvider({children}: {children: ReactNode}) {
  const [loaded, setLoaded] = useState(false);
  const [appLanguageState, setAppLanguageState] = useState<AppLanguage>('vi');
  const [contentLanguageState, setContentLanguageState] = useState('en');
  const [themeModeState, setThemeModeState] = useState<ThemeMode>('dark');
  const [removeAdsState, setRemoveAdsState] = useState(false);

  useEffect(() => {
    async function load() {
      const [savedAppLanguage, savedContentLanguage, oldLanguage, savedTheme, savedRemoveAds] = await Promise.all([
        AsyncStorage.getItem(APP_LANGUAGE_KEY),
        AsyncStorage.getItem(CONTENT_LANGUAGE_KEY),
        AsyncStorage.getItem(OLD_LANGUAGE_KEY),
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(REMOVE_ADS_KEY),
      ]);
      setAppLanguageState(normalizeAppLanguage(savedAppLanguage));
      setContentLanguageState(savedContentLanguage || oldLanguage || 'en');
      if (savedTheme === 'light' || savedTheme === 'dark') setThemeModeState(savedTheme);
      setRemoveAdsState(savedRemoveAds === 'true');
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
    await setThemeMode(themeModeState === 'dark' ? 'light' : 'dark');
  }

  async function setRemoveAds(value: boolean) {
    setRemoveAdsState(value);
    await AsyncStorage.setItem(REMOVE_ADS_KEY, String(value));
  }

  const colors = useMemo(() => getThemeColors(themeModeState), [themeModeState]);
  const value = useMemo(() => ({
    loaded,
    appLanguage: appLanguageState,
    contentLanguage: contentLanguageState,
    language: contentLanguageState,
    themeMode: themeModeState,
    removeAds: removeAdsState,
    colors,
    t: (key: TranslationKey) => translate(appLanguageState, key),
    setAppLanguage,
    setContentLanguage,
    setLanguage,
    setThemeMode,
    toggleTheme,
    setRemoveAds,
  }), [loaded, appLanguageState, contentLanguageState, themeModeState, removeAdsState, colors]);

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  return context;
}
