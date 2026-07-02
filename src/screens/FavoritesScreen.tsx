import React, {useMemo, useState} from 'react';
import {Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import EmptyState from '../components/EmptyState';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {LibraryStatus, useLibrary} from '../context/LibraryContext';
import {getChapters} from '../api/mangadex';
import {cleanChapterTitle} from '../utils/manga';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Favorites'>, NativeStackScreenProps<RootStackParamList>>;
type LibraryTab = LibraryStatus | 'bookmarks' | 'stats';
const tabs: LibraryTab[] = ['reading', 'want', 'completed', 'paused', 'favorite', 'bookmarks', 'stats'];

export default function FavoritesScreen({navigation}: Props) {
  const {colors, t} = useAppPreferences();
  const {bookmarks, favorites, readingStats, removeBookmark, removeFromLibrary, getLibraryItemsByStatus, updateFavoriteChapterInfo} = useLibrary();
  const [activeTab, setActiveTab] = useState<LibraryTab>('reading');
  const [checking, setChecking] = useState(false);
  const mangaItems = useMemo(() => activeTab === 'bookmarks' || activeTab === 'stats' ? [] : getLibraryItemsByStatus(activeTab), [activeTab, getLibraryItemsByStatus]);

  function tabLabel(tab: LibraryTab) {
    if (tab === 'bookmarks') return t('library.status.bookmarks');
    if (tab === 'stats') return t('library.status.stats');
    return t(`library.status.${tab}`);
  }

  async function checkUpdates() {
    if (checking || favorites.length === 0) return;
    try {
      setChecking(true);
      let newCount = 0;
      for (const item of favorites) {
        const chapters = await getChapters(item.manga.id, item.language);
        const latest = chapters[chapters.length - 1];
        if (!latest) continue;
        const latestTitle = cleanChapterTitle(latest.attributes.chapter, latest.attributes.title);
        const hasNew = !!item.latestKnownChapterId && item.latestKnownChapterId !== latest.id;
        if (hasNew) newCount += 1;
        await updateFavoriteChapterInfo(item.manga.id, {latestKnownChapterId: latest.id, latestKnownChapterTitle: latestTitle, hasNewChapter: hasNew || item.hasNewChapter, newChapterTitle: hasNew ? latestTitle : item.newChapterTitle});
      }
      Alert.alert(t('favorites.checkUpdates'), newCount > 0 ? `${t('favorites.newChaptersFound')} (${newCount})` : t('favorites.noNewChapters'));
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={activeTab === 'bookmarks' ? bookmarks : mangaItems}
        keyExtractor={(item: any) => activeTab === 'bookmarks' ? item.id : item.manga.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTitleBox}>
                <Text style={[styles.title, {color: colors.text}]}>{t('library.title')}</Text>
                <Text style={[styles.subtitle, {color: colors.muted}]}>{t('library.subtitle')}</Text>
              </View>
              {activeTab === 'favorite' && favorites.length > 0 && (
                <Pressable style={[styles.checkButton, {backgroundColor: colors.primary}]} onPress={checkUpdates}>
                  <Text style={styles.checkButtonText}>{checking ? t('favorites.checkingUpdates') : t('favorites.checkUpdates')}</Text>
                </Pressable>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              {tabs.map(tab => {
                const active = activeTab === tab;
                return (
                  <Pressable key={tab} style={[styles.tab, {backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border}]} onPress={() => setActiveTab(tab)}>
                    <Text style={[styles.tabText, {color: active ? '#fff' : colors.text}]}>{tabLabel(tab)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {activeTab === 'stats' && (
              <View style={styles.statsGrid}>
                <StatCard label={t('library.stats.manga')} value={readingStats.mangaCount} />
                <StatCard label={t('library.stats.chapters')} value={readingStats.chapterCount} />
                <StatCard label={t('library.stats.pages')} value={readingStats.pageCount} />
                <StatCard label={t('library.stats.bookmarks')} value={readingStats.bookmarkCount} />
              </View>
            )}
          </View>
        }
        renderItem={({item}: {item: any}) => {
          if (activeTab === 'bookmarks') {
            return (
              <Pressable style={[styles.bookmarkCard, {backgroundColor: colors.card, borderColor: colors.border}]} onPress={() => navigation.navigate('Reader', {manga: item.manga, chapter: item.chapter, title: item.mangaTitle, language: item.language, initialPageIndex: item.pageIndex})}>
                {item.pageUri ? <Image source={{uri: item.pageUri}} style={styles.bookmarkPreview} /> : item.coverUrl ? <Image source={{uri: item.coverUrl}} style={styles.bookmarkPreview} /> : <View style={[styles.bookmarkPreview, styles.noCover, {backgroundColor: colors.surface2}]}><Text style={{color: colors.muted, fontSize: 11}}>{t('common.noCover')}</Text></View>}
                <View style={styles.bookmarkInfo}>
                  <Text style={[styles.mangaTitle, {color: colors.text}]} numberOfLines={2}>{item.mangaTitle}</Text>
                  <Text style={[styles.chapterTitle, {color: colors.primary}]} numberOfLines={1}>{item.chapterTitle}</Text>
                  <Text style={[styles.meta, {color: colors.muted}]}>{t('common.pages')}: {item.pageIndex + 1}/{item.pageCount}</Text>
                  <Pressable onPress={() => removeBookmark(item.id)}><Text style={[styles.removeText, {color: colors.danger}]}>{t('common.delete')}</Text></Pressable>
                </View>
              </Pressable>
            );
          }
          return (
            <Pressable style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]} onPress={() => navigation.navigate('MangaDetail', {manga: item.manga, language: item.language})}>
              {item.coverUrl ? <Image source={{uri: item.coverUrl}} style={styles.cover} /> : <View style={[styles.cover, styles.noCover, {backgroundColor: colors.surface2}]}><Text style={{color: colors.muted, fontSize: 11}}>{t('common.noCover')}</Text></View>}
              <View style={styles.info}>
                <Text style={[styles.mangaTitle, {color: colors.text}]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.chapterTitle, {color: colors.primary}]}>{tabLabel(item.status)}</Text>
                <Pressable onPress={() => removeFromLibrary(item.manga.id)}><Text style={[styles.removeText, {color: colors.danger}]}>{t('library.removeFromLibrary')}</Text></Pressable>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={activeTab !== 'stats' ? <EmptyState icon={activeTab === 'bookmarks' ? '🔖' : '📚'} title={t('library.emptyTitle')} message={t('library.emptyMessage')} /> : null}
      />
    </View>
  );

  function StatCard({label, value}: {label: string; value: number}) {
    return <View style={[styles.statCard, {backgroundColor: colors.card, borderColor: colors.border}]}><Text style={[styles.statValue, {color: colors.primary}]}>{value}</Text><Text style={[styles.statLabel, {color: colors.muted}]}>{label}</Text></View>;
  }
}

const styles = StyleSheet.create({
  container: {flex: 1}, list: {padding: 16, paddingBottom: 24}, header: {marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12}, headerTitleBox: {flex: 1}, title: {fontSize: 28, fontWeight: '900'}, subtitle: {marginTop: 4},
  tabs: {gap: 9, paddingRight: 16, marginBottom: 16}, tab: {borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9}, tabText: {fontWeight: '900', fontSize: 12}, checkButton: {borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9}, checkButtonText: {color: '#fff', fontWeight: '900', fontSize: 12},
  card: {flexDirection: 'row', borderRadius: 18, padding: 10, marginBottom: 12, borderWidth: 1}, cover: {width: 72, height: 104, borderRadius: 14}, noCover: {alignItems: 'center', justifyContent: 'center'}, info: {flex: 1, marginLeft: 12, justifyContent: 'center'}, mangaTitle: {fontWeight: '900', fontSize: 15}, chapterTitle: {marginTop: 7, fontWeight: '800'}, meta: {marginTop: 7, fontSize: 12}, removeText: {marginTop: 8, fontWeight: '900', fontSize: 12},
  bookmarkCard: {flexDirection: 'row', borderRadius: 18, padding: 10, marginBottom: 12, borderWidth: 1}, bookmarkPreview: {width: 86, height: 126, borderRadius: 14}, bookmarkInfo: {flex: 1, marginLeft: 12, justifyContent: 'center'},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16}, statCard: {width: '47%', borderRadius: 18, borderWidth: 1, padding: 16}, statValue: {fontSize: 30, fontWeight: '900'}, statLabel: {marginTop: 6, fontWeight: '800'},
});
