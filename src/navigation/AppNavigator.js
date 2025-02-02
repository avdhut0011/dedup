import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainLayout from '../layouts/MainLayout';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FileMonitoring from '../screens/FileMonitoring';
import TurboModule from '../screens/TurboModule';
import AboutUs from '../screens/AboutUs';
import Dashboard from '../screens/Dashboard';
import ContactsScreen from '../screens/Contacts';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Define state variables
  const [selectedFolders, setSelectedFolders] = useState([
    'Download', 'DCIM', 'Documents', 'Pictures', 'Music'
  ]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {() => (
            <MainLayout>
              <HomeScreen />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Scan">
          {() => (
            <MainLayout>
              <ScanScreen selectedFolders={selectedFolders} />
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
              <SettingsScreen selectedFolders={selectedFolders} setSelectedFolders={setSelectedFolders} />
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
        <Stack.Screen name="C++Testing">
          {() => (
            <MainLayout>
              <TurboModule />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="AboutUs">
          {() => (
            <MainLayout>
              <AboutUs />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Dashboard">
          {() => (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Contacts">
          {() => (
            <MainLayout>
              <ContactsScreen />
            </MainLayout>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;