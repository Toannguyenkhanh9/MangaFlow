import React, {useState} from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useAppPreferences} from '../context/AppPreferencesContext';
import {
  APP_LANGUAGES,
  CONTENT_LANGUAGES,
  AppLanguage,
} from '../i18n/translations';
import {
  restoreBackupJson,
  shareBackup,
} from '../services/backup';

export default function SettingsScreen() {
  const {
    colors,
    appLanguage,
    contentLanguage,
    setAppLanguage,
    setContentLanguage,
    themeMode,
    toggleTheme,
    readerSettings,
    updateReaderSettings,
    t,
  } = useAppPreferences();

  const [restoreVisible, setRestoreVisible] = useState(false);
  const [restoreText, setRestoreText] = useState('');

  function openMangaDex() {
    Linking.openURL('https://mangadex.org');
  }

  function openMangaDexApiPolicy() {
    Linking.openURL('https://api.mangadex.org/docs/acceptable-usage-policy/');
  }

  async function handleExportBackup() {
    await shareBackup();
  }

  async function handleRestoreBackup() {
    try {
      await restoreBackupJson(restoreText.trim());
      setRestoreVisible(false);
      setRestoreText('');
      Alert.alert(t('settings.restoreBackup'), t('settings.restoreSuccess'));
    } catch {
      Alert.alert(t('settings.restoreBackup'), t('settings.restoreInvalid'));
    }
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: colors.text}]}>
        {t('settings.title')}
      </Text>

      <Text style={[styles.subtitle, {color: colors.muted}]}>
        {t('settings.subtitle')}
      </Text>

      <View
        style={[
          styles.card,
          {backgroundColor: colors.card, borderColor: colors.border},
        ]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>
          {t('settings.appLanguage')}
        </Text>

        <View style={styles.chipWrap}>
          {APP_LANGUAGES.map(item => {
            const active = appLanguage === item.value;

            return (
              <Pressable
                key={item.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface2,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setAppLanguage(item.value as AppLanguage)}>
                <Text
                  style={[
                    styles.chipText,
                    {color: active ? '#ffffff' : colors.text},
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.card,
          {backgroundColor: colors.card, borderColor: colors.border},
        ]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>
          {t('settings.contentLanguage')}
        </Text>

        <Text style={[styles.description, {color: colors.muted}]}>
          {t('settings.contentLanguageDesc')}
        </Text>

        <View style={styles.chipWrap}>
          {CONTENT_LANGUAGES.map(item => {
            const active = contentLanguage === item.value;

            return (
              <Pressable
                key={item.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface2,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setContentLanguage(item.value)}>
                <Text
                  style={[
                    styles.chipText,
                    {color: active ? '#ffffff' : colors.text},
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.card,
          {backgroundColor: colors.card, borderColor: colors.border},
        ]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.cardTitle, {color: colors.text}]}>
              {t('settings.darkMode')}
            </Text>

            <Text style={[styles.description, {color: colors.muted}]}>
              {t('settings.currentTheme')}:{' '}
              {themeMode === 'dark'
                ? t('settings.themeDark')
                : t('settings.themeLight')}
            </Text>
          </View>

          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            thumbColor={themeMode === 'dark' ? colors.primary : '#f4f4f5'}
            trackColor={{
              true: colors.primary2,
              false: colors.border,
            }}
          />
        </View>
      </View>

      <View
        style={[
          styles.card,
          {backgroundColor: colors.card, borderColor: colors.border},
        ]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>
          {t('settings.reader')}
        </Text>

        <Text style={[styles.optionTitle, {color: colors.text}]}>
          {t('reader.direction')}
        </Text>

        <View style={styles.chipWrap}>
          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor:
                  readerSettings.direction === 'vertical'
                    ? colors.primary
                    : colors.surface2,
              },
            ]}
            onPress={() => updateReaderSettings({direction: 'vertical'})}>
            <Text style={styles.chipTextLight}>{t('reader.vertical')}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor:
                  readerSettings.direction === 'horizontal'
                    ? colors.primary
                    : colors.surface2,
              },
            ]}
            onPress={() => updateReaderSettings({direction: 'horizontal'})}>
            <Text style={styles.chipTextLight}>{t('reader.horizontal')}</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.optionTitle, {color: colors.text}]}>
              {t('reader.quality')}:{" "}
              {readerSettings.dataSaverDefault
                ? t('reader.saver')
                : t('reader.hd')}
            </Text>
          </View>

          <Switch
            value={!readerSettings.dataSaverDefault}
            onValueChange={value =>
              updateReaderSettings({dataSaverDefault: !value})
            }
            thumbColor={colors.primary}
          />
        </View>

        <Text style={[styles.optionTitle, {color: colors.text}]}>
          {t('reader.pageGap')}: {readerSettings.pageGap}px
        </Text>

        <View style={styles.chipWrap}>
          {[0, 8, 16, 24].map(value => (
            <Pressable
              key={value}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    readerSettings.pageGap === value
                      ? colors.primary
                      : colors.surface2,
                },
              ]}
              onPress={() => updateReaderSettings({pageGap: value})}>
              <Text style={styles.chipTextLight}>{value}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.optionTitle, {color: colors.text}]}>
          {t('reader.theme')}
        </Text>

        <View style={styles.chipWrap}>
          {(['black', 'white', 'sepia', 'gray'] as const).map(value => {
            const active = readerSettings.theme === value;
            const labelKey = `reader.theme${value[0].toUpperCase()}${value.slice(1)}`;

            return (
              <Pressable
                key={value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface2,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => updateReaderSettings({theme: value})}>
                <Text
                  style={[
                    styles.chipText,
                    {color: active ? '#ffffff' : colors.text},
                  ]}>
                  {t(labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.optionTitle, {color: colors.text}]}>
              {t('reader.keepAwake')}
            </Text>
          </View>

          <Switch
            value={readerSettings.keepAwake}
            onValueChange={value =>
              updateReaderSettings({keepAwake: value})
            }
            thumbColor={colors.primary}
          />
        </View>

      </View>

      {/* <View
        style={[
          styles.card,
          {backgroundColor: colors.card, borderColor: colors.border},
        ]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>
          {t('settings.backup')}
        </Text>

        <Pressable
          style={[styles.primaryButton, {backgroundColor: colors.primary}]}
          onPress={handleExportBackup}>
          <Text style={styles.primaryButtonText}>
            {t('settings.exportBackup')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface2,
            },
          ]}
          onPress={() => setRestoreVisible(true)}>
          <Text style={[styles.secondaryButtonText, {color: colors.text}]}>
            {t('settings.restoreBackup')}
          </Text>
        </Pressable>
      </View> */}

      <View
        style={[
          styles.card,
          {backgroundColor: colors.card, borderColor: colors.border},
        ]}>
        <Text style={[styles.cardTitle, {color: colors.text}]}>
          {t('credits.title')}
        </Text>

        <Text style={[styles.description, {color: colors.muted}]}>
          {t('credits.description')}
        </Text>

        <Text style={[styles.description, {color: colors.muted}]}>
          {t('credits.scanlation')}
        </Text>

        <Pressable
          style={[styles.primaryButton, {backgroundColor: colors.primary}]}
          onPress={openMangaDex}>
          <Text style={styles.primaryButtonText}>
            {t('credits.openMangaDex')}
          </Text>
        </Pressable>
{/* 
        <Pressable
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface2,
            },
          ]}
          onPress={openMangaDexApiPolicy}>
          <Text style={[styles.secondaryButtonText, {color: colors.text}]}>
            {t('credits.policy')}
          </Text>
        </Pressable> */}
      </View>

      <Text style={[styles.footer, {color: colors.muted}]}>
        {t('settings.footer')}
      </Text>

      <Modal
        visible={restoreVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRestoreVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {backgroundColor: colors.card, borderColor: colors.border},
            ]}>
            <Text style={[styles.cardTitle, {color: colors.text}]}>
              {t('settings.restoreBackup')}
            </Text>

            <TextInput
              value={restoreText}
              onChangeText={setRestoreText}
              placeholder={t('settings.restorePlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              style={[
                styles.restoreInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                },
              ]}
            />

            <Pressable
              style={[styles.primaryButton, {backgroundColor: colors.primary}]}
              onPress={handleRestoreBackup}>
              <Text style={styles.primaryButtonText}>
                {t('common.import')}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface2,
                },
              ]}
              onPress={() => setRestoreVisible(false)}>
              <Text style={[styles.secondaryButtonText, {color: colors.text}]}>
                {t('common.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 16,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  chipText: {
    fontWeight: '800',
    fontSize: 12,
  },
  chipTextLight: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    marginTop: 14,
    fontWeight: '900',
  },
  description: {
    marginTop: 7,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    fontWeight: '900',
  },
  footer: {
    marginTop: 8,
    lineHeight: 20,
    fontSize: 12,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  restoreInput: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 160,
    padding: 12,
    marginTop: 14,
    textAlignVertical: 'top',
  },
});
