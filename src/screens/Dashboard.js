

// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
// import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

// export default function DashboardScreen() {
//   const screenWidth = Dimensions.get("window").width - 40;  // Adjusted width

//   // Dummy Data
//   const barChartData = {
//     labels: ["Total Files", "Duplicate Files"],
//     datasets: [{ data: [128, 42] }],
//   };

//   const lineChartData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May"],
//     datasets: [{ data: [1, 2, 3.5, 2, 5] }],
//   };

//   const pieChartData = [
//     { name: "Unique Files", population: 86, color: "#4CAF50", legendFontColor: "#FFF", legendFontSize: 12 },
//     { name: "Duplicate Files", population: 42, color: "#FF5733", legendFontColor: "#FFF", legendFontSize: 12 },
//   ];

//   const chartConfig = {
//     backgroundGradientFrom: "#1a1e3a",
//     backgroundGradientTo: "#1a1e3a",
//     color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//     labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//     strokeWidth: 2,
//     barPercentage: 0.6,
//     propsForDots: { r: "5", strokeWidth: "2", stroke: "#FFA726" },
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.heading}>DASHBOARD STATS</Text>

//       {/* Cards */}
//       <View style={styles.card}><Text style={styles.cardText}>Total Files</Text><Text style={styles.cardNumber}>128</Text></View>
//       <View style={styles.card}><Text style={styles.cardText}>Duplicate Files</Text><Text style={styles.cardNumber}>42</Text></View>
//       <View style={styles.card}><Text style={styles.cardText}>Storage Saved</Text><Text style={styles.cardNumber}>5 GB</Text></View>

//       {/* Bar Chart */}
//       <Text style={styles.chartTitle}>File Analysis</Text>
//       <BarChart data={barChartData} width={screenWidth} height={220} yAxisLabel="" chartConfig={chartConfig} fromZero showValuesOnTopOfBars style={styles.chart} />

//       {/* Line Chart */}
//       <Text style={styles.chartTitle}>Storage Trend (GB)</Text>
//       <LineChart data={lineChartData} width={screenWidth} height={220} yAxisLabel="" chartConfig={chartConfig} bezier style={styles.chart} />

//       {/* Pie Chart */}
//       <Text style={styles.chartTitle}>File Distribution</Text>
//       <PieChart data={pieChartData} width={screenWidth} height={200} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" style={styles.chart} />

//       {/* Footer Button */}
//       <TouchableOpacity style={styles.footerButton}><Text style={styles.footerButtonText}>ANALYZE NOW</Text></TouchableOpacity>
//     </ScrollView>
//   );
// }

// // Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0a0e2a', padding: 20 },
//   heading: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
//   card: { backgroundColor: '#1a1e3a', borderRadius: 12, padding: 20, marginBottom: 15 },
//   cardText: { fontSize: 16, color: '#bbb' },
//   cardNumber: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 10 },
//   chartTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 20, textAlign: 'center' },
//   chart: { borderRadius: 10, marginVertical: 10 },
//   footerButton: { backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 20 },
//   footerButtonText: { color: '#0a0e2a', fontWeight: 'bold', fontSize: 16 },
// });


import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientTo: "#08130D",
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ data: [20, 45, 28, 80, 99] }],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{ data: [30, 45, 32, 50] }],
  };

  const pieData = [
    { name: "Used Storage", population: 60, color: "#FF5733", legendFontColor: "#FFF", legendFontSize: 12 },
    { name: "Free Space", population: 40, color: "#4CAF50", legendFontColor: "#FFF", legendFontSize: 12 },
  ];

  const progressData = { data: [0.7, 0.5, 0.3] };

  const heatmapData = [
    { date: "2024-02-01", count: 10 },
    { date: "2024-02-02", count: 20 },
    { date: "2024-02-03", count: 15 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>DASHBOARD STATS</Text>
      
      <Text style={styles.chartTitle}>Bar Chart</Text>
      <BarChart data={barData} width={screenWidth - 40} height={220} chartConfig={chartConfig} />

      <Text style={styles.chartTitle}>Line Chart</Text>
      <LineChart data={lineData} width={screenWidth - 40} height={220} chartConfig={chartConfig} />
      
      <Text style={styles.chartTitle}>Pie Chart</Text>
      <PieChart data={pieData} width={screenWidth - 40} height={220} accessor="population" chartConfig={chartConfig} />

      <Text style={styles.chartTitle}>Progress Chart</Text>
      <ProgressChart data={progressData} width={screenWidth - 40} height={220} strokeWidth={16} radius={32} chartConfig={chartConfig} />
      
      <Text style={styles.chartTitle}>Heatmap Chart</Text>
      <ContributionGraph values={heatmapData} endDate={new Date("2024-02-07")} numDays={7} width={screenWidth - 40} height={220} chartConfig={chartConfig} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e2a",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    marginTop: 20,
  },
});

