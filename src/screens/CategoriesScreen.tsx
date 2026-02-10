import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation';
import type {RootTabParamList} from '../navigation/Tabs';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Categories'>,
  NativeStackScreenProps<RootStackParamList>
>;

type CategoryItem = {
  key: string;
  title: string;
  icon: string;
};

type CategoryGroup = {
  title: string;
  items: CategoryItem[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: 'Basic',
    items: [
      {key: 'daily', title: 'Daily verbs', icon: '☀️'},
      {key: 'emotion', title: 'Emotion expressions', icon: '💭'},
      {key: 'adjective', title: 'Common adjectives', icon: '✨'},
    ],
  },
  {
    title: 'Situational',
    items: [
      {key: 'travel', title: 'Travel', icon: '🧳'},
      {key: 'restaurant', title: 'Restaurant', icon: '🍽️'},
      {key: 'accommodation', title: 'Accommodation', icon: '🛏️'},
      {key: 'shopping', title: 'Shopping', icon: '🛍️'},
      {key: 'transportation', title: 'Transportation', icon: '🚇'},
      {key: 'business', title: 'Business', icon: '💼'},
    ],
  },
  {
    title: 'Vibe / Taste',
    items: [
      {key: 'drama', title: 'Drama-style expressions', icon: '🎭'},
      {key: 'dating', title: 'Dating / romance expressions', icon: '💘'},
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
        <View style={styles.pillsRow}>
          {CATEGORY_GROUPS.flatMap(group => group.items).map(item => (
            <Pressable
              key={item.key}
              style={styles.pill}
              onPress={() =>
                navigation.navigate('CategoryWords', {
                  categoryKey: item.key,
                  title: item.title,
                })
              }>
              <View style={styles.iconBadge}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.pillText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf6ef',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#3b2f2b',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8f847b',
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: '#efe4d7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  iconBadge: {
    height: 30,
    width: 30,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b2f2b',
  },
});
