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
        <Text style={styles.scanButtonText}>SCAN FILES</Text>
      </TouchableOpacity>
      <Text style={styles.pastResultsTitle}>VIEW SCAN RESULTS</Text>
      {/* <FlatList
        data={pastResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text>{item.result}</Text>
          </View>
        )}
      /> */}

      {/* Dashboard Stats Box */}
      <View style={styles.dashboardBox}>
        <Text style={styles.dashboardTitle}>DASHBOARD STATS</Text>
        
      </View>
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
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
    pastResultsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      textAlign: 'center',
      width: '90%',
      alignSelf: 'center',
    }
  ,
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  dashboardBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
});