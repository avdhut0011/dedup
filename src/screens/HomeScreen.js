import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const pastResults = [
  { id: '1', result: 'Result 1' },
  { id: '2', result: 'Result 2' },
  { id: '3', result: 'Result 3' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.scanButton}>
        <Text style={styles.scanButtonText}>Scan</Text>
      </TouchableOpacity>
      <Text style={styles.pastResultsTitle}>Past Results</Text>
      <FlatList
        data={pastResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text>{item.result}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pastResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
});