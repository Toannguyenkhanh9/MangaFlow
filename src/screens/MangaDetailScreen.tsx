import React, {useEffect, useLayoutEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import MangaCard from '../components/MangaCard';
import {getChapterScanlationGroup, getChapters, getFirstGenreTagId, getMangaCoverUrl, getMangaDescription, getMangaList, getMangaTagNames, getMangaTitle, type ChapterItem, type MangaItem} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {LibraryStatus, useLibrary} from '../context/LibraryContext';
import {translateGenreName} from '../i18n/genreNames';
import {downloadChapterOffline, isChapterDownloaded} from '../services/downloads';

type Props = NativeStackScreenProps<RootStackParamList, 'MangaDetail'>;
const statuses: LibraryStatus[] = ['reading', 'want', 'completed', 'paused', 'favorite'];

export default function MangaDetailScreen({route, navigation}: Props) {
  const {manga, language} = route.params;
  const {colors, appLanguage, readerSettings, t} = useAppPreferences();
  const {isFavorite, toggleFavorite, getProgressForManga, getLibraryStatus, setMangaLibraryStatus} = useLibrary();
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [related, setRelated] = useState<MangaItem[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState('');
  const title = getMangaTitle(manga, language);
  const description = getMangaDescription(manga, language);
  const coverUrl = getMangaCoverUrl(manga, 512);
  const favorite = isFavorite(manga.id);
  const progress = getProgressForManga(manga.id);
  const libraryStatus = getLibraryStatus(manga.id);
  const tags = getMangaTagNames(manga, 'en').map(name => translateGenreName(name, appLanguage)).slice(0, 6);

  useLayoutEffect(() => { navigation.setOptions({title, headerRight: () => <Pressable onPress={() => toggleFavorite(manga, language)}><Text style={{color: colors.primary, fontSize: 22}}>{favorite ? '❤️' : '🤍'}</Text></Pressable>}); }, [navigation, title, colors.primary, favorite, manga, language, toggleFavorite]);

  async function refreshDownloadedIds(items: ChapterItem[]) { const ids = new Set<string>(); for (const chapter of items) if (await isChapterDownloaded(chapter.id)) ids.add(chapter.id); setDownloadedIds(ids); }
  async function loadChapters() { try { setLoading(true); setError(''); const data = await getChapters(manga.id, language); setChapters(data); await refreshDownloadedIds(data); } catch { setError(t('detail.loadChapterError')); } finally { setLoading(false); } }
  async function loadRelated() { const tagId = getFirstGenreTagId(manga); if (!tagId) return; try { setRelatedLoading(true); const data = await getMangaList({language, sort: 'popular', tagId, limit: 12}); setRelated(data.filter(item => item.id !== manga.id).slice(0, 10)); } catch { setRelated([]); } finally { setRelatedLoading(false); } }
  function openReader(chapter: ChapterItem, initialPageIndex = 0) { navigation.navigate('Reader', {manga, chapter, title, language, initialPageIndex}); }
  function openContinue() { if (progress) openReader(progress.chapter, progress.pageIndex); else if (chapters[0]) openReader(chapters[0]); }
  async function handleDownload(chapter: ChapterItem) { if (downloadedIds.has(chapter.id) || downloadingId) return; try { setDownloadingId(chapter.id); setDownloadPercent(0); await downloadChapterOffline({manga, chapter, language, dataSaver: readerSettings.dataSaverDefault, onProgress: value => setDownloadPercent(value.percent)}); setDownloadedIds(prev => new Set([...Array.from(prev), chapter.id])); Alert.alert(t('common.downloaded'), t('detail.downloadDone')); } catch { Alert.alert(t('common.download'), t('detail.downloadFailed')); } finally { setDownloadingId(null); setDownloadPercent(0); } }
  useEffect(() => { loadChapters(); loadRelated(); }, [manga.id, language]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={chapters}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<>
          <View style={styles.header}>
            {coverUrl ? <Image source={{uri: coverUrl}} style={styles.cover} /> : <View style={[styles.cover, styles.noCover, {backgroundColor: colors.surface2}]}><Text style={{color: colors.muted}}>{t('common.noCover')}</Text></View>}
            <View style={styles.info}>
              <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
              <Text style={[styles.meta, {color: colors.muted}]}>{manga.attributes.status || 'unknown'}{manga.attributes.year ? ` • ${manga.attributes.year}` : ''}</Text>
              <Text style={[styles.language, {color: colors.primary}]}>{t('detail.chapterLanguage')}: {language.toUpperCase()}</Text>
              <Pressable style={[styles.favoriteButton, {backgroundColor: favorite ? colors.primary : colors.surface, borderColor: favorite ? colors.primary : colors.border}]} onPress={() => toggleFavorite(manga, language)}><Text style={{color: favorite ? '#fff' : colors.text, fontWeight: '900'}}>{favorite ? t('detail.favoriteSaved') : t('detail.favoriteAdd')}</Text></Pressable>
            </View>
          </View>
          <Pressable style={[styles.primaryButton, {backgroundColor: colors.primary}]} onPress={openContinue}><Text style={styles.primaryButtonText}>{progress ? t('detail.readContinue') : t('detail.readFirst')}</Text></Pressable>
          <Text style={[styles.statusTitle, {color: colors.text}]}>{t('detail.libraryStatus')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>{statuses.map(status => { const active = libraryStatus === status; return <Pressable key={status} style={[styles.statusChip, {backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border}]} onPress={() => setMangaLibraryStatus(manga, language, status)}><Text style={[styles.statusChipText, {color: active ? '#fff' : colors.text}]}>{t(`library.status.${status}`)}</Text></Pressable>; })}</ScrollView>
          {tags.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>{tags.map(tag => <View key={tag} style={[styles.tagChip, {backgroundColor: colors.surface, borderColor: colors.border}]}><Text style={[styles.tagText, {color: colors.primary}]}>{tag}</Text></View>)}</ScrollView>}
          {!!description && <ScrollView style={[styles.descriptionBox, {backgroundColor: colors.surface, borderColor: colors.border}]}><Text style={[styles.description, {color: colors.muted}]} numberOfLines={8}>{description}</Text></ScrollView>}
          <View style={[styles.sourceBox, {backgroundColor: colors.surface, borderColor: colors.border}]}><Text style={[styles.sourceText, {color: colors.muted}]}>{t('credits.sourceLine')}</Text></View>
          {related.length > 0 && <View style={styles.relatedBox}><Text style={[styles.sectionTitle, {color: colors.text}]}>{t('detail.related')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>{related.map(item => <View key={item.id} style={styles.relatedCard}><MangaCard manga={item} language={language} onPress={() => navigation.push('MangaDetail', {manga: item, language})} /></View>)}</ScrollView></View>}
          {relatedLoading && <ActivityIndicator color={colors.primary} style={styles.relatedLoading} />}
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('detail.chapterList')}</Text>
          {loading && <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />}
          {!!error && <Text style={[styles.error, {color: colors.danger}]}>{error}</Text>}
          {!loading && chapters.length === 0 && !error && <Text style={[styles.empty, {color: colors.muted}]}>{t('detail.noChapters')}</Text>}
        </>}
        renderItem={({item}) => {
          const groupName = getChapterScanlationGroup(item); const downloading = downloadingId === item.id; const downloaded = downloadedIds.has(item.id);
          return <View style={[styles.chapterCard, {backgroundColor: colors.surface, borderColor: colors.border}]}><Pressable onPress={() => openReader(item)}><Text style={[styles.chapterTitle, {color: colors.text}]}>{cleanChapterTitle(item.attributes.chapter, item.attributes.title)}</Text><Text style={[styles.chapterMeta, {color: colors.muted}]}>{item.attributes.pages || 0} {t('common.pages')}{item.attributes.publishAt ? ` • ${new Date(item.attributes.publishAt).toLocaleDateString()}` : ''}</Text>{!!groupName && <Text style={[styles.groupText, {color: colors.primary}]}>{t('detail.scanlationGroup')}: {groupName}</Text>}</Pressable><Pressable style={[styles.downloadButton, {backgroundColor: downloaded ? colors.success : colors.primary, opacity: downloading ? 0.7 : 1}]} onPress={() => handleDownload(item)}><Text style={styles.downloadButtonText}>{downloaded ? t('common.downloaded') : downloading ? `${t('common.download')} ${downloadPercent}%` : t('detail.downloadChapter')}</Text></Pressable></View>;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1}, content: {padding: 16, paddingBottom: 30}, header: {flexDirection: 'row'}, cover: {width: 124, height: 178, borderRadius: 20}, noCover: {alignItems: 'center', justifyContent: 'center'}, info: {flex: 1, marginLeft: 15, justifyContent: 'center'}, title: {fontSize: 22, fontWeight: '900'}, meta: {marginTop: 8, textTransform: 'capitalize'}, language: {marginTop: 8, fontWeight: '900'}, favoriteButton: {borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, marginTop: 14, alignSelf: 'flex-start'}, primaryButton: {marginTop: 16, borderRadius: 16, paddingVertical: 13, alignItems: 'center'}, primaryButtonText: {color: '#fff', fontWeight: '900'}, statusTitle: {fontWeight: '900', marginTop: 16}, tagRow: {gap: 8, paddingVertical: 12}, statusChip: {borderRadius: 999, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13}, statusChipText: {fontSize: 12, fontWeight: '900'}, tagChip: {borderRadius: 999, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 11}, tagText: {fontSize: 12, fontWeight: '800'}, descriptionBox: {borderRadius: 18, padding: 14, marginTop: 2, borderWidth: 1}, description: {lineHeight: 21}, sourceBox: {borderRadius: 16, borderWidth: 1, padding: 12, marginTop: 12}, sourceText: {lineHeight: 19, fontSize: 12}, relatedBox: {marginTop: 2}, relatedScroll: {gap: 12, paddingRight: 16}, relatedCard: {width: 270}, relatedLoading: {marginTop: 16}, sectionTitle: {fontSize: 19, fontWeight: '900', marginTop: 22, marginBottom: 10}, loading: {marginVertical: 16}, error: {marginVertical: 10, fontWeight: '700'}, empty: {textAlign: 'center', marginVertical: 20}, chapterCard: {borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1}, chapterTitle: {fontSize: 15, fontWeight: '900'}, chapterMeta: {marginTop: 6}, groupText: {marginTop: 6, fontSize: 12, fontWeight: '800'}, downloadButton: {marginTop: 12, borderRadius: 12, paddingVertical: 10, alignItems: 'center'}, downloadButtonText: {color: '#fff', fontWeight: '900', fontSize: 12},
});
