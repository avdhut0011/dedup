import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AboutUsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>ABOUT US</Text>
      <Text style={styles.content}>
        Welcome to Dedup, your solution for efficient storage management. Our app helps
        you identify and remove duplicate files, freeing up space and optimizing performance.
      </Text>
      <Text style={styles.content}>
        Our mission is to provide a seamless and secure way to manage your files 
        with cutting-edge technology. We value efficiency, simplicity, and user 
        experience at the core of our development.
      </Text>
      <Text style={styles.footer}>© 2025 Dedup. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e2a',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  content: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  footer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
