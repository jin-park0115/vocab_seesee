import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

export default function SavedScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>Words you starred</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Saved words list goes here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
    padding: 24,
  },
  header: {
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
  placeholder: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  placeholderText: {
    color: '#475569',
  },
});
