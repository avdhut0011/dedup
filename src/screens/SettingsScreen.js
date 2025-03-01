import React, { useEffect, useState } from 'react';
import { View, Text, Button, NativeEventEmitter, NativeModules, StyleSheet, FlatList, AppState, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SSDeepTurboModule from '../../specs/NativeSSDeepModule';
import RNFS from 'react-native-fs';
import SQLite from 'react-native-sqlite-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { G } from 'react-native-svg';

const { DirectoryMonitor } = NativeModules;
const db = SQLite.openDatabase({ name: 'filehashes.db', location: 'default' });

const SettingsScreen = () => {
  const [availableDirectories, setAvailableDirectories] = useState({});
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [monitoredDirectories, setMonitoredDirectories] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);

  // Load selectedDirectory & monitoredDirectories when app starts
  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const storedDirectory = await AsyncStorage.getItem('selectedDirectory');
        const storedMonitoredDirs = await AsyncStorage.getItem('monitoredDirectories');

        if (storedDirectory) setSelectedDirectory(storedDirectory);
        if (storedMonitoredDirs) setMonitoredDirectories(JSON.parse(storedMonitoredDirs));
      } catch (error) {
        console.error('Error retrieving stored data:', error);
      }
    };
    fetchStoredData();
  }, []);
  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        const dirsJson = await DirectoryMonitor.getAvailableDirectories();
        const dirs = JSON.parse(dirsJson);
        setAvailableDirectories(dirs);

        if (!selectedDirectory) {
          const firstDir = Object.values(dirs)[0] || '';
          setSelectedDirectory(firstDir);
          await AsyncStorage.setItem('selectedDirectory', firstDir);
        }
      } catch (error) {
        console.error('Error fetching directories:', error);
      }
    };
    fetchDirectories();

    // const directoryMonitorEvents = new NativeEventEmitter(DirectoryMonitor);
    // const subscription = directoryMonitorEvents.addListener('FileChangeEvent', (event) => {
    //   console.log('File Change Detected:', event);
    // });

    // return () => subscription.remove();
  }, []);
  // Detect App Termination (Clear Data When Fully Closed)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }

      // If app is terminated or removed from recents, clear the session data
      if (nextAppState === 'inactive') {
        console.log('App is closing, clearing session storage...');
        await AsyncStorage.removeItem('selectedDirectory');
        await AsyncStorage.removeItem('monitoredDirectories');
      }

      setAppState(nextAppState);
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    return () => appStateListener.remove();
  }, [appState]);
  // Save selected directory & update monitored directories
  const handleDirectoryChange = async (itemValue) => {
    setSelectedDirectory(itemValue);
    await AsyncStorage.setItem('selectedDirectory', itemValue);
  };
  const startMonitoring = async () => {
    if (selectedDirectory) {
      DirectoryMonitor.startMonitoring(selectedDirectory);
      console.log('Started monitoring:', selectedDirectory);

      const updatedMonitoredDirs = [...new Set([...monitoredDirectories, selectedDirectory])];
      setMonitoredDirectories(updatedMonitoredDirs);

      await AsyncStorage.setItem('monitoredDirectories', JSON.stringify(updatedMonitoredDirs));
    }
  };
  const stopMonitoring = async (directory) => {
    DirectoryMonitor.stopMonitoring(directory);
    console.log('Stopped monitoring:', directory);

    const updatedMonitoredDirs = monitoredDirectories.filter((dir) => dir !== directory);
    setMonitoredDirectories(updatedMonitoredDirs);

    await AsyncStorage.setItem('monitoredDirectories', JSON.stringify(updatedMonitoredDirs));
  };

  const getFileExtension = filePath => {
    return filePath.split('.').pop().toLowerCase();
  };
  const displayNotification = async (title, count) => {
    // Create a channel for Android notifications
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
    // Display the notification
    await notifee.displayNotification({
      title: `<b>${title}</b>`,
      body: ` ${count} Similar file(s) were detected.`,
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher', // Ensure the icon exists in your project
        actions: [
          {
            title: 'View',
            pressAction: {
              id: 'view',
            },
          },
          {
            title: 'Ignore',
            pressAction: {
              id: 'ignore',
            },
          },
          {
            title: 'Delete',
            pressAction: {
              id: 'delete',
            },
          },
        ],
      },
      data: {
        count: count,
      },
    });
  };
  const computeAndCompareHash = async filePath => {
    try {
      // Get file metadata (size, name)
      const fileInfo = await RNFS.stat(filePath);
      const fileSizeKB = (fileInfo.size / 1024).toFixed(2); // Convert to KB
      const fileName = filePath.split('/').pop(); // Extract file name
      const filetype = await getFileExtension(filePath);

      // Compute the hash of the new file
      const hash = SSDeepTurboModule.hashFile(filePath);
      console.log(hash)

      // Fetch all relevant hashes from the database
      const hashes = await fetchHashesFromDatabase(filetype);
      console.log(hashes)

      // Compare the new hash with the array of hashes
      const threshold = 55; // Set your threshold here
      const results = SSDeepTurboModule.compareHashWithArray(
        hash,
        hashes,
        threshold,
      );
      console.log(results);
      if (results.length > 0) {
        const similarFilesWithPath = await similarFilesPath(results);
        console.log(similarFilesWithPath);
        Alert.alert(
          'Duplicate Found',
          `${similarFilesWithPath.length} similar files found.`,
        );
        await displayNotification(
          'Duplicate files detected',
          similarFilesWithPath.length,
        );
        for (const result of results) {
          console.log('In for loop')
          const originalFileHash = result.hash; // Hash of the original file
          const similarityScore = result.similarity; // Similarity score
          // Fetch the original file's ID from the database
          const originalFileId = await fetchFileIdByHash(originalFileHash);
          // Insert the duplicate file into Files_Record
          const duplicateFileId = await insertHashIntoDatabase(
            filePath,
            hash,
            filetype,
            fileName,
            fileSizeKB,
          );
          // Insert the duplicate relationship into Duplicates_Record
          await insertHashIntoDuplicates(
            originalFileId,
            duplicateFileId,
            similarityScore,
          );
        }
      } else {
        Alert.alert('No Duplicates', 'No similar files found.');
        // Insert the new file's hash into the database
        await insertHashIntoDatabase(
          filePath,
          hash,
          filetype,
          fileName,
          fileSizeKB,
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to compute or compare hashes');
      console.error(error);
    }
  };
  const fetchHashesFromDatabase = filetype => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT file_hash FROM Files_Record WHERE file_type = ?',
          [filetype],
          (tx, results) => {
            const hashes = [];
            for (let i = 0; i < results.rows.length; i++) {
              hashes.push(results.rows.item(i).file_hash);
            }
            resolve(hashes);
          },
          error => {
            reject(error);
          },
        );
      });
    });
  };
  const similarFilesPath = async (results) => {
    try {
      const promises = results.map(result => {
        return new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT file_path FROM Files_Record WHERE file_hash = ?',
              [result.hash],
              (tx, queryResults) => {
                const similarFilePaths = [];
                for (let i = 0; i < queryResults.rows.length; i++) {
                  similarFilePaths.push({
                    filepath: queryResults.rows.item(i).file_path,
                    similarity: result.similarity,
                  });
                }
                resolve(similarFilePaths);
              },
              error => {
                reject(error);
              },
            );
          });
        });
      });

      // Wait for all promises to resolve and flatten the results
      const resolvedResults = await Promise.all(promises);
      return resolvedResults.flat(); // Flatten the nested arrays into a single array
    } catch (error) {
      console.error('Error fetching file paths:', error);
      return [];
    }
  };
  const fetchFileIdByHash = hash => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT id FROM Files_Record WHERE file_hash = ?',
          [hash],
          (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0).id);
            } else {
              reject(new Error('File not found in database'));
            }
          },
          error => reject(error),
        );
      });
    });
  };
  const insertHashIntoDatabase = (
    filePath,
    hash,
    fileType,
    fileName,
    fileSizeKB,
  ) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO Files_Record (file_name, file_type, file_path, file_size, file_hash) VALUES (?, ?, ?, ?, ?)',
          [fileName, fileType, filePath, fileSizeKB, hash],
          (tx, results) => {
            resolve(results.insertId); // Return the ID of the inserted record
          },
          error => reject(error),
        );
      });
    });
  };
  const insertHashIntoDuplicates = (
    original_fid,
    duplicate_fid,
    similarity_score,
  ) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO Duplicates_Record (original_fid, duplicate_fid, similarity_score) VALUES (?, ?, ?)',
          [original_fid, duplicate_fid, similarity_score],
          () => resolve(),
          error => reject(error),
        );
      });
    });
  };
  const deleteFileRecord = filePath => {
    db.transaction(tx => {
      // First, get the file ID from Files_Record
      tx.executeSql(
        `SELECT id FROM Files_Record WHERE file_path = ?`,
        [filePath],
        (_, result) => {
          if (result.rows.length > 0) {
            const fileId = result.rows.item(0).id;

            // Delete any entries from Duplicates_Record referencing this file
            tx.executeSql(
              `DELETE FROM Duplicates_Record WHERE original_fid = ? OR duplicate_fid = ?`,
              [fileId, fileId],
              () =>
                console.log(`Duplicates involving file ID ${fileId} removed`),
              error =>
                console.error('Error deleting from Duplicates_Record:', error),
            );

            // Delete from Files_Record
            tx.executeSql(
              `DELETE FROM Files_Record WHERE id = ?`,
              [fileId],
              () => console.log(`File record with ID ${fileId} deleted`),
              error =>
                console.error('Error deleting from Files_Record:', error),
            );
          } else {
            console.warn('File record not found in database.');
          }
        },
        error => console.error('Error retrieving file ID:', error),
      );
    });
  };
  useEffect(() => {
    const directoryMonitorEvents = new NativeEventEmitter(DirectoryMonitor);
    const subscription = directoryMonitorEvents.addListener(
      'FileChangeEvent',
      event => {
        const [eventType, filePath] = event.split(':');
        console.log('File change detected:', event);
        // Process changes
        if (eventType == 'CREATE') {
          console.log('computeAndComparing new file hash')
          computeAndCompareHash(filePath);
        } else if (eventType == 'MOVED_TO') {
          console.log('computeAndComparing new file hash')
          computeAndCompareHash(filePath);
        } else if (eventType == 'DELETE') {
          deleteFileRecord(filePath);
        } else {
        }
      },
    );

    return () => subscription.remove();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SETTINGS</Text>
      <Text style={styles.title}>Select Directory(s) for Automatic Duplicate File Detection</Text>

      <Picker
        selectedValue={selectedDirectory}
        style={styles.picker}
        onValueChange={handleDirectoryChange}
      >
        {Object.entries(availableDirectories).map(([key, value]) => (
          <Picker.Item key={key} label={key} value={value} />
        ))}
      </Picker>

      <Button title="Start Monitoring" onPress={startMonitoring} color="#000000" />

      <Text style={styles.subtitle}>Monitored Directories:</Text>
      <FlatList
        data={monitoredDirectories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.monitoredDirectory}>
            <Text>{item}</Text>
            <Button title="Stop" onPress={() => stopMonitoring(item)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noDirectoryText}>No directories being monitored</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e2a',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    backgroundColor: '#1e2240',
    color: 'white',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  monitoredDirectory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e2240',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  noDirectoryText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SettingsScreen;
