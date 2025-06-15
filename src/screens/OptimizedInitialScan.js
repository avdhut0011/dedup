import { SafeAreaView, StyleSheet, Button, NativeModules } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import ScanProgressUI from '../components/ScanProgressUI';
import { useNavigation } from '@react-navigation/native';

const { NativeScannerModule } = NativeModules;
const db = SQLite.openDatabase({ name: 'filehashes.db', location: 'default' });

export default function InitialScan() {
  const [scanBtnText, setScanBtnText] = useState('Start Initial Scan');
  const [scanCompleted, setScanCompleted] = useState(false);
  const navigation = useNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState({
    text: { totalFiles: 0, duplicates: 0 },
    pptx: { totalFiles: 0, duplicates: 0 },
    documents: { totalFiles: 0, duplicates: 0 },
    audio: { totalFiles: 0, duplicates: 0 },
    pdfs: { totalFiles: 0, duplicates: 0 },
    image: { totalFiles: 0, duplicates: 0 },
    video: { totalFiles: 0, duplicates: 0 },
  });

  useEffect(() => {
    checkFirstLaunch().then((isFirstLaunch) => {
      if (!isFirstLaunch) {
        setScanBtnText("Results");
        setScanCompleted(true);
      }
    });
  }, []);

  const checkFirstLaunch = async () => {
    const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
    if (isFirstLaunch === null) {
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      return true;
    }
    return false;
  };

  const startScan = async () => {
    console.log('Starting scan using NativeScannerModule...');
    setIsScanning(true);

    try {
      const results = await NativeScannerModule.startInitialScan();
      console.log("Scan Results:", results);

      // Update state with scanned data
      setCategories((prevCategories) => {
        const updatedCategories = { ...prevCategories };
        Object.keys(results).forEach(category => {
          updatedCategories[category] = {
            totalFiles: results[category].totalFiles,
            duplicates: results[category].duplicates
          };
        });
        return updatedCategories;
      });

      // Insert results into the database
      insertInitialScanResults(results);

      setScanBtnText("Results");
      setScanCompleted(true);
    } catch (error) {
      console.error("Error scanning files:", error);
    } finally {
      setIsScanning(false);
    }
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

  const handleButtonPress = () => {
    if (scanCompleted) {
      navigation.navigate("Results");
    } else {
      startScan();
    }
  };

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
