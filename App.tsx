import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {
  AppPreferencesProvider,
} from './src/context/AppPreferencesContext';
import {LibraryProvider} from './src/context/LibraryContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppPreferencesProvider>
        <LibraryProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </LibraryProvider>
      </AppPreferencesProvider>
    </SafeAreaProvider>
  );
}
