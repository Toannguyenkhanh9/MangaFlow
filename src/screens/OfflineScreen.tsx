import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../navigation/types';
import EmptyState from '../components/EmptyState';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {
  clearAllOfflineChapters,
  deleteOfflineChapter,
  formatBytes,
  listOfflineChapters,
  OfflineChapter,
} from '../services/downloads';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Offline'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function OfflineScreen({navigation}: Props) {
  const {colors, t} = useAppPreferences();
  const [items, setItems] = useState<OfflineChapter[]>([]);

  async function load() {
    const data = await listOfflineChapters();
    setItems(data);
  }

  function confirmDelete(item: OfflineChapter) {
    Alert.alert(
      t('offline.deleteTitle'),
      t('offline.deleteMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteOfflineChapter(item.chapterId);
            await load();
          },
        },
      ],
    );
  }

  function confirmClear() {
    Alert.alert(
      t('offline.clearAll'),
      t('history.clearMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await clearAllOfflineChapters();
            await load();
          },
        },
      ],
    );
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={items}
        keyExtractor={item => item.chapterId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Text style={[styles.title, {color: colors.text}]}>
                {t('offline.title')}
              </Text>

              <Text style={[styles.subtitle, {color: colors.muted}]}>
                {t('offline.subtitle')}
              </Text>
            </View>

            {items.length > 0 && (
              <Pressable onPress={confirmClear}>
                <Text style={[styles.clearText, {color: colors.danger}]}>
                  {t('common.clear')}
                </Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              navigation.navigate('Reader', {
                manga: item.manga,
                chapter: item.chapter,
                title: item.mangaTitle,
                language: item.language,
                offlinePages: item.pages,
                offlineMode: true,
              })
            }>
            {item.coverUrl ? (
              <Image source={{uri: item.coverUrl}} style={styles.cover} />
            ) : (
              <View
                style={[
                  styles.cover,
                  styles.noCover,
                  {backgroundColor: colors.surface2},
                ]}>
                <Text style={{color: colors.muted, fontSize: 11}}>
                  {t('common.noCover')}
                </Text>
              </View>
            )}

            <View style={styles.info}>
              <Text
                style={[styles.mangaTitle, {color: colors.text}]}
                numberOfLines={2}>
                {item.mangaTitle}
              </Text>

              <Text
                style={[styles.chapterTitle, {color: colors.primary}]}
                numberOfLines={1}>
                {item.chapterTitle}
              </Text>

              <Text style={[styles.meta, {color: colors.muted}]}>
                {item.pageCount} {t('common.pages')} • {t('offline.size')}:{' '}
                {formatBytes(item.totalBytes)}
              </Text>

              <Pressable
                style={styles.deleteButton}
                onPress={() => confirmDelete(item)}>
                <Text style={[styles.deleteText, {color: colors.danger}]}>
                  {t('common.delete')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="⬇️"
            title={t('offline.emptyTitle')}
            message={t('offline.emptyMessage')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleBox: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
  },
  clearText: {
    fontWeight: '900',
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  cover: {
    width: 72,
    height: 104,
    borderRadius: 14,
  },
  noCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  mangaTitle: {
    fontWeight: '900',
    fontSize: 15,
  },
  chapterTitle: {
    marginTop: 7,
    fontWeight: '800',
  },
  meta: {
    marginTop: 7,
    fontSize: 12,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteText: {
    fontWeight: '900',
    fontSize: 12,
  },
});
