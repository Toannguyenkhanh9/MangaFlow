import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useAppPreferences} from '../context/AppPreferencesContext';

export default function SkeletonCard() {
  const {colors} = useAppPreferences();

  return (
    <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
      <View style={[styles.cover, {backgroundColor: colors.surface2}]} />
      <View style={styles.info}>
        <View style={[styles.lineLarge, {backgroundColor: colors.surface2}]} />
        <View style={[styles.line, {backgroundColor: colors.surface2}]} />
        <View style={[styles.lineSmall, {backgroundColor: colors.surface2}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {flexDirection: 'row', borderRadius: 18, padding: 10, marginBottom: 12, borderWidth: 1},
  cover: {width: 82, height: 116, borderRadius: 14},
  info: {flex: 1, marginLeft: 12, justifyContent: 'center'},
  lineLarge: {height: 18, width: '82%', borderRadius: 999},
  line: {height: 13, width: '58%', borderRadius: 999, marginTop: 14},
  lineSmall: {height: 11, width: '36%', borderRadius: 999, marginTop: 12},
});
