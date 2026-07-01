import React, {
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import type {RootStackParamList} from '../navigation/types';
import {getChapterPages} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';
import PageImage from '../components/PageImage';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {useLibrary} from '../context/LibraryContext';
import {bannerUnitId} from '../services/ads';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

export default function ReaderScreen({route, navigation}: Props) {
  const {manga, chapter, title, language} = route.params;
  const {colors, removeAds, t} = useAppPreferences();
  const {addHistory} = useLibrary();

  const [pages, setPages] = useState<string[]>([]);
  const [dataSaver, setDataSaver] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chapterTitle = cleanChapterTitle(
    chapter.attributes.chapter,
    chapter.attributes.title,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: chapterTitle,
    });
  }, [navigation, chapterTitle]);

  async function loadPages(useDataSaver = dataSaver) {
    try {
      setLoading(true);
      setError('');

      const data = await getChapterPages(chapter.id, useDataSaver);
      setPages(data);

      await addHistory({
        manga,
        chapter,
        language,
        pageCount: data.length,
      });
    } catch {
      setError(t('reader.loadPagesError'));
    } finally {
      setLoading(false);
    }
  }

  function toggleQuality() {
    const next = !dataSaver;
    setDataSaver(next);
    loadPages(next);
  }

  useEffect(() => {
    loadPages(true);
  }, [chapter.id]);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, {backgroundColor: colors.surface}]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, {color: colors.text}]}>‹</Text>
        </Pressable>

        <View style={styles.topInfo}>
          <Text
            style={[styles.mangaTitle, {color: colors.text}]}
            numberOfLines={1}>
            {title}
          </Text>

          <Text
            style={[styles.chapterTitle, {color: colors.muted}]}
            numberOfLines={1}>
            {chapterTitle}
          </Text>
        </View>

        <Pressable
          style={[styles.qualityButton, {backgroundColor: colors.primary}]}
          onPress={toggleQuality}>
          <Text style={styles.qualityText}>
            {dataSaver ? t('reader.saver') : t('reader.hd')}
          </Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />

          <Text style={[styles.loadingText, {color: colors.muted}]}>
            {t('reader.loadingPages')}
          </Text>
        </View>
      )}

      {!!error && (
        <View style={styles.center}>
          <Text style={[styles.error, {color: colors.danger}]}>
            {error}
          </Text>

          <Pressable
            style={[styles.retryButton, {backgroundColor: colors.primary}]}
            onPress={() => loadPages()}>
            <Text style={styles.retryText}>
              {t('common.retry')}
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={pages}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({item}) => <PageImage uri={item} />}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews
          ListEmptyComponent={
            <Text style={[styles.empty, {color: colors.muted}]}>
              {t('reader.emptyPages')}
            </Text>
          }
        />
      )}

      {!removeAds && (
        <View style={styles.bannerBox}>
          <BannerAd
            unitId={bannerUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 38,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '300',
  },
  topInfo: {
    flex: 1,
  },
  mangaTitle: {
    fontWeight: '900',
  },
  chapterTitle: {
    marginTop: 3,
    fontSize: 12,
  },
  qualityButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qualityText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
  },
  error: {
    textAlign: 'center',
    fontWeight: '700',
  },
  retryButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  bannerBox: {
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
