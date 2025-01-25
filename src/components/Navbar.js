import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Navbar({ toggleSidebar }) {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={toggleSidebar}>
        <Text style={styles.menuButton}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.title}>DupliHash</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 50,
    backgroundColor: '#0a0e2a',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  menuButton: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});