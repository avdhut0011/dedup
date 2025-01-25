import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
  // States for toggles
  const [darkMode, setDarkMode] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [saveLogs, setSaveLogs] = useState(false);

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
        <Text style={styles.optionText}>ENABLE PERMISSION</Text>
        <Switch
          value={permissions}
          onValueChange={setPermissions}
          trackColor={{ false: '#555', true: '#d32f2f' }}
          thumbColor={permissions ? 'white' : 'gray'}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.optionText}>ENABLE SAVE LOGS</Text>
        <Switch
          value={saveLogs}
          onValueChange={setSaveLogs}
          trackColor={{ false: '#555', true: '#d32f2f' }}
          thumbColor={saveLogs ? 'white' : 'gray'}
        />
      </View>
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
    textAlign: 'left',
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1e3a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  optionText: {
    fontSize: 16,
    color: 'white',
  },
});
