import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Tabs'>;

type CategoryItem = {
  key: string;
  title: string;
};

type CategoryGroup = {
  title: string;
  items: CategoryItem[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: 'Basic',
    items: [
      {key: 'daily', title: 'Daily verbs'},
      {key: 'emotion', title: 'Emotion expressions'},
      {key: 'adjective', title: 'Common adjectives'},
    ],
  },
  {
    title: 'Situational',
    items: [
      {key: 'travel', title: 'Travel'},
      {key: 'restaurant', title: 'Restaurant'},
      {key: 'accommodation', title: 'Accommodation'},
      {key: 'shopping', title: 'Shopping'},
      {key: 'transportation', title: 'Transportation'},
      {key: 'business', title: 'Business'},
    ],
  },
  {
    title: 'Vibe / Taste',
    items: [
      {key: 'drama', title: 'Drama-style expressions'},
      {key: 'dating', title: 'Dating / romance expressions'},
    ],
  },
];

export default function CategoriesScreen({
  navigation,
}: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Browse by situation or taste</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {CATEGORY_GROUPS.map(group => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map(item => (
                <Pressable
                  key={item.key}
                  style={styles.item}
                  onPress={() =>
                    navigation.navigate('CategoryWords', {
                      categoryKey: item.key,
                      title: item.title,
                    })
                  }>
                  <Text style={styles.itemText}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  header: {
    padding: 24,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  groupItems: {
    gap: 10,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  itemText: {
    fontSize: 16,
    color: '#0f172a',
  },
});
