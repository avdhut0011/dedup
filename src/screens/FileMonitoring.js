import React, { useEffect, useState } from 'react';
import { View, Text, Button, NativeEventEmitter, NativeModules, StyleSheet, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { DirectoryMonitor } = NativeModules;

export default function FileMonitoring() {
    const [availableDirectories, setAvailableDirectories] = useState({});
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [monitoredDirectories, setMonitoredDirectories] = useState([]);

    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                const dirsJson = await DirectoryMonitor.getAvailableDirectories();
                const dirs = JSON.parse(dirsJson);
                setAvailableDirectories(dirs);
                setSelectedDirectory(Object.values(dirs)[0] || '');
            } catch (error) {
                console.error('Error fetching directories:', error);
            }
        };

        fetchDirectories();
    }, []);

    useEffect(() => {
        const directoryMonitorEvents = new NativeEventEmitter(DirectoryMonitor);
        const subscription = directoryMonitorEvents.addListener('FileChangeEvent', (event) => {
            console.log('File change detected:', event);
        });

        return () => subscription.remove();
    }, []);

    const startMonitoring = () => {
        if (selectedDirectory) {
            DirectoryMonitor.startMonitoring(selectedDirectory);
            console.log('Started monitoring:', selectedDirectory);

            setMonitoredDirectories((prev) =>
                prev.includes(selectedDirectory) ? prev : [...prev, selectedDirectory]
            );
        }
    };

    const stopMonitoring = (directory) => {
        DirectoryMonitor.stopMonitoring(directory);
        console.log('Stopped monitoring:', directory);

        setMonitoredDirectories((prev) => prev.filter((dir) => dir !== directory));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Directory to Monitor</Text>
            <Picker
                selectedValue={selectedDirectory}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedDirectory(itemValue)}
            >
                {Object.entries(availableDirectories).map(([key, value]) => (
                    <Picker.Item key={key} label={key} value={value} />
                ))}
            </Picker>

            <Button title="Start Monitoring" onPress={startMonitoring} />

            <Text style={styles.subtitle}>Monitored Directories:</Text>
            <FlatList
                data={monitoredDirectories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.monitoredDirectory}>
                        <Text>{item}</Text>
                        <Button title="Stop" onPress={() => stopMonitoring(item)} />
                    </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.noDirectoryText}>No directories being monitored</Text>
              }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    picker: { height: 50, width: '100%', marginBottom: 20 },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    monitoredDirectory: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
});
