import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Dimensions, FlatList, Modal, Pressable, StyleSheet, Switch, Text, View, ViewToken} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {getChapterPages, getChapterScanlationGroup} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';
import PageImage from '../components/PageImage';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {useLibrary} from '../context/LibraryContext';
import {downloadChapterOffline, isChapterDownloaded} from '../services/downloads';
import {activateKeepAwake, deactivateKeepAwake} from '../services/keepAwake';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;
const screenWidth = Dimensions.get('window').width;
function readerPalette(theme: 'black' | 'white' | 'sepia' | 'gray') { if (theme === 'white') return {bg: '#fff', top: '#fff', text: '#111827', muted: '#6b7280'}; if (theme === 'sepia') return {bg: '#f5ead6', top: '#fff7ed', text: '#3f2f1f', muted: '#7c5f45'}; if (theme === 'gray') return {bg: '#1f2937', top: '#111827', text: '#f9fafb', muted: '#cbd5e1'}; return {bg: '#000', top: '#0b0f19', text: '#fff', muted: '#9ca3af'}; }

export default function ReaderScreen({route, navigation}: Props) {
  const {manga, chapter, title, language, initialPageIndex = 0, offlinePages, offlineMode = false} = route.params;
  const {colors, readerSettings, updateReaderSettings, t} = useAppPreferences();
  const {addHistory, updateReadingProgress, toggleBookmark, isBookmarked} = useLibrary();
  const listRef = useRef<FlatList<string>>(null);
  const [pages, setPages] = useState<string[]>(offlinePages || []);
  const [dataSaver, setDataSaver] = useState(readerSettings.dataSaverDefault);
  const [loading, setLoading] = useState(!offlinePages);
  const [error, setError] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(Math.max(0, initialPageIndex));
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [downloaded, setDownloaded] = useState(offlineMode);
  const [downloading, setDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const chapterTitle = cleanChapterTitle(chapter.attributes.chapter, chapter.attributes.title);
  const groupName = getChapterScanlationGroup(chapter);
  const bookmarked = isBookmarked(chapter.id, currentPageIndex);
  const horizontal = readerSettings.direction === 'horizontal';
  const pageGap = readerSettings.pageGap;
  const palette = readerPalette(readerSettings.theme);

  useLayoutEffect(() => { navigation.setOptions({title: chapterTitle}); }, [navigation, chapterTitle]);
  useEffect(() => { if (readerSettings.keepAwake) activateKeepAwake(); return () => deactivateKeepAwake(); }, [readerSettings.keepAwake]);
  async function saveProgress(pageIndex: number, pageCount = pages.length) { if (pageCount <= 0) return; await updateReadingProgress({manga, chapter, language, pageIndex, pageCount}); }
  async function loadPages(useDataSaver = dataSaver) {
    if (offlinePages && offlinePages.length > 0) { setPages(offlinePages); setLoading(false); await addHistory({manga, chapter, language, pageCount: offlinePages.length}); await saveProgress(initialPageIndex, offlinePages.length); return; }
    try { setLoading(true); setError(''); const data = await getChapterPages(chapter.id, useDataSaver); setPages(data); await addHistory({manga, chapter, language, pageCount: data.length}); await saveProgress(initialPageIndex, data.length); } catch { setError(t('reader.loadPagesError')); } finally { setLoading(false); }
  }
  function scrollToInitialPage() { if (initialPageIndex <= 0 || pages.length === 0) return; setTimeout(() => listRef.current?.scrollToIndex({index: Math.min(initialPageIndex, pages.length - 1), animated: false}), 350); }
  async function toggleQuality() { const next = !dataSaver; setDataSaver(next); await updateReaderSettings({dataSaverDefault: next}); if (!offlineMode) loadPages(next); }
  async function handleBookmark() { await toggleBookmark({manga, chapter, language, pageIndex: currentPageIndex, pageCount: pages.length, pageUri: pages[currentPageIndex]}); }
  async function handleDownload() { if (offlineMode || downloaded || downloading) return; try { setDownloading(true); setDownloadPercent(0); await downloadChapterOffline({manga, chapter, language, dataSaver, onProgress: p => setDownloadPercent(p.percent)}); setDownloaded(true); Alert.alert(t('common.downloaded'), t('detail.downloadDone')); } catch { Alert.alert(t('common.download'), t('detail.downloadFailed')); } finally { setDownloading(false); } }
  const onViewableItemsChanged = useRef(async ({viewableItems}: {viewableItems: ViewToken[]}) => { const first = viewableItems[0]; if (typeof first?.index !== 'number') return; setCurrentPageIndex(first.index); await saveProgress(first.index, pages.length); }).current;
  function choiceStyle(active: boolean) { return [styles.choice, {backgroundColor: active ? colors.primary : colors.surface2, borderColor: active ? colors.primary : colors.border}]; }
  function choiceTextStyle(active: boolean) { return [styles.choiceText, {color: active ? '#fff' : colors.text}]; }
  useEffect(() => { loadPages(dataSaver); }, [chapter.id]);
  useEffect(() => { scrollToInitialPage(); }, [pages.length, initialPageIndex]);
  useEffect(() => { isChapterDownloaded(chapter.id).then(setDownloaded).catch(() => {}); }, [chapter.id]);

  return (
    <View style={[styles.container, {backgroundColor: palette.bg}]}>
      {controlsVisible && <View style={[styles.topBar, {backgroundColor: palette.top}]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}><Text style={[styles.backText, {color: palette.text}]}>‹</Text></Pressable>
        <View style={styles.topInfo}><Text style={[styles.mangaTitle, {color: palette.text}]} numberOfLines={1}>{title}</Text><Text style={[styles.chapterTitle, {color: palette.muted}]} numberOfLines={1}>{chapterTitle} • {currentPageIndex + 1}/{pages.length || '?'}</Text><Text style={[styles.creditText, {color: colors.primary}]} numberOfLines={1}>{offlineMode ? t('reader.sourceOffline') : groupName ? `${t('detail.scanlationGroup')}: ${groupName}` : 'MangaDex'}</Text></View>
        <Pressable style={styles.iconButton} onPress={handleBookmark}><Text style={styles.iconText}>{bookmarked ? '🔖' : '📑'}</Text></Pressable>
        <Pressable style={styles.iconButton} onPress={() => setSettingsVisible(true)}><Text style={styles.iconText}>⚙️</Text></Pressable>
        <Pressable style={styles.iconButton} onPress={() => setControlsVisible(false)}><Text style={styles.iconText}>🙈</Text></Pressable>
        {!offlineMode && <Pressable style={styles.iconButton} onPress={handleDownload}><Text style={styles.iconText}>{downloaded ? '✅' : '⬇️'}</Text></Pressable>}
      </View>}
      {!controlsVisible && <Pressable style={[styles.showControlsButton, {backgroundColor: colors.primary}]} onPress={() => setControlsVisible(true)}><Text style={styles.showControlsText}>☰</Text></Pressable>}
      {downloading && <View style={[styles.downloadBar, {backgroundColor: palette.top}]}><Text style={[styles.downloadText, {color: colors.primary}]}>{t('common.download')}: {downloadPercent}%</Text></View>}
      {loading && <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.loadingText, {color: palette.muted}]}>{t('reader.loadingPages')}</Text></View>}
      {!!error && <View style={styles.center}><Text style={[styles.error, {color: colors.danger}]}>{error}</Text><Pressable style={[styles.retryButton, {backgroundColor: colors.primary}]} onPress={() => loadPages()}><Text style={styles.retryText}>{t('common.retry')}</Text></Pressable></View>}
      {!loading && !error && <FlatList ref={listRef} data={pages} horizontal={horizontal} pagingEnabled={horizontal} key={horizontal ? 'horizontal' : 'vertical'} keyExtractor={(item, index) => `${item}-${index}`} renderItem={({item}) => <View style={horizontal ? {width: screenWidth, paddingRight: pageGap} : {marginBottom: pageGap}}><PageImage uri={item} /></View>} initialNumToRender={2} maxToRenderPerBatch={3} windowSize={5} removeClippedSubviews onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{itemVisiblePercentThreshold: 60}} onScrollToIndexFailed={() => {}} ListEmptyComponent={<Text style={[styles.empty, {color: palette.muted}]}>{t('reader.emptyPages')}</Text>} />}
      <Modal visible={settingsVisible} transparent animationType="slide" onRequestClose={() => setSettingsVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Text style={[styles.modalTitle, {color: colors.text}]}>{t('reader.settings')}</Text>
        <Text style={[styles.optionTitle, {color: colors.text}]}>{t('reader.direction')}</Text><View style={styles.row}><Pressable style={choiceStyle(!horizontal)} onPress={() => updateReaderSettings({direction: 'vertical'})}><Text style={choiceTextStyle(!horizontal)}>{t('reader.vertical')}</Text></Pressable><Pressable style={choiceStyle(horizontal)} onPress={() => updateReaderSettings({direction: 'horizontal'})}><Text style={choiceTextStyle(horizontal)}>{t('reader.horizontal')}</Text></Pressable></View>
        <View style={styles.settingRow}><Text style={[styles.optionTitle, {color: colors.text}]}>{t('reader.quality')} ({dataSaver ? t('reader.saver') : t('reader.hd')})</Text><Switch value={!dataSaver} onValueChange={toggleQuality} thumbColor={colors.primary} /></View>
        <Text style={[styles.optionTitle, {color: colors.text}]}>{t('reader.pageGap')}: {readerSettings.pageGap}px</Text><View style={styles.row}>{[0, 8, 16, 24].map(value => { const active = readerSettings.pageGap === value; return <Pressable key={value} style={choiceStyle(active)} onPress={() => updateReaderSettings({pageGap: value})}><Text style={choiceTextStyle(active)}>{value}</Text></Pressable>; })}</View>
        <Text style={[styles.optionTitle, {color: colors.text}]}>{t('reader.theme')}</Text><View style={styles.row}>{(['black','white','sepia','gray'] as const).map(value => { const active = readerSettings.theme === value; return <Pressable key={value} style={choiceStyle(active)} onPress={() => updateReaderSettings({theme: value})}><Text style={choiceTextStyle(active)}>{t(`reader.theme${value[0].toUpperCase()}${value.slice(1)}`)}</Text></Pressable>; })}</View>
        <View style={styles.settingRow}><Text style={[styles.optionTitle, {color: colors.text}]}>{t('reader.keepAwake')}</Text><Switch value={readerSettings.keepAwake} onValueChange={value => updateReaderSettings({keepAwake: value})} thumbColor={colors.primary} /></View>
        <Pressable style={[styles.closeButton, {backgroundColor: colors.primary}]} onPress={() => setSettingsVisible(false)}><Text style={styles.closeText}>{t('common.close')}</Text></Pressable>
      </View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1}, topBar: {flexDirection: 'row', alignItems: 'center', paddingTop: 38, paddingHorizontal: 8, paddingBottom: 8}, backButton: {width: 34, height: 36, alignItems: 'center', justifyContent: 'center'}, backText: {fontSize: 34, lineHeight: 34, fontWeight: '300'}, topInfo: {flex: 1}, mangaTitle: {fontWeight: '900'}, chapterTitle: {marginTop: 3, fontSize: 12}, creditText: {marginTop: 3, fontSize: 11, fontWeight: '800'}, iconButton: {width: 34, height: 34, alignItems: 'center', justifyContent: 'center'}, iconText: {fontSize: 18}, showControlsButton: {position: 'absolute', top: 44, right: 12, zIndex: 10, width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center'}, showControlsText: {color: '#fff', fontWeight: '900', fontSize: 18}, downloadBar: {paddingVertical: 7, alignItems: 'center'}, downloadText: {fontWeight: '900', fontSize: 12}, center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24}, loadingText: {marginTop: 12}, error: {textAlign: 'center', fontWeight: '700'}, retryButton: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginTop: 14}, retryText: {color: '#fff', fontWeight: '900'}, empty: {textAlign: 'center', marginTop: 40}, modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end'}, modalCard: {borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 18}, modalTitle: {fontSize: 20, fontWeight: '900', marginBottom: 14}, optionTitle: {fontWeight: '900', marginTop: 12, marginBottom: 8}, row: {flexDirection: 'row', gap: 10, flexWrap: 'wrap'}, choice: {borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9}, choiceText: {fontWeight: '900'}, settingRow: {marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, closeButton: {borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 18}, closeText: {color: '#fff', fontWeight: '900'},
});
