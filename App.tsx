import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {
  AppPreferencesProvider,
} from './src/context/AppPreferencesContext';
import {LibraryProvider} from './src/context/LibraryContext';
import {initAds} from './src/services/ads';
import {endPurchases, initPurchases} from './src/services/purchases';

export default function App() {
  useEffect(() => {
    initAds();

    initPurchases().catch(() => {
      // IAP có thể chưa sẵn sàng khi chạy simulator/dev.
    });

    return () => {
      endPurchases().catch(() => {});
    };
  }, []);

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
