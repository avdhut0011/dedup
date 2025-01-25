import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, PermissionsAndroid, Platform, Alert } from 'react-native';

export default function SettingsScreen() {
  // States for toggles
  const [darkMode, setDarkMode] = useState(false);
  const [saveLogs, setSaveLogs] = useState(false);
  const [permissions, setPermissions] = useState({
    read: false,
    write: false,
    manage: false,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const readGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        const writeGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        const manageGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
        );

        setPermissions({
          read: readGranted,
          write: writeGranted,
          manage: manageGranted,
        });
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Settings Heading */}
      <Text style={styles.heading}>SETTINGS</Text>

      {/* Toggle Options */}
      <View style={styles.option}>
        <Text style={styles.optionText}>ENABLE DARK MODE</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#555', true: '#d32f2f' }}
          thumbColor={darkMode ? 'white' : 'gray'}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.optionText}>READ PERMISSION: {permissions.read ? 'GRANTED' : 'DENIED'}</Text>
      </View>
      <View style={styles.option}>
        <Text style={styles.optionText}>WRITE PERMISSION: {permissions.write ? 'GRANTED' : 'DENIED'}</Text>
      </View>
      <View style={styles.option}>
        <Text style={styles.optionText}>MANAGE PERMISSION: {permissions.manage ? 'GRANTED' : 'DENIED'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
  },
});