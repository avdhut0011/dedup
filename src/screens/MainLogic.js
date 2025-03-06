import React, { useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import SSDeepTurboModule from '../../specs/NativeSSDeepModule';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import SQLite from 'react-native-sqlite-storage';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { DirectoryMonitor } = NativeModules;
const db = SQLite.openDatabase({ name: 'filehashes.db', location: 'default' });

export default function MainLogic() {
  const [filePath, setFilePath] = React.useState('');
  const [newHash, setNewHash] = React.useState('');
  const [similarFiles, setSimilarFiles] = React.useState([]);
  const [duplicates, setDuplicates] = React.useState([]);
  // Initialize the Database
  const initializeDatabase = () => {
    db.transaction(tx => {
      // Create Files_Record table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Files_Record (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              file_name TEXT NOT NULL,
              file_type TEXT NOT NULL,
              file_path TEXT NOT NULL UNIQUE,
              file_size INTEGER NOT NULL,
              file_hash TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        [],
        () => console.log('Files_Record table created successfully'),
        error => console.error('Error creating Files_Record table:', error),
      );

      // Create Duplicates_Record table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Duplicates_Record (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              original_fid INTEGER NOT NULL,
              duplicate_fid INTEGER NOT NULL,
              similarity_score INTEGER NOT NULL,
              detected_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (original_fid) REFERENCES Files_Record (id),
              FOREIGN KEY (duplicate_fid) REFERENCES Files_Record (id)
            )`,
        [],
        () => console.log('Duplicates_Record table created successfully'),
        error =>
          console.error('Error creating Duplicates_Record table:', error),
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Initial_Scan_Results (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  file_type TEXT UNIQUE,
                  total_files INTEGER,
                  duplicate_files INTEGER,
                  scan_date DATETIME DEFAULT CURRENT_TIMESTAMP
                );`,
        [],
        () => console.log('✅ Initial_Scan_Results table created'),
        (_, error) =>
          console.error('Error creating Initial_Scan_Results table:', error),
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS deleted_duplicates (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  file_name TEXT NOT NULL,
                  file_path TEXT NOT NULL,
                  file_size_kb INTEGER NOT NULL,
                  file_category TEXT,
                  similarity_percentage INTEGER,
                  deletion_date DATETIME DEFAULT CURRENT_TIMESTAMP
              );`,
        [],
        () => console.log('✅ Deleted_duplicates table created'),
        (_, error) =>
          console.error('Error creating deleted_duplicates table:', error),
      );
      // Create indexes
      tx.executeSql(
        'CREATE INDEX IF NOT EXISTS idx_files_record_file_path ON Files_Record (file_path)',
        [],
        () => console.log('Index on file_path created successfully'),
        error => console.error('Error creating index on file_path:', error),
      );
      tx.executeSql(
        'CREATE INDEX IF NOT EXISTS idx_files_record_file_type ON Files_Record (file_type)',
        [],
        () => console.log('Index on file_type created successfully'),
        error => console.error('Error creating index on file_type:', error),
      );
      tx.executeSql(
        'CREATE INDEX IF NOT EXISTS idx_duplicates_record_original_fid ON Duplicates_Record (original_fid)',
        [],
        () => console.log('Index on original_fid created successfully'),
        error => console.error('Error creating index on original_fid:', error),
      );
      tx.executeSql(
        'CREATE INDEX IF NOT EXISTS idx_duplicates_record_duplicate_fid ON Duplicates_Record (duplicate_fid)',
        [],
        () => console.log('Index on duplicate_fid created successfully'),
        error => console.error('Error creating index on duplicate_fid:', error),
      );
      tx.executeSql(
        'CREATE INDEX IF NOT EXISTS idx_duplicates_record_similarity_score ON Duplicates_Record (similarity_score)',
        [],
        () => console.log('Index on similarity_score created successfully'),
        error =>
          console.error('Error creating index on similarity_score:', error),
      );
    });
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

      console.log(fileSizeKB + ' : ', fileName + ' : ' + filetype);

      // Compute the hash of the new file
      const hash = SSDeepTurboModule.hashFile(filePath);
      console.log(hash);
      setNewHash(hash);

      // Fetch all relevant hashes from the database
      const hashes = await fetchHashesFromDatabase(filetype);

      // Compare the new hash with the array of hashes
      const threshold = 60; // Set your threshold here
      const results = SSDeepTurboModule.compareHashWithArray(
        hash,
        hashes,
        threshold,
      );
      console.log(results);
      if (results.length > 0) {
        const similarFilesWithPath = await similarFilesPath(results);
        setSimilarFiles(similarFilesWithPath);
        Alert.alert(
          'Duplicate Found',
          `${similarFilesWithPath.length} similar files found.`,
        );
        await displayNotification(
          'Duplicate files detected',
          similarFilesWithPath.length,
        );
        for (const result of results) {
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
        setSimilarFiles([]);
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
  const similarFilesPath = async results => {
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

  const fetchKnownFiles = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Files_Record',
          [],
          (_, results) => {
            const knownFiles = {};
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              knownFiles[row.id] = row.file_path; // Populate knownFiles with file paths and hash
            }
            console.log(knownFiles);
            resolve(knownFiles);
          },
          error => {
            console.error('Error fetching known files from database:', error);
            reject(error);
          },
        );
      });
    });
  };
  const fetchKnownDuplicates = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Duplicates_Record',
          [],
          (_, results) => {
            const knownFiles = {};
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              knownFiles[i+1] =
              row.original_fid + '=>' + row.duplicate_fid + ' :@: ' + row.similarity_score; // Populate knownFiles with file paths and hash
            }
            console.log(knownFiles);
            resolve(knownFiles);
          },
          error => {
            console.error('Error fetching known files from database:', error);
            reject(error);
          },
        );
      });
    });
  };
  const dropTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `DROP TABLE IF EXISTS Duplicates_Record`,
        [],
        () => console.log(`Table "Duplicates_Record" has been dropped.`),
        error =>
          console.error(`Error dropping table "Duplicates_Record":`, error),
      );
      tx.executeSql(
        `DROP TABLE IF EXISTS Files_Record`,
        [],
        () => console.log(`Table "Files_Record" has been dropped.`),
        error =>
          console.error(`Error dropping table "Files_Record":`, error),
      );
    });
  };
  const truncateDatabaseFiles = () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Files_Record',
        [],
        () =>
          console.log(
            'All records from "Files_Record" table have been cleared.',
          ),
        error => console.error('Error clearing "files" table:', error),
      );
    });
  };
  const truncateDatabaseDuplicates = () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Duplicates_Record',
        [],
        () =>
          console.log(
            'All records from "Duplicates_Record" table have been cleared.',
          ),
        error => console.error('Error clearing "files" table:', error),
      );
    });
  };
  const truncateInitDb = () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Initial_Scan_Results',
        [],
        () =>
          console.log(
            'All records from "Initial_Scan_Results" table have been cleared.',
          ),
        error => console.error('Error clearing "files" table:', error),
      );
    });
  };

  useEffect(() => {
    // dropTable();
    // initializeDatabase();
    // truncateInitDb();
    // AsyncStorage.removeItem('isFirstLaunch');
    // console.log('item removed')
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>New File Hash Comparison</Text>
        {/* <Button title="Pick File" onPress={pickFile} /> */}
        <Text>File: {filePath}</Text>
        {/* <Button title="Compute and Compare Hash" onPress={computeAndCompareHash} /> */}
        <Text>New Hash: {newHash}</Text>
        {similarFiles.length > 0 && (
          <View>
            <Text>Similar Files:</Text>
            {similarFiles.map((file, index) => (
              <Text key={index}>
                {file.filepath} - {file.similarity}% similarity
              </Text>
            ))}
          </View>
        )}
        <Button title="Truncate Files DB" onPress={truncateDatabaseFiles} />
        <Button
          title="Truncate Duplicate DB"
          onPress={truncateDatabaseDuplicates}
        />
        <Button title="Fetch Files" onPress={fetchKnownFiles} />
        <Button title="Fetch Duplicates" onPress={fetchKnownDuplicates} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});
