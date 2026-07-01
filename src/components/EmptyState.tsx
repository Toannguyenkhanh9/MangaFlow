import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useAppPreferences} from '../context/AppPreferencesContext';

type Props = {
  icon: string;
  title: string;
  message: string;
};

export default function EmptyState({icon, title, message}: Props) {
  const {colors} = useAppPreferences();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      <Text style={[styles.message, {color: colors.muted}]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  icon: {
    fontSize: 46,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
