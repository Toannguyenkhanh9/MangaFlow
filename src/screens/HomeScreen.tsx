import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import MangaCard from '../components/MangaCard';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import {ContentRatingFilter, getMangaList, getMangaTags, MangaSort, MangaStatusFilter, type MangaItem, type MangaTag} from '../api/mangadex';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {useLibrary} from '../context/LibraryContext';
import {getLocalizedText} from '../utils/manga';
import {translateGenreName} from '../i18n/genreNames';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Home'>, NativeStackScreenProps<RootStackParamList>>;
const sortOptions: MangaSort[] = ['latest', 'popular', 'updated', 'title'];
const statusOptions: MangaStatusFilter[] = ['all', 'ongoing', 'completed', 'hiatus', 'cancelled'];
const ratingOptions: ContentRatingFilter[] = ['both', 'safe', 'suggestive'];

export default function HomeScreen({navigation}: Props) {
  const {colors, contentLanguage, appLanguage, t} = useAppPreferences();
  const {continueReading} = useLibrary();
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<MangaSort>('latest');
  const [status, setStatus] = useState<MangaStatusFilter>('all');
  const [rating, setRating] = useState<ContentRatingFilter>('both');
  const [year, setYear] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [mangas, setMangas] = useState<MangaItem[]>([]);
  const [tags, setTags] = useState<MangaTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTagName = useMemo(() => {
    const tag = tags.find(item => item.id === selectedTagId);
    if (!tag) return t('common.all');
    const englishName = getLocalizedText(tag.attributes.name, 'en') || getLocalizedText(tag.attributes.name, appLanguage);
    return translateGenreName(englishName, appLanguage);
  }, [tags, selectedTagId, appLanguage, t]);

  const sectionTitle = useMemo(() => keyword.trim() ? t('home.searchResults') : sort === 'popular' ? t('home.popularManga') : t('home.latestManga'), [keyword, sort, t]);

  const loadManga = useCallback(async (options?: {nextSort?: MangaSort; nextStatus?: MangaStatusFilter; nextRating?: ContentRatingFilter; nextYear?: string; nextTagId?: string | null; nextKeyword?: string}) => {
    const finalSort = options?.nextSort ?? sort;
    const finalStatus = options?.nextStatus ?? status;
    const finalRating = options?.nextRating ?? rating;
    const finalYear = options && 'nextYear' in options ? options.nextYear || '' : year;
    const finalTagId = options && 'nextTagId' in options ? options.nextTagId : selectedTagId;
    const finalKeyword = options && 'nextKeyword' in options ? options.nextKeyword || '' : keyword;
    try {
      setLoading(true); setError('');
      const data = await getMangaList({language: contentLanguage, sort: finalSort, status: finalStatus, contentRating: finalRating, year: finalYear, tagId: finalTagId, query: finalKeyword.trim(), limit: 40});
      setMangas(data);
    } catch {
      setError(finalKeyword.trim() ? t('home.searchError') : t('home.loadError'));
    } finally { setLoading(false); }
  }, [sort, status, rating, year, selectedTagId, keyword, contentLanguage, t]);

  const loadTags = useCallback(async () => { try { setTagsLoading(true); setTags(await getMangaTags(appLanguage)); } catch { setTags([]); } finally { setTagsLoading(false); } }, [appLanguage]);

  function sortLabel(value: MangaSort) { if (value === 'popular') return t('common.popular'); if (value === 'updated') return t('home.sortUpdated'); if (value === 'title') return t('home.sortTitle'); return t('common.latest'); }
  function statusLabel(value: MangaStatusFilter) { if (value === 'ongoing') return t('home.statusOngoing'); if (value === 'completed') return t('home.statusCompleted'); if (value === 'hiatus') return t('home.statusHiatus'); if (value === 'cancelled') return t('home.statusCancelled'); return t('home.statusAll'); }
  function ratingLabel(value: ContentRatingFilter) { if (value === 'safe') return t('home.ratingSafe'); if (value === 'suggestive') return t('home.ratingSuggestive'); return t('home.ratingBoth'); }
  async function handleSearch() { await loadManga({nextKeyword: keyword, nextYear: year}); }
  async function changeSort(value: MangaSort) { setSort(value); await loadManga({nextSort: value}); }
  async function changeStatus(value: MangaStatusFilter) { setStatus(value); await loadManga({nextStatus: value}); }
  async function changeRating(value: ContentRatingFilter) { setRating(value); await loadManga({nextRating: value}); }
  async function changeTag(tagId: string | null) { setSelectedTagId(tagId); await loadManga({nextTagId: tagId}); }

  useEffect(() => { loadTags(); }, [loadTags]);
  useEffect(() => { setKeyword(''); setSelectedTagId(null); loadManga({nextKeyword: '', nextTagId: null}); }, [contentLanguage]);
  const loadingSkeleton = loading && mangas.length === 0;

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
                <View style={styles.languageBadgeRow}><View style={[styles.languageBadge, {backgroundColor: colors.surface2}]}><Text style={[styles.languageBadgeText, {color: colors.primary}]}>{t('settings.contentLanguage')}: {contentLanguage.toUpperCase()}</Text></View></View>
              </View>
            </View>

            {continueReading.length > 0 && <View style={styles.continueBox}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('home.continueReading')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continueScroll}>
                {continueReading.map(item => <Pressable key={item.chapter.id} style={[styles.continueCard, {backgroundColor: colors.surface, borderColor: colors.border}]} onPress={() => navigation.navigate('Reader', {manga: item.manga, chapter: item.chapter, title: item.mangaTitle, language: item.language, initialPageIndex: item.pageIndex})}>
                  {item.coverUrl ? <Image source={{uri: item.coverUrl}} style={styles.continueCover} /> : <View style={[styles.continueCover, {backgroundColor: colors.surface2}]} />}
                  <Text style={[styles.continueTitle, {color: colors.text}]} numberOfLines={2}>{item.mangaTitle}</Text>
                  <Text style={[styles.continueMeta, {color: colors.primary}]} numberOfLines={1}>{item.chapterTitle}</Text>
                  <Text style={[styles.continueMeta, {color: colors.muted}]}>{t('home.readingProgress', {page: item.pageIndex + 1, total: item.pageCount || '?'})}</Text>
                </Pressable>)}
              </ScrollView>
            </View>}

            <View style={[styles.searchBox, {backgroundColor: colors.surface, borderColor: colors.border}]}>
              <TextInput value={keyword} onChangeText={setKeyword} placeholder={t('home.searchPlaceholder')} placeholderTextColor={colors.muted} style={[styles.input, {color: colors.text}]} returnKeyType="search" onSubmitEditing={handleSearch} />
              <Pressable style={[styles.searchButton, {backgroundColor: colors.primary}]} onPress={handleSearch}><Text style={styles.searchButtonText}>{t('common.search')}</Text></Pressable>
            </View>

            <View style={[styles.filterPanel, {backgroundColor: colors.surface, borderColor: colors.border}]}>
              <Text style={[styles.filterTitle, {color: colors.text}]}>{t('home.advancedFilters')}</Text>
              <Text style={[styles.filterLabel, {color: colors.muted}]}>{t('home.sort')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{sortOptions.map(item => <FilterChip key={item} active={sort === item} label={sortLabel(item)} onPress={() => changeSort(item)} />)}</ScrollView>
              <Text style={[styles.filterLabel, {color: colors.muted}]}>{t('common.status')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{statusOptions.map(item => <FilterChip key={item} active={status === item} label={statusLabel(item)} onPress={() => changeStatus(item)} />)}</ScrollView>
              <Text style={[styles.filterLabel, {color: colors.muted}]}>{t('home.rating')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{ratingOptions.map(item => <FilterChip key={item} active={rating === item} label={ratingLabel(item)} onPress={() => changeRating(item)} />)}</ScrollView>
              <View style={styles.yearRow}><TextInput value={year} onChangeText={setYear} keyboardType="number-pad" placeholder={t('home.yearPlaceholder')} placeholderTextColor={colors.muted} style={[styles.yearInput, {backgroundColor: colors.surface2, color: colors.text, borderColor: colors.border}]} returnKeyType="search" onSubmitEditing={handleSearch} /><Pressable style={[styles.yearButton, {backgroundColor: colors.primary}]} onPress={handleSearch}><Text style={styles.searchButtonText}>{t('common.search')}</Text></Pressable></View>
            </View>

            <View style={styles.genreHeader}><Text style={[styles.genreTitle, {color: colors.text}]}>{t('common.genres')}</Text><Text style={[styles.genreSelected, {color: colors.muted}]}>{selectedTagName}</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
              <Pressable style={[styles.genreChip, {backgroundColor: selectedTagId === null ? colors.primary : colors.surface, borderColor: selectedTagId === null ? colors.primary : colors.border}]} onPress={() => changeTag(null)}><Text style={[styles.genreChipText, {color: selectedTagId === null ? '#fff' : colors.text}]}>{t('common.all')}</Text></Pressable>
              {tagsLoading && <ActivityIndicator color={colors.primary} style={styles.tagsLoading} />}
              {tags.map(tag => { const active = selectedTagId === tag.id; const englishName = getLocalizedText(tag.attributes.name, 'en') || getLocalizedText(tag.attributes.name, appLanguage); const name = translateGenreName(englishName, appLanguage); return <Pressable key={tag.id} style={[styles.genreChip, {backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border}]} onPress={() => changeTag(tag.id)}><Text style={[styles.genreChipText, {color: active ? '#fff' : colors.text}]}>{name}</Text></Pressable>; })}
            </ScrollView>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>{sectionTitle}</Text>
            {!!error && <Text style={[styles.error, {color: colors.danger}]}>{error}</Text>}
            {loadingSkeleton && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}
          </View>
        }
        renderItem={({item}) => <MangaCard manga={item} language={contentLanguage} onPress={() => navigation.navigate('MangaDetail', {manga: item, language: contentLanguage})} />}
        ListEmptyComponent={!loading ? <EmptyState icon="🔎" title={t('home.noMangaTitle')} message={t('home.noMangaMessage')} /> : null}
      />
    </View>
  );

  function FilterChip({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) {
    return <Pressable style={[styles.filterButton, {backgroundColor: active ? colors.primary : colors.surface2, borderColor: active ? colors.primary : colors.border}]} onPress={onPress}><Text style={[styles.filterText, {color: active ? '#fff' : colors.text}]}>{label}</Text></Pressable>;
  }
}

const styles = StyleSheet.create({
  container: {flex: 1}, list: {padding: 16, paddingBottom: 24}, hero: {flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 16, borderWidth: 1, marginBottom: 16, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: {width: 0, height: 8}, elevation: 2}, heroIcon: {fontSize: 42}, heroTextBox: {flex: 1, marginLeft: 14}, logo: {fontSize: 31, fontWeight: '900'}, subtitle: {marginTop: 5, lineHeight: 19}, languageBadgeRow: {flexDirection: 'row', marginTop: 10}, languageBadge: {borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10}, languageBadgeText: {fontSize: 12, fontWeight: '900'},
  continueBox: {marginBottom: 18}, continueScroll: {gap: 12, paddingRight: 16}, continueCard: {width: 136, borderRadius: 18, borderWidth: 1, padding: 10}, continueCover: {width: '100%', height: 132, borderRadius: 14, marginBottom: 8}, continueTitle: {fontWeight: '900', fontSize: 13}, continueMeta: {marginTop: 4, fontSize: 11, fontWeight: '700'},
  searchBox: {flexDirection: 'row', borderRadius: 18, borderWidth: 1, overflow: 'hidden'}, input: {flex: 1, paddingHorizontal: 14, height: 52}, searchButton: {justifyContent: 'center', paddingHorizontal: 20}, searchButtonText: {color: '#fff', fontWeight: '900'},
  filterPanel: {marginTop: 14, borderRadius: 20, borderWidth: 1, padding: 12}, filterTitle: {fontWeight: '900', fontSize: 16}, filterLabel: {marginTop: 12, marginBottom: 8, fontWeight: '800'}, filterScroll: {gap: 9, paddingRight: 16}, filterButton: {borderRadius: 999, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13}, filterText: {fontWeight: '900', fontSize: 12}, yearRow: {flexDirection: 'row', gap: 10, marginTop: 12}, yearInput: {flex: 1, borderRadius: 14, borderWidth: 1, height: 46, paddingHorizontal: 12}, yearButton: {borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center'},
  genreHeader: {marginTop: 18, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'}, genreTitle: {fontSize: 16, fontWeight: '900'}, genreSelected: {fontSize: 12, fontWeight: '700'}, genreScroll: {gap: 9, paddingRight: 18}, genreChip: {borderRadius: 999, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13}, genreChipText: {fontWeight: '800', fontSize: 12}, tagsLoading: {marginLeft: 8}, sectionTitle: {fontSize: 19, fontWeight: '900', marginTop: 20, marginBottom: 12}, error: {marginTop: 12, fontWeight: '700'},
});
