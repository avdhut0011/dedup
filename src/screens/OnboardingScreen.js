import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const onboardingData = [
  { id: 1, text: "Welcome to MyApp!" }, // App Logo
  { id: 2,  text: "Scan and organize your files easily." },
  { id: 3,  text: "Detect duplicate files efficiently." },
  { id: 4,  text: "Save storage and manage files better." },
  { id: 5,  text: "Fast and secure scanning process." },
  { id: 6,  text: "Start exploring MyApp now!" },
];

export default function OnboardingScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = async () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await AsyncStorage.setItem('hasOnboarded', 'true'); // Save onboarding completion
      navigation.replace('Home'); // Navigate to Home
    }
  };

  return (
    <View style={styles.container}>
      <Image source={onboardingData[currentPage].image} style={styles.image} />
      <Text style={styles.text}>{onboardingData[currentPage].text}</Text>
      
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>{currentPage === onboardingData.length - 1 ? "Get Started" : "Next"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  image: { width: 300, height: 300, resizeMode: 'contain', marginBottom: 20 },
  text: { fontSize: 20, textAlign: 'center', fontWeight: 'bold', color: 'black' },
  nextButton: { marginTop: 20, padding: 15, backgroundColor: '#007AFF', borderRadius: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
