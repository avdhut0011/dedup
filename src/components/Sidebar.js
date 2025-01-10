import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Sidebar() {
  const navigation = useNavigation();

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity onPress={() => navigateTo('Home')}>
        <Text style={styles.menuItem}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Scan')}>
        <Text style={styles.menuItem}>Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Results')}>
        <Text style={styles.menuItem}>Results</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Settings')}>
        <Text style={styles.menuItem}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 50, // Adjust this value based on the height of your Navbar
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    zIndex: 1,
    padding: 10,
  },
  menuItem: {
    paddingVertical: 15,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});