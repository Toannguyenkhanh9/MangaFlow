import React from 'react';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import MainTabs from './MainTabs';
import MangaDetailScreen from '../screens/MangaDetailScreen';
import ReaderScreen from '../screens/ReaderScreen';
import {useAppPreferences} from '../context/AppPreferencesContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {colors} = useAppPreferences();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '900',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MangaDetail"
        component={MangaDetailScreen}
        options={{
          title: 'Chi tiết',
        }}
      />

      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{
          title: 'Đọc truyện',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
