import React from 'react';
import {Text} from 'react-native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from './types';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import OfflineScreen from '../screens/OfflineScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {useAppPreferences} from '../context/AppPreferencesContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

function iconFor(routeName: keyof MainTabParamList) {
  switch (routeName) {
    case 'Home':
      return '🏠';
    case 'Favorites':
      return '📚';
    case 'Offline':
      return '⬇️';
    case 'History':
      return '🕘';
    case 'Settings':
      return '⚙️';
    default:
      return '•';
  }
}

export default function MainTabs() {
  const {colors, t} = useAppPreferences();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tab,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({focused}) => (
          <Text style={{fontSize: focused ? 22 : 19}}>
            {iconFor(route.name)}
          </Text>
        ),
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: t('tabs.home')}}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{title: t('tabs.library')}}
      />
      <Tab.Screen
        name="Offline"
        component={OfflineScreen}
        options={{title: t('tabs.offline')}}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{title: t('tabs.history')}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: t('tabs.settings')}}
      />
    </Tab.Navigator>
  );
}
