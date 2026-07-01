import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import {useLibrary} from '../context/LibraryContext';
import {formatDateTime} from '../utils/manga';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HistoryScreen({navigation}: Props) {
  const {colors, t} = useAppPreferences();
  const {history, clearHistory} = useLibrary();

  function confirmClear() {
    Alert.alert(
      t('history.clearTitle'),
      t('history.clearMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: clearHistory,
        },
      ],
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={history}
        keyExtractor={item => item.chapter.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, {color: colors.text}]}>
                {t('history.title')}
              </Text>

              <Text style={[styles.subtitle, {color: colors.muted}]}>
                {t('history.subtitle')}
              </Text>
            </View>

            {history.length > 0 && (
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
                {item.pageCount} {t('common.pages')} •{' '}
                {formatDateTime(item.readAt)}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🕘"
            title={t('history.emptyTitle')}
            message={t('history.emptyMessage')}
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
    width: 70,
    height: 98,
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
});
