import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, Linking } from 'react-native';
import { requestStoragePermission } from '../utils/permissions'; // Import permission function
import { scanFiles } from '../utils/fileUtils'; // Import file scanning function
import RNFS from 'react-native-fs';

const ScanScreen = () => {
  const [files, setFiles] = useState([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check and request permission when the screen loads
    const checkPermission = async () => {
      const permissionGranted = await requestStoragePermission();
      setIsPermissionGranted(permissionGranted);

      if (!permissionGranted) {
        Alert.alert(
          "Permission Denied",
          "Storage permission is required to scan files. Please enable it in the app settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
      }
    };

    checkPermission();
  }, []);  // Empty array ensures this runs only once when the component is mounted

  // Function to start scanning when permission is granted
  const startScanning = async () => {
    if (!isPermissionGranted) {
      Alert.alert("Permission Denied", "Storage permission is required to scan files.");
      return;
    }

    setIsLoading(true);

    const path = RNFS.ExternalStorageDirectoryPath; // Specify the directory you want to scan
    console.log(path);
    const scannedFiles = await scanFiles(path);

    setFiles(scannedFiles);
    setIsLoading(false);
  };

  return (
    <View>
      <Button title="Start Scanning" onPress={startScanning} disabled={isLoading} />
      
      {isLoading && <Text>Scanning in progress...</Text>}

      {files.length > 0 ? (
        <FlatList
          data={files}
          renderItem={({ item }) => <Text>{item.name}</Text>}
          keyExtractor={(item) => item.path}
        />
      ) : (
        <Text>No files found or permission not granted.</Text>
      )}
    </View>
  );
};

export default ScanScreen;