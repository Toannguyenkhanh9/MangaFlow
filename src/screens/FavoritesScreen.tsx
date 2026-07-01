import React from 'react';
import {
  FlatList,
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
import MangaCard from '../components/MangaCard';
import EmptyState from '../components/EmptyState';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {useLibrary} from '../context/LibraryContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FavoritesScreen({navigation}: Props) {
  const {colors, t} = useAppPreferences();
  const {favorites, removeFavorite} = useLibrary();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={favorites}
        keyExtractor={item => item.manga.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, {color: colors.text}]}>
              {t('favorites.title')}
            </Text>

            <Text style={[styles.subtitle, {color: colors.muted}]}>
              {t('favorites.subtitle')}
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <View>
            <MangaCard
              manga={item.manga}
              language={item.language}
              savedLabel={t('common.saved')}
              onPress={() =>
                navigation.navigate('MangaDetail', {
                  manga: item.manga,
                  language: item.language,
                })
              }
            />

            <Pressable
              style={styles.removeButton}
              onPress={() => removeFavorite(item.manga.id)}>
              <Text style={[styles.removeText, {color: colors.danger}]}>
                {t('favorites.remove')}
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="❤️"
            title={t('favorites.emptyTitle')}
            message={t('favorites.emptyMessage')}
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
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: -4,
  },
  removeText: {
    fontWeight: '800',
    fontSize: 12,
  },
});
