import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import RNFS from 'react-native-fs';

export default function HomeScreen() {
  const [fileDistribution, setFileDistribution] = useState([]);
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
    const directories = [`${RNFS.ExternalStorageDirectoryPath}`]; // Start from root directory
    // Define ignored directories
    const ignoredPrefixes = [
      'com.',        // App-specific directories
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
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
    useEffect(() => {
      const getFilesDistribution = async () => {
        let distributionData = [];
  
        for (const [category, extensions] of Object.entries(fileCategories)) {
          const files = await scanFilesInCategory(category, extensions);
          console.log(category + ' : ' + files.length);
  
          if (files.length > 0) {
            distributionData.push({
              name: category,
              population: files.length,
              color: getRandomColor(),
              legendFontColor: 'white',
              legendFontSize: 14,
            });
          }
        }
  
        setFileDistribution(distributionData);
      };
  
      getFilesDistribution();
    }, []);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.scanButton}>
        <Text style={styles.scanButtonText}>SCAN FILES</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
        File Distribution
      </Text>

      {fileDistribution.length > 0 ? (
        <PieChart
          data={fileDistribution}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1e2240',
            backgroundGradientFrom: '#1e2240',
            backgroundGradientTo: '#1e2240',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute // Shows values inside the chart
        />
      ) : (
        <Text style={{ color: 'white' }}>No files found for distribution.</Text>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanButton: {
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },

  pastResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    width: '90%',
    alignSelf: 'center',
  }
  ,
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  dashboardBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
});