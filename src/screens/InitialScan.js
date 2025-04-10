import { SafeAreaView, StyleSheet, Text, View, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import SQLite from 'react-native-sqlite-storage';
import SSDeepTurboModule from '../../specs/NativeSSDeepModule';
import ScanProgressUI from '../components/ScanProgressUI';
import { useNavigation } from '@react-navigation/native';

const db = SQLite.openDatabase({ name: 'filehashes.db', location: 'default' });

export default function InitialScan() {
  const [scanBtnText, setScanBtnText] = useState('Start Files Scan');
  const [scanCompleted, setScanCompleted] = useState(false); // Track scan completion
  const navigation = useNavigation(); // Use navigation
  const [isScanning, setIsScanning] = useState(false);
  const [categoriesFinished, setCategoriesFinished] = useState([]);
  const [progress, setProgress] = useState(0); // Overall progress (0 to 1)
  const [categories, setCategories] = useState({
    text: { totalFiles: 0, duplicates: 0, scanned: 0 },
    pptx: { totalFiles: 0, duplicates: 0, scanned: 0 },
    documents: { totalFiles: 0, duplicates: 0, scanned: 0 },
    audio: { totalFiles: 0, duplicates: 0, scanned: 0 },
    pdfs: { totalFiles: 0, duplicates: 0, scanned: 0 },
    image: { totalFiles: 0, duplicates: 0, scanned: 0 },
    video: { totalFiles: 0, duplicates: 0, scanned: 0 },
  });
  const checkFirstLaunch = async () => {
    const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
    if (isFirstLaunch === null) {
      await AsyncStorage.setItem('isFirstLaunch', 'true');
      console.log('First Launch: True');
      return true;
    }
    if (isFirstLaunch === 'true') {
      console.log('Initial Scan Remaining: True');
      return true;
    }
    if (isFirstLaunch === 'false') {
      return false;
    }
  };
  const startScan = async () => {
    console.log('IN startScan')
    setIsScanning(true);
    // const isFirstLaunch = await checkFirstLaunch();
    // if (isFirstLaunch) {
      const results = await performInitialScan();
      console.log("Initial scan completed:", results);
      insertInitialScanResults(results);
      // Update button to "Results"
      setScanBtnText("Results");
      setScanCompleted(true);
      await AsyncStorage.setItem('isFirstLaunch', 'false');
    // }
    setIsScanning(false);
  };
  useEffect(() => {
    // Check if the scan was completed in the past and update UI accordingly
    checkFirstLaunch().then((isFirstLaunch) => {
      if (!isFirstLaunch) {
        setScanBtnText("Results");
        setScanCompleted(true);
      }
    });
  }, []);
  const handleButtonPress = () => {
    if (scanCompleted) {
      // Navigate to Results screen if scan is completed
      navigation.navigate("Results");
    } else {
      startScan();
    }
  };
  const fileCategories = {
    text: ['.txt'],
    pptx: ['.ppt', '.pptx'],
    documents: ['.docx', '.doc'],
    audio: ['.mp3', '.wav'],
    image: ['.jpg', '.png', '.jpeg'],
    pdfs: ['.pdf'],
    video: ['.mp4', '.mkv'],
  };
  const scanFilesInCategory = async (category, extensions) => {
    const files = [];
    const directories = [`${RNFS.ExternalStorageDirectoryPath}/Download`]; // Start from root directory
    // Define ignored directories
    const ignoredPrefixes = [
      'cn.',         // App-specific directories
      '.cache',      // Cache directories
      'cache',      // Cache directories
      '.temp',       // Temporary files
      '.thumbnails', // Thumbnail cache
      '.trashed',     // 
      'MIUI',        // Xiaomi-specific system files
      'LOST.DIR',    // Recovered lost files
      'DCIM/.thumbnails', // Image thumbnails
      'Recycle.Bin', // Windows-style recycle bin
      '.trash',      // Trash folder (Linux/Android)
      '.nomedia',    // Prevents media scanning
      'System Volume Information', // Windows system files
      'Alarms',      // Alarm sounds
      'Notifications', // Notification sounds
      'Ringtones',   // Ringtone sounds
      'obb',      // Pre-installed system 
      'data',       // Pre-installed system 
      'Podcasts'     // Pre-installed system podcasts
    ];
    while (directories.length > 0) {
      const currentDir = directories.pop();
      // Check if current directory should be ignored
      if (ignoredPrefixes.some(prefix => currentDir.split('/').pop().startsWith(prefix))) {
        // console.log(`Skipping: ${currentDir}`);
        continue; // Skip this directory
      }
      try {
        const items = await RNFS.readDir(currentDir);
        // console.log(items)
        for (const item of items) {
          if (item.isDirectory()) {
            directories.push(item.path); // Add non-ignored directories
          } else if (extensions.some(ext => item.name.endsWith(ext))) {
            files.push(item.path); // Add files that match the category
          }
        }
      } catch (error) {
        console.warn(`Error accessing ${currentDir}: ${error.message}`);
      }
    }
    return files;
  };

  const insertHashIntoDatabase = (filePath, hash, fileType, fileName, fileSizeKB) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO Files_Record (file_name, file_type, file_path, file_size, file_hash) VALUES (?, ?, ?, ?, ?)',
          [fileName, fileType, filePath, fileSizeKB, hash],
          (tx, results) => {
            resolve(results.insertId); // Return the ID of the inserted record
          },
          (error) => reject(error)
        );
      });
    });
  };
  const insertHashIntoDuplicates = (original_fid, duplicate_fid, similarity_score) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO Duplicates_Record (original_fid, duplicate_fid, similarity_score) VALUES (?, ?, ?)',
          [original_fid, duplicate_fid, similarity_score],
          () => resolve(),
          (error) => reject(error)
        );
      });
    });
  };
  const fetchFileIdByHash = (hash) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
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
          (error) => reject(error)
        );
      });
    });
  };
  const fetchHashesFromDatabase = (filetype) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
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
          (error) => {
            reject(error);
          }
        );
      });
    });
  };
  const getFileExtension = filePath => {
    return filePath.split('.').pop().toLowerCase();
  };
  const processFilesInCategory = async (filetype, files, extensions, threshold) => {
    console.log('In processFilesInCategory: ' + filetype);
    const hashes = [];
    const duplicates = [];
    for (const file of files) {
      try { 
        // Get file metadata (size, name)
        const fileInfo = await RNFS.stat(file);
        const fileSizeKB = (fileInfo.size / 1024).toFixed(2); // Convert to KB
        const fileName = file.split('/').pop(); // Extract file name
        const extension = await getFileExtension(file);
        console.log(fileName);
        // Compute SSDeep hash
        const hash = await SSDeepTurboModule.hashFile(file);
        // Fetch existing hashes for this category
        const existingHashes = await fetchHashesFromDatabase(extension);
        // Compare the hash with existing hashes
        const results = await SSDeepTurboModule.compareHashWithArray(hash, existingHashes, threshold);
        if (results.length > 0) {
          // Duplicate(s) found
          for (const result of results) {
            const originalFileHash = result.hash; // Hash of the original file
            const similarityScore = result.similarity; // Similarity score
            // Fetch the original file's ID from the database
            const originalFileId = await fetchFileIdByHash(originalFileHash);
            // Insert the duplicate file into Files_Record
            const duplicateFileId = await insertHashIntoDatabase(file, hash, extension, fileName, fileSizeKB);
            // Insert the duplicate relationship into Duplicates_Record
            await insertHashIntoDuplicates(originalFileId, duplicateFileId, similarityScore);
            duplicates.push({ file, similarity: similarityScore });
          }
        } else {
          // No duplicates found, insert into Files_Record
          await insertHashIntoDatabase(file, hash, extension, fileName, fileSizeKB);
        }
        hashes.push({ file, hash });
      } catch (error) {
        console.warn(`Error processing file: ${file}, ${error.message}`);
      }
    }
    return { hashes, duplicates };
  };

  const performInitialScan = async () => {
    const results = {};
    const storedThreshold = await AsyncStorage.getItem('similarityThreshold');
    const threshold = Number(storedThreshold);
    for (const [category, extensions] of Object.entries(fileCategories)) {
      const files = await scanFilesInCategory(category, extensions);
      console.log(files)
      const { hashes, duplicates } = await processFilesInCategory(category, files, extensions, threshold);
      console.log('processFilesInCategory done for:' + extensions)
      results[category] = {
        totalFiles: files.length,
        duplicates: duplicates.length,
        duplicateFiles: duplicates, // Store duplicates 
        files: hashes,
      };
      console.log(results)
      // Update UI with progress
      
      await updateProgress(category, files.length, duplicates.length, duplicates);
    }
    return results;
  };
  const updateProgress = (category, totalFilesCount, duplicates, duplicateFiles) => {
    categoriesFinished.push(category);
    console.log("Categories Finished Length: " + categoriesFinished.length)
    setCategories((prev) => ({
      ...prev,
      [category]: {
        totalFiles: totalFilesCount,
        duplicates,
        scanned: prev[category].scanned + 1,
        duplicateFiles, // Store duplicate file paths and similarity
      },
    }));
    // Calculate overall progress
    const totalScanned = Object.values(categories).reduce(
      (sum, cat) => sum + cat.scanned,
      0
    );
    const totalFilesOverall = Object.values(categories).reduce(
      (sum, cat) => sum + cat.totalFiles,
      0
    );
    // Prevent division by zero
    // const progressValue = totalFilesOverall > 0 ? totalScanned / totalFilesOverall : 0;
    const progressValue = categoriesFinished.length / 7;
    setProgress(progressValue);
  };
  const insertInitialScanResults = (scanData) => {
    db.transaction(tx => {
      Object.keys(scanData).forEach(fileType => {
        const { totalFiles, duplicates } = scanData[fileType];

        tx.executeSql(
          `INSERT OR REPLACE INTO Initial_Scan_Results (file_type, total_files, duplicate_files) 
        VALUES (?, ?, ?)`,
          [fileType, totalFiles, duplicates],
          () => console.log(`✅ Data inserted for ${fileType}`),
          (_, error) => console.error(`Error inserting data for ${fileType}:`, error)
        );
      });
    });
  };

  useEffect(() => {
    // getFilesDistribution();
  }, [])


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScanProgressUI progress={progress} categories={categories} />
      <Button
        title={isScanning ? "Scanning..." : scanBtnText}
        onPress={handleButtonPress}
        disabled={isScanning}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});