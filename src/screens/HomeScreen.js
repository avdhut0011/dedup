import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, NativeModules } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import CpuUsage from '../components/CpuUsage';
import StorageStats from '../components/StorageStats';

const { FileScannerModule } = NativeModules;
export default function HomeScreen() {
  const [fileDistribution, setFileDistribution] = useState([]);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const scanFiles = async () => {
    try {
      const files = await FileScannerModule.scanFiles();
      const parsedFiles = JSON.parse(files);
      console.log(parsedFiles)
      // Count files by category
      const categoryCounts = {};
      parsedFiles.forEach((file) => {
        categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;
      });
      console.log(categoryCounts)
      // Convert into chart-friendly format
      const distributionData = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          name: category,
          population: count,
          color: getRandomColor(),
          legendFontColor: "white",
          legendFontSize: 14,
        })
      );
      setFileDistribution(distributionData);
      console.log("Files found:", parsedFiles);
    } catch (error) {
      console.error("File scan error:", error);
    }
  };

  useEffect(() => {
    scanFiles();
  }, []);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 10 }}>
        <CpuUsage />
        <StorageStats />
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