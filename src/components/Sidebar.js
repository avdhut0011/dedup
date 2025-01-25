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
      <TouchableOpacity onPress={() => navigateTo('Home')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Scan')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Results')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>Results</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Dashboard')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>Dashboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigateTo('FileMonitoring')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>File Monitoring</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('C++Testing')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>C++ Testing</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('Settings')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateTo('AboutUs')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>About Us</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo('Contacts')} style={styles.menuItemWrapper}>
        <Text style={styles.menuItem}>Contacts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 50, // Adjust based on Navbar height
    left: 0,
    width: 250, // Sidebar width
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    zIndex: 1,
    paddingVertical: 10,
    justifyContent: 'flex-start', // Aligns items from top
  },
  menuItemWrapper: {
    width: '100%', // Makes sure each button takes full width
    marginBottom: 5, // Adds space between items
  },
  menuItem: {
    width: '100%', // Ensures full-width touch area
    paddingVertical: 20, // Adds vertical spacing
    paddingHorizontal: 15, // Adds horizontal padding
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Dark text for visibility
    textAlign: 'left', // Align text to the left
    backgroundColor: '#f8f8f8', // Light background for contrast
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    // Shadow effect for both Android and iOS
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
    shadowOpacity: 0.3, // iOS shadow opacity
    shadowRadius: 4, // iOS shadow radius
  },
});
