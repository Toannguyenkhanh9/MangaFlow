import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {MangaItem} from '../api/mangadex';
import {
  getMangaCoverUrl,
  getMangaTitle,
} from '../api/mangadex';
import {useAppPreferences} from '../context/AppPreferencesContext';

type Props = {
  manga: MangaItem;
  language: string;
  savedLabel?: string;
  onPress: () => void;
};

export default function MangaCard({
  manga,
  language,
  savedLabel,
  onPress,
}: Props) {
  const {colors} = useAppPreferences();
  const coverUrl = getMangaCoverUrl(manga, 256);
  const title = getMangaTitle(manga, language);

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={onPress}>
      {coverUrl ? (
        <Image source={{uri: coverUrl}} style={styles.cover} />
      ) : (
        <View style={[styles.cover, {backgroundColor: colors.surface2}]}>
          <Text style={[styles.noCoverText, {color: colors.muted}]}>
            No Cover
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text numberOfLines={2} style={[styles.title, {color: colors.text}]}>
          {title}
        </Text>

        <Text style={[styles.meta, {color: colors.muted}]}>
          {manga.attributes.status || 'unknown'}
          {manga.attributes.year ? ` • ${manga.attributes.year}` : ''}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.rating, {color: colors.primary}]}>
            {manga.attributes.contentRating || 'safe'}
          </Text>

          {!!savedLabel && (
            <Text style={[styles.savedLabel, {color: colors.muted}]}>
              {savedLabel}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },
  cover: {
    width: 82,
    height: 116,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCoverText: {
    fontSize: 11,
  },
  info: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    marginTop: 8,
    textTransform: 'capitalize',
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  savedLabel: {
    fontSize: 11,
  },
});
