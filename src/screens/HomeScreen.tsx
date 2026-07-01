import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import MangaCard from '../components/MangaCard';
import {getMangaList, getMangaTags, MangaSort, type MangaItem, type MangaTag} from '../api/mangadex';
import {useAppPreferences} from '../context/AppPreferencesContext';
import EmptyState from '../components/EmptyState';
import {getLocalizedText} from '../utils/manga';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Home'>, NativeStackScreenProps<RootStackParamList>>;

export default function HomeScreen({navigation}: Props) {
  const {colors, contentLanguage, appLanguage, t} = useAppPreferences();
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<MangaSort>('latest');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [mangas, setMangas] = useState<MangaItem[]>([]);
  const [tags, setTags] = useState<MangaTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTagName = useMemo(() => {
    const tag = tags.find(item => item.id === selectedTagId);
    return tag ? getLocalizedText(tag.attributes.name, appLanguage) || getLocalizedText(tag.attributes.name, 'en') : t('common.all');
  }, [tags, selectedTagId, appLanguage, t]);

  const sectionTitle = useMemo(() => {
    if (keyword.trim()) return t('home.searchResults');
    return sort === 'popular' ? t('home.popularManga') : t('home.latestManga');
  }, [keyword, sort, t]);

  const loadManga = useCallback(async (options?: {nextSort?: MangaSort; nextTagId?: string | null; nextKeyword?: string}) => {
    const finalSort = options?.nextSort ?? sort;
    const finalTagId = options && 'nextTagId' in options ? options.nextTagId : selectedTagId;
    const finalKeyword = options && 'nextKeyword' in options ? options.nextKeyword || '' : keyword;
    try {
      setLoading(true);
      setError('');
      const data = await getMangaList({language: contentLanguage, sort: finalSort, tagId: finalTagId, query: finalKeyword.trim(), limit: 40});
      setMangas(data);
    } catch {
      setError(finalKeyword.trim() ? t('home.searchError') : t('home.loadError'));
    } finally {
      setLoading(false);
    }
  }, [sort, selectedTagId, keyword, contentLanguage, t]);

  const loadTags = useCallback(async () => {
    try {
      setTagsLoading(true);
      setTags(await getMangaTags(appLanguage));
    } catch {
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, [appLanguage]);

  async function handleSearch() { await loadManga({nextKeyword: keyword}); }
  async function changeSort(value: MangaSort) { setSort(value); await loadManga({nextSort: value}); }
  async function changeTag(tagId: string | null) { setSelectedTagId(tagId); await loadManga({nextTagId: tagId}); }

  useEffect(() => { loadTags(); }, [loadTags]);
  useEffect(() => {
    setKeyword('');
    setSelectedTagId(null);
    loadManga({nextKeyword: '', nextTagId: null});
  }, [contentLanguage]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={mangas}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadManga()} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={[styles.hero, {backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow}]}>
              <Text style={styles.heroIcon}>📚</Text>
              <View style={styles.heroTextBox}>
                <Text style={[styles.logo, {color: colors.text}]}>{t('home.title')}</Text>
                <Text style={[styles.subtitle, {color: colors.muted}]}>{t('app.subtitle')}</Text>
                <View style={styles.languageBadgeRow}>
                  <View style={[styles.languageBadge, {backgroundColor: colors.surface2}]}>
                    <Text style={[styles.languageBadgeText, {color: colors.primary}]}>{t('settings.contentLanguage')}: {contentLanguage.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.searchBox, {backgroundColor: colors.surface, borderColor: colors.border}]}>
              <TextInput value={keyword} onChangeText={setKeyword} placeholder={t('home.searchPlaceholder')} placeholderTextColor={colors.muted} style={[styles.input, {color: colors.text}]} returnKeyType="search" onSubmitEditing={handleSearch} />
              <Pressable style={[styles.searchButton, {backgroundColor: colors.primary}]} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>{t('common.search')}</Text>
              </Pressable>
            </View>

            <View style={styles.filterRow}>
              <Pressable style={[styles.filterButton, {backgroundColor: sort === 'latest' ? colors.primary : colors.surface, borderColor: sort === 'latest' ? colors.primary : colors.border}]} onPress={() => changeSort('latest')}>
                <Text style={[styles.filterText, {color: sort === 'latest' ? '#ffffff' : colors.text}]}>🆕 {t('common.latest')}</Text>
              </Pressable>
              <Pressable style={[styles.filterButton, {backgroundColor: sort === 'popular' ? colors.primary : colors.surface, borderColor: sort === 'popular' ? colors.primary : colors.border}]} onPress={() => changeSort('popular')}>
                <Text style={[styles.filterText, {color: sort === 'popular' ? '#ffffff' : colors.text}]}>❤️ {t('common.popular')}</Text>
              </Pressable>
            </View>

            <View style={styles.genreHeader}>
              <Text style={[styles.genreTitle, {color: colors.text}]}>{t('common.genres')}</Text>
              <Text style={[styles.genreSelected, {color: colors.muted}]}>{selectedTagName}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
              <Pressable style={[styles.genreChip, {backgroundColor: selectedTagId === null ? colors.primary : colors.surface, borderColor: selectedTagId === null ? colors.primary : colors.border}]} onPress={() => changeTag(null)}>
                <Text style={[styles.genreChipText, {color: selectedTagId === null ? '#ffffff' : colors.text}]}>{t('common.all')}</Text>
              </Pressable>
              {tagsLoading && <ActivityIndicator color={colors.primary} style={styles.tagsLoading} />}
              {tags.map(tag => {
                const active = selectedTagId === tag.id;
                const name = getLocalizedText(tag.attributes.name, appLanguage) || getLocalizedText(tag.attributes.name, 'en');
                return (
                  <Pressable key={tag.id} style={[styles.genreChip, {backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border}]} onPress={() => changeTag(tag.id)}>
                    <Text style={[styles.genreChipText, {color: active ? '#ffffff' : colors.text}]}>{name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionTitle, {color: colors.text}]}>{sectionTitle}</Text>
            {!!error && <Text style={[styles.error, {color: colors.danger}]}>{error}</Text>}
            {loading && mangas.length === 0 && <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />}
          </View>
        }
        renderItem={({item}) => <MangaCard manga={item} language={contentLanguage} onPress={() => navigation.navigate('MangaDetail', {manga: item, language: contentLanguage})} />}
        ListEmptyComponent={!loading ? <EmptyState icon="🔎" title={t('home.noMangaTitle')} message={t('home.noMangaMessage')} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  list: {padding: 16, paddingBottom: 24},
  hero: {flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 16, borderWidth: 1, marginBottom: 16, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: {width: 0, height: 8}, elevation: 2},
  heroIcon: {fontSize: 42},
  heroTextBox: {flex: 1, marginLeft: 14},
  logo: {fontSize: 31, fontWeight: '900'},
  subtitle: {marginTop: 5, lineHeight: 19},
  languageBadgeRow: {flexDirection: 'row', marginTop: 10},
  languageBadge: {borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10},
  languageBadgeText: {fontSize: 12, fontWeight: '900'},
  searchBox: {flexDirection: 'row', borderRadius: 18, borderWidth: 1, overflow: 'hidden'},
  input: {flex: 1, paddingHorizontal: 14, height: 52},
  searchButton: {justifyContent: 'center', paddingHorizontal: 20},
  searchButtonText: {color: '#ffffff', fontWeight: '900'},
  filterRow: {flexDirection: 'row', gap: 10, marginTop: 14},
  filterButton: {borderRadius: 999, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14},
  filterText: {fontWeight: '900', fontSize: 13},
  genreHeader: {marginTop: 18, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'},
  genreTitle: {fontSize: 16, fontWeight: '900'},
  genreSelected: {fontSize: 12, fontWeight: '700'},
  genreScroll: {gap: 9, paddingRight: 18},
  genreChip: {borderRadius: 999, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13},
  genreChipText: {fontWeight: '800', fontSize: 12},
  tagsLoading: {marginLeft: 8},
  sectionTitle: {fontSize: 19, fontWeight: '900', marginTop: 20, marginBottom: 12},
  loading: {marginVertical: 18},
  error: {marginTop: 12, fontWeight: '700'},
});
