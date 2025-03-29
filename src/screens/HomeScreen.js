import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, NativeModules } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import CpuUsage from '../components/CpuUsage';
import StorageStats from '../components/StorageStats';
import * as Progress from "react-native-progress";
//import DonutChart from "react-native-donut-chart";

const { FileScannerModule } = NativeModules;

export default function HomeScreen() {
  const [fileDistribution, setFileDistribution] = useState([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [usedStorage, setUsedStorage] = useState(73.3); // Example: Used storage in GB
  const [totalStorage, setTotalStorage] = useState(100); // Example: Total storage in GB
  const [hiddenCache, setHiddenCache] = useState(9.15);
  const [unneededFiles, setUnneededFiles] = useState(856.219);
  const [filesToReview, setFilesToReview] = useState(10.67);

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
      console.log(parsedFiles);

      const categoryCounts = {};
      parsedFiles.forEach((file) => {
        categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;
      });

      console.log(categoryCounts);
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
    } catch (error) {
      console.error("File scan error:", error);
    }
  };

  useEffect(() => {
    scanFiles();
  }, []);

  // Function to calculate the percentage of each category
  const calculatePercentage = (value) => value / totalStorage;


  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 10 }}>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Storage Usage Heading */}
          <Text style={styles.cardHeading}>Storage Overview</Text>

          {/* Free Space Text */}
          <Text style={styles.storageText}>{usedStorage} GB Used</Text>
          <Text style={styles.freeUpText}>
            Free up to <Text style={{ fontWeight: 'bold' }}>12 GB</Text>
          </Text>

          {/* Progress Bars */}
          <View style={styles.progressBarContainer}>
            <Progress.Bar
              progress={calculatePercentage(usedStorage)}
              width={Dimensions.get("window").width - 60}
              height={12}
              color="#4CAF50" // Green for used storage
              borderRadius={8}
              borderWidth={1}
              borderColor="#ddd"
              unfilledColor="#e0e0e0"
            />
            <Progress.Bar
              progress={calculatePercentage(hiddenCache)}
              width={Dimensions.get("window").width - 60}
              height={12}
              color="#FFA500" // Orange for hidden cache
              borderRadius={8}
              borderWidth={1}
              borderColor="transparent"
              unfilledColor="transparent"
              style={styles.overlayBar}
            />
            <Progress.Bar
              progress={calculatePercentage(filesToReview)}
              width={Dimensions.get("window").width - 60}
              height={12}
              color="#008000" // Dark Green for files to review
              borderRadius={8}
              borderWidth={1}
              borderColor="transparent"
              unfilledColor="transparent"
              style={styles.overlayBar}
            />
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#0000FF" }]} />
              <Text style={styles.legendText}>Unneeded files - {unneededFiles} MB</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#FFA500" }]} />
              <Text style={styles.legendText}>Hidden caches - {hiddenCache} GB</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#008000" }]} />
              <Text style={styles.legendText}>Files to review - {filesToReview} GB</Text>
            </View>
          </View>
        </View>


        <View style={styles.card}>
          {/* Scan Button */}
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanButtonText}>SCAN FILES</Text>
          </TouchableOpacity>
        </View>

        <CpuUsage />
        <StorageStats />

        <View style={styles.card}>
          <Text style={styles.heading}>File Distribution</Text>

          {fileDistribution.length > 0 ? (
            <PieChart
              data={fileDistribution}
              width={Dimensions.get('window').width - 60} // Slightly reduced width for padding
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`, // Dark grey text
                strokeWidth: 2,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute // Shows values inside the chart
            />
          ) : (
            <Text style={styles.noFilesText}>No files found for distribution.</Text>
          )}

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#fff", // White background for a clean UI
  },

  /* Card Design */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    width: Dimensions.get("window").width - 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8, // Enhanced shadow for a pop-up effect
  },

  /* Card Headings */
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  /* Storage Text */
  storageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#444",
  },
  freeUpText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },

  /* Progress Bar */
  progressBarContainer: {
    marginVertical: 10,
  },
  overlayBar: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  /* Legend */
  legendContainer: {
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  colorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: "#555",
  },

  /* Scan Button */
  scanButton: {
    backgroundColor: "#007AFF", // CCleaner-style blue button
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },

  /* No Files Text */
  noFilesText: {
    fontSize: 14,
    color: "#777",
  },
});
