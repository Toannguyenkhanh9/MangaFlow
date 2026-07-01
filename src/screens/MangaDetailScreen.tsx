import React, {
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {
  getChapters,
  getMangaCoverUrl,
  getMangaDescription,
  getMangaTagNames,
  getMangaTitle,
  type ChapterItem,
} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {useLibrary} from '../context/LibraryContext';
import {showInterstitialIfReady} from '../services/ads';

type Props = NativeStackScreenProps<RootStackParamList, 'MangaDetail'>;

export default function MangaDetailScreen({route, navigation}: Props) {
  const {manga, language} = route.params;
  const {colors, removeAds, appLanguage, t} = useAppPreferences();
  const {isFavorite, toggleFavorite} = useLibrary();

  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const title = getMangaTitle(manga, language);
  const description = getMangaDescription(manga, language);
  const coverUrl = getMangaCoverUrl(manga, 512);
  const favorite = isFavorite(manga.id);
  const tags = getMangaTagNames(manga, appLanguage).slice(0, 6);

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <Pressable onPress={() => toggleFavorite(manga, language)}>
          <Text style={{color: colors.primary, fontSize: 22}}>
            {favorite ? '❤️' : '🤍'}
          </Text>
        </Pressable>
      ),
    });
  }, [
    navigation,
    title,
    colors.primary,
    favorite,
    manga,
    language,
    toggleFavorite,
  ]);

  async function loadChapters() {
    try {
      setLoading(true);
      setError('');

      const data = await getChapters(manga.id, language);
      setChapters(data);
    } catch {
      setError(t('detail.loadChapterError'));
    } finally {
      setLoading(false);
    }
  }

  async function openReader(chapter: ChapterItem) {
    await showInterstitialIfReady(removeAds);

    navigation.navigate('Reader', {
      manga,
      chapter,
      title,
      language,
    });
  }

  useEffect(() => {
    loadChapters();
  }, [manga.id, language]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={chapters}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {coverUrl ? (
                <Image source={{uri: coverUrl}} style={styles.cover} />
              ) : (
                <View
                  style={[
                    styles.cover,
                    styles.noCover,
                    {backgroundColor: colors.surface2},
                  ]}>
                  <Text style={{color: colors.muted}}>
                    {t('common.noCover')}
                  </Text>
                </View>
              )}

              <View style={styles.info}>
                <Text style={[styles.title, {color: colors.text}]}>
                  {title}
                </Text>

                <Text style={[styles.meta, {color: colors.muted}]}>
                  {manga.attributes.status || 'unknown'}
                  {manga.attributes.year ? ` • ${manga.attributes.year}` : ''}
                </Text>

                <Text style={[styles.language, {color: colors.primary}]}>
                  {t('detail.chapterLanguage')}: {language.toUpperCase()}
                </Text>

                <Pressable
                  style={[
                    styles.favoriteButton,
                    {
                      backgroundColor: favorite
                        ? colors.primary
                        : colors.surface,
                      borderColor: favorite ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleFavorite(manga, language)}>
                  <Text
                    style={{
                      color: favorite ? '#ffffff' : colors.text,
                      fontWeight: '900',
                    }}>
                    {favorite
                      ? t('detail.favoriteSaved')
                      : t('detail.favoriteAdd')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {tags.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagRow}>
                {tags.map(tag => (
                  <View
                    key={tag}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}>
                    <Text style={[styles.tagText, {color: colors.primary}]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {!!description && (
              <ScrollView
                style={[
                  styles.descriptionBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <Text
                  style={[styles.description, {color: colors.muted}]}
                  numberOfLines={8}>
                  {description}
                </Text>
              </ScrollView>
            )}

            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              {t('detail.chapterList')}
            </Text>

            {loading && (
              <ActivityIndicator
                color={colors.primary}
                size="large"
                style={styles.loading}
              />
            )}

            {!!error && (
              <Text style={[styles.error, {color: colors.danger}]}>
                {error}
              </Text>
            )}

            {!loading && chapters.length === 0 && !error && (
              <Text style={[styles.empty, {color: colors.muted}]}>
                {t('detail.noChapters')}
              </Text>
            )}
          </>
        }
        renderItem={({item}) => (
          <Pressable
            style={[
              styles.chapterCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => openReader(item)}>
            <Text style={[styles.chapterTitle, {color: colors.text}]}>
              {cleanChapterTitle(
                item.attributes.chapter,
                item.attributes.title,
              )}
            </Text>

            <Text style={[styles.chapterMeta, {color: colors.muted}]}>
              {item.attributes.pages || 0} {t('common.pages')}
              {item.attributes.publishAt
                ? ` • ${new Date(
                    item.attributes.publishAt,
                  ).toLocaleDateString()}`
                : ''}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
  },
  cover: {
    width: 124,
    height: 178,
    borderRadius: 20,
  },
  noCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  meta: {
    marginTop: 8,
    textTransform: 'capitalize',
  },
  language: {
    marginTop: 8,
    fontWeight: '900',
  },
  favoriteButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  tagRow: {
    gap: 8,
    paddingVertical: 14,
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  descriptionBox: {
    borderRadius: 18,
    padding: 14,
    marginTop: 2,
    borderWidth: 1,
  },
  description: {
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 22,
    marginBottom: 10,
  },
  loading: {
    marginVertical: 16,
  },
  error: {
    marginVertical: 10,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 20,
  },
  chapterCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  chapterMeta: {
    marginTop: 6,
  },
});
