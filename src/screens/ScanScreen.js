import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';

const ScanScreen = ({ selectedFolders }) => {
  const [files, setFiles] = useState([]);

  // Fetch files from selected folders
  const fetchFiles = async () => {
    try {
      const externalStoragePath = RNFS.ExternalStorageDirectoryPath; // Path to external storage
      let allFiles = [];

      // Loop through selected folders and fetch files
      for (const folder of selectedFolders) {
        console.log(folder);
        
        const folderPath = `${externalStoragePath}/${folder}`;
        const folderFiles = await RNFS.readDir(folderPath); // List files in the folder
        allFiles = [...allFiles, ...folderFiles];
      }

      setFiles(allFiles);
    } catch (error) {
      console.error('Error reading files:', error);
    }
  };

  useEffect(() => {
    if (selectedFolders.length > 0) {
      fetchFiles();
    }
  }, [selectedFolders]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Files in Selected Folders:</Text>
      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text style={styles.fileName}>{item.name}</Text>
            <Text style={styles.filePath}>{item.path}</Text>
          </View>
        )}
      />
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
  fileItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fileName: {
    fontSize: 16,
  },
  filePath: {
    fontSize: 12,
    color: '#666',
  },
});

export default ScanScreen;