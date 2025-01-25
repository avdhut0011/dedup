// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, Button, Alert, Linking } from 'react-native';
// import { requestStoragePermission } from '../utils/permissions'; // Import permission function
// import { scanFiles } from '../utils/fileUtils'; // Import file scanning function
// import RNFS from 'react-native-fs';

// const ScanScreen = () => {
//   const [files, setFiles] = useState([]);
//   const [isPermissionGranted, setIsPermissionGranted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     // Check and request permission when the screen loads
//     const checkPermission = async () => {
//       const permissionGranted = await requestStoragePermission();
//       setIsPermissionGranted(permissionGranted);

//       if (!permissionGranted) {
//         Alert.alert(
//           "Permission Denied",
//           "Storage permission is required to scan files. Please enable it in the app settings.",
//           [
//             { text: "Cancel", style: "cancel" },
//             { text: "Open Settings", onPress: () => Linking.openSettings() }
//           ]
//         );
//       }
//     };

//     checkPermission();
//   }, []);  // Empty array ensures this runs only once when the component is mounted

//   // Function to start scanning when permission is granted
//   const startScanning = async () => {
//     if (!isPermissionGranted) {
//       Alert.alert("Permission Denied", "Storage permission is required to scan files.");
//       return;
//     }

//     setIsLoading(true);

//     const path = RNFS.ExternalStorageDirectoryPath; // Specify the directory you want to scan
//     console.log(path);
//     const scannedFiles = await scanFiles(path);

//     setFiles(scannedFiles);
//     setIsLoading(false);
//   };

//   return (
//     <View>
//       <Button title="Start Scanning" onPress={startScanning} disabled={isLoading} />
      
//       {isLoading && <Text>Scanning in progress...</Text>}

//       {files.length > 0 ? (
//         <FlatList
//           data={files}
//           renderItem={({ item }) => <Text>{item.name}</Text>}
//           keyExtractor={(item) => item.path}
//         />
//       ) : (
//         <Text>No files found or permission not granted.</Text>
//       )}
//     </View>
//   );
// };

// export default ScanScreen;




import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, Linking, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { requestStoragePermission } from '../utils/permissions'; // Import permission function
import { scanFiles } from '../utils/fileUtils'; // Import file scanning function
import RNFS from 'react-native-fs';

const ScanScreen = () => {
  const [files, setFiles] = useState([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
  }, []);

  const startScanning = async () => {
    if (!isPermissionGranted) {
      Alert.alert("Permission Denied", "Storage permission is required to scan files.");
      return;
    }

    setIsLoading(true);

    const path = RNFS.ExternalStorageDirectoryPath;
    console.log(path);
    const scannedFiles = await scanFiles(path);

    setFiles(scannedFiles);
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>FILE SCANNER</Text>

      <TouchableOpacity style={styles.button} onPress={startScanning} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Scanning..." : "Start Scanning"}</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

      {files.length > 0 ? (
        <FlatList
          data={files}
          renderItem={({ item }) => <Text style={styles.fileText}>{item.name}</Text>}
          keyExtractor={(item) => item.path}
        />
      ) : (
        <Text style={styles.noFilesText}>No files found or permission not granted.</Text>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0e2a',
  },
  fileText: {
    fontSize: 16,
    color: 'white',
    padding: 5,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  noFilesText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ScanScreen;
