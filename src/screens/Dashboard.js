import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      {/* Dashboard Heading */}
      <Text style={styles.heading}>DASHBOARD STATS</Text>

      {/* Cards */}
      <View style={styles.card}>
        <Text style={styles.cardText}>Total Files</Text>
        <Text style={styles.cardNumber}>128</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardText}>Duplicate Files</Text>
        <Text style={styles.cardNumber}>42</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardText}>Storage Saved</Text>
        <Text style={styles.cardNumber}>5 GB</Text>
      </View>

      {/* Footer Button */}
      <TouchableOpacity style={styles.footerButton}>
        <Text style={styles.footerButtonText}>ANALYZE NOW</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e2a',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1a1e3a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 16,
    color: '#bbb',
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  footerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  footerButtonText: {
    color: '#0a0e2a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
