import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainLayout from '../layouts/MainLayout';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FileMonitoring from '../screens/FileMonitoring';
import TurboModule from '../screens/TurboModule';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {() => (
            <MainLayout>
              <HomeScreen />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="FileMonitoring">
          {() => (
            <MainLayout>
              <FileMonitoring />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Scan">
          {() => (
            <MainLayout>
              <ScanScreen />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Results">
          {() => (
            <MainLayout>
              <ResultsScreen />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {() => (
            <MainLayout>
              <SettingsScreen />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="C++Testing">
          {() => (
            <MainLayout>
              <TurboModule />
            </MainLayout>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}