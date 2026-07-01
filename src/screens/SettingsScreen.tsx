import React, {useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {APP_LANGUAGES, CONTENT_LANGUAGES, AppLanguage} from '../i18n/translations';
import {buyRemoveAds, restoreRemoveAds, REMOVE_ADS_PRODUCT_ID} from '../services/purchases';

export default function SettingsScreen() {
  const {colors, appLanguage, contentLanguage, setAppLanguage, setContentLanguage, themeMode, toggleTheme, removeAds, setRemoveAds, t} = useAppPreferences();
  const [purchasing, setPurchasing] = useState(false);

  async function handleBuyRemoveAds() {
    try {
      setPurchasing(true);
      const ok = await buyRemoveAds();
      if (ok) await setRemoveAds(true);
    } catch {
      Alert.alert(t('settings.iapDisabledTitle'), t('settings.iapDisabledMessage'));
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    try {
      setPurchasing(true);
      const restored = await restoreRemoveAds();
      if (restored) await setRemoveAds(true);
    } catch {
      Alert.alert(t('settings.iapDisabledTitle'), t('settings.iapDisabledMessage'));
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: colors.text}]}>{t('settings.title')}</Text>
      <Text style={[styles.subtitle, {color: colors.muted}]}>{t('settings.subtitle')}</Text>

      <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>{t('settings.appLanguage')}</Text>
        <View style={styles.chipWrap}>
          {APP_LANGUAGES.map(item => {
            const active = appLanguage === item.value;
            return (
              <Pressable key={item.value} style={[styles.chip, {backgroundColor: active ? colors.primary : colors.surface2, borderColor: active ? colors.primary : colors.border}]} onPress={() => setAppLanguage(item.value as AppLanguage)}>
                <Text style={[styles.chipText, {color: active ? '#ffffff' : colors.text}]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>{t('settings.contentLanguage')}</Text>
        <Text style={[styles.description, {color: colors.muted}]}>{t('settings.contentLanguageDesc')}</Text>
        <View style={styles.chipWrap}>
          {CONTENT_LANGUAGES.map(item => {
            const active = contentLanguage === item.value;
            return (
              <Pressable key={item.value} style={[styles.chip, {backgroundColor: active ? colors.primary : colors.surface2, borderColor: active ? colors.primary : colors.border}]} onPress={() => setContentLanguage(item.value)}>
                <Text style={[styles.chipText, {color: active ? '#ffffff' : colors.text}]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.cardTitle, {color: colors.text}]}>{t('settings.darkMode')}</Text>
            <Text style={[styles.description, {color: colors.muted}]}>{t('settings.currentTheme')}: {themeMode === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}</Text>
          </View>
          <Switch value={themeMode === 'dark'} onValueChange={toggleTheme} thumbColor={themeMode === 'dark' ? colors.primary : '#f4f4f5'} trackColor={{true: colors.primary2, false: colors.border}} />
        </View>
      </View>

      <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>{t('settings.ads')}</Text>
        <Text style={[styles.description, {color: colors.muted}]}>{removeAds ? t('settings.adsOff') : t('settings.adsOn')}</Text>
        <Text style={[styles.productId, {color: colors.muted}]}>Product ID: {REMOVE_ADS_PRODUCT_ID}</Text>
        {purchasing ? <ActivityIndicator color={colors.primary} style={styles.purchaseLoading} /> : (
          <>
            <Pressable disabled={removeAds} style={[styles.primaryButton, {backgroundColor: removeAds ? colors.success : colors.primary, opacity: removeAds ? 0.75 : 1}]} onPress={handleBuyRemoveAds}>
              <Text style={styles.primaryButtonText}>{removeAds ? t('settings.adsOff') : t('settings.removeAds')}</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, {borderColor: colors.border, backgroundColor: colors.surface2}]} onPress={handleRestore}>
              <Text style={[styles.secondaryButtonText, {color: colors.text}]}>{t('settings.restore')}</Text>
            </Pressable>
            {__DEV__ && <Pressable style={styles.devButton} onPress={() => setRemoveAds(!removeAds)}><Text style={[styles.devText, {color: colors.primary}]}>{t('settings.devToggle')}</Text></Pressable>}
          </>
        )}
      </View>

      <Text style={[styles.footer, {color: colors.muted}]}>{t('settings.footer')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {padding: 16, paddingBottom: 32},
  title: {fontSize: 30, fontWeight: '900'},
  subtitle: {marginTop: 5, marginBottom: 16},
  card: {borderRadius: 22, borderWidth: 1, padding: 16, marginBottom: 14},
  cardTitle: {fontSize: 17, fontWeight: '900'},
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 14},
  chip: {borderRadius: 999, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13},
  chipText: {fontWeight: '800', fontSize: 12},
  row: {flexDirection: 'row', alignItems: 'center'},
  rowText: {flex: 1, paddingRight: 12},
  description: {marginTop: 7, lineHeight: 20},
  productId: {marginTop: 8, fontSize: 12},
  purchaseLoading: {marginTop: 18},
  primaryButton: {borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 16},
  primaryButtonText: {color: '#ffffff', fontWeight: '900'},
  secondaryButton: {borderRadius: 16, borderWidth: 1, paddingVertical: 13, alignItems: 'center', marginTop: 10},
  secondaryButtonText: {fontWeight: '900'},
  devButton: {alignItems: 'center', paddingVertical: 12},
  devText: {fontWeight: '900', fontSize: 12},
  footer: {marginTop: 8, lineHeight: 20, fontSize: 12, textAlign: 'center'},
});
