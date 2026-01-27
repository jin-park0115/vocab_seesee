import React, {useEffect, useState} from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  pickNextWidgetWord,
  writeWidgetSnapshot,
} from '../widgets/widgetSnapshot';
import {
  getSelectedCategories,
  getSelectedLanguages,
  setSelectedCategories,
  setSelectedLanguages,
  type Lang,
} from '../features/settings/repository';

const LANGUAGE_OPTIONS: {label: string; value: Lang}[] = [
  {label: 'English', value: 'en'},
  {label: 'Japanese', value: 'ja'},
];

const CATEGORY_OPTIONS = [
  {label: 'Travel', value: 'travel'},
  {label: 'Restaurant', value: 'food'},
  {label: 'Daily', value: 'daily'},
  {label: 'Emotions', value: 'emotion'},
];

export default function SettingsScreen(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguages, setSelectedLanguagesState] = useState<Lang[]>([]);
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(
    [],
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const [langs, categories] = await Promise.all([
        getSelectedLanguages(),
        getSelectedCategories(),
      ]);
      if (!isMounted) {
        return;
      }
      setSelectedLanguagesState(langs);
      setSelectedCategoriesState(categories ?? []);
      setIsLoading(false);
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateWidget = async () => {
    setIsUpdating(true);
    setStatus(null);
    try {
      const nextWord = await pickNextWidgetWord();
      if (!nextWord) {
        setStatus('No available word for the widget.');
        return;
      }
      await writeWidgetSnapshot(nextWord);
      setStatus(`Widget updated: ${nextWord.word}`);
    } catch (error) {
      setStatus('Failed to update the widget.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLanguage = async (lang: Lang) => {
    const isSelected = selectedLanguages.includes(lang);
    const next = isSelected
      ? selectedLanguages.filter(item => item !== lang)
      : [...selectedLanguages, lang];

    if (next.length === 0) {
      Alert.alert('At least one language is required');
      return;
    }

    setSelectedLanguagesState(next);
    await setSelectedLanguages(next);
  };

  const handleToggleCategory = async (category: string) => {
    const isSelected = selectedCategories.includes(category);
    const next = isSelected
      ? selectedCategories.filter(item => item !== category)
      : [...selectedCategories, category];
    setSelectedCategoriesState(next);
    await setSelectedCategories(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.sectionCaption}>
            Choose at least one language.
          </Text>
          <View style={styles.optionList}>
            {LANGUAGE_OPTIONS.map(option => {
              const selected = selectedLanguages.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleToggleLanguage(option.value)}
                  disabled={isLoading}
                  style={({pressed}) => [
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionIndicator}>
                    {selected ? '[x]' : '[ ]'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.sectionCaption}>
            Leave empty to include all categories.
          </Text>
          <View style={styles.categoryList}>
            {CATEGORY_OPTIONS.map(option => {
              const selected = selectedCategories.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleToggleCategory(option.value)}
                  disabled={isLoading}
                  style={({pressed}) => [
                    styles.categoryPill,
                    selected && styles.categoryPillSelected,
                    pressed && styles.categoryPillPressed,
                  ]}>
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Widget</Text>
          <Text style={styles.sectionCaption}>
            Debug button to refresh the widget snapshot.
          </Text>
          <Pressable
            onPress={handleUpdateWidget}
            disabled={isUpdating}
            style={({pressed}) => [
              styles.button,
              pressed && styles.buttonPressed,
              isUpdating && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonText}>
              {isUpdating ? 'Updating...' : 'Update Widget Now'}
            </Text>
          </Pressable>
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  section: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionCaption: {
    fontSize: 12,
    color: '#64748b',
  },
  optionList: {
    gap: 8,
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowSelected: {
    borderColor: '#0f172a',
  },
  optionRowPressed: {
    opacity: 0.85,
  },
  optionLabel: {
    fontSize: 14,
    color: '#0f172a',
  },
  optionIndicator: {
    fontSize: 12,
    color: '#0f172a',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  categoryPillSelected: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  categoryPillPressed: {
    opacity: 0.8,
  },
  categoryText: {
    fontSize: 12,
    color: '#0f172a',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
});
