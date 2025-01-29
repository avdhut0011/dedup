import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SettingsScreen = ({ selectedFolders, setSelectedFolders }) => {
  // List of main Android storage folders
  const mainFolders = [
    { name: 'Download', path: 'Download' },
    { name: 'DCIM', path: 'DCIM' },
    { name: 'Documents', path: 'Documents' },
    { name: 'Pictures', path: 'Pictures' },
    { name: 'Music', path: 'Music' },
  ];

  // Toggle folder selection
  const toggleFolderSelection = (folder) => {
    if (selectedFolders.includes(folder)) {
      setSelectedFolders(selectedFolders.filter((f) => f !== folder));
    } else {
      setSelectedFolders([...selectedFolders, folder]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Folders to Scan:</Text>
      {mainFolders.map((folder) => (
        <TouchableOpacity
          key={folder.path}
          style={[
            styles.folderButton,
            selectedFolders.includes(folder.path) && styles.selectedFolderButton,
          ]}
          onPress={() => toggleFolderSelection(folder.path)}
        >
          <Text style={styles.folderText}>{folder.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  folderButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFolderButton: {
    backgroundColor: '#ddd',
  },
  folderText: {
    fontSize: 16,
  },
});

export default SettingsScreen;