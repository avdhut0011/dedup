import React, { useEffect, useState } from 'react';
import { View, Text, Button, NativeEventEmitter, NativeModules, StyleSheet, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { DirectoryMonitor } = NativeModules;

export default function FileMonitoring() {
    const [availableDirectories, setAvailableDirectories] = useState({});
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [monitoredDirectories, setMonitoredDirectories] = useState([]);

    useEffect(() => {
        // const fetchDirectories = async () => {
        //     try {
        //         const dirsJson = await DirectoryMonitor.getAvailableDirectories();
        //         const dirs = JSON.parse(dirsJson);
        //         setAvailableDirectories(dirs);
        //         setSelectedDirectory(Object.values(dirs)[0] || '');
        //     } catch (error) {
        //         console.error('Error fetching directories:', error);
        //     }
        // };
        const fetchDirectories = async () => {
            try {
                // const dirsJson = await DirectoryMonitor.getRootDirectory();
                const dirsJson = await DirectoryMonitor.getAvailableDirectories();
                // console.log(dirsJson)
                const dirs = JSON.parse(dirsJson);
                setAvailableDirectories(dirs);
                // console.log(availableDirectories)
                setSelectedDirectory(Object.values(dirsJson)[0] || '');
                // setSelectedDirectory(dirsJson);
            } catch (error) {
                console.error('Error fetching directories:', error);
            }
        };

        fetchDirectories();
    }, []);

    useEffect(() => {
        // const directoryMonitorEvents = new NativeEventEmitter(DirectoryMonitor);
        // const subscription = directoryMonitorEvents.addListener('FileChangeEvent', (event) => {
        //     console.log('File change detected:', event);
        // });

        // return () => subscription.remove();
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
                <Picker.Item key={9999} label={'root'} value={'/storage/emulated/0'} />
                {/* {Object.entries(availableDirectories).map(([key, value]) => (
                    <Picker.Item key={key} label={key} value={value} />
                ))} */}
            </Picker>

            <Button title="Start Monitoring" onPress={startMonitoring} color="#000000" />



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
    container: {
        flex: 1,
        backgroundColor: '#0a0e2a',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    picker: {
        height: 50,
        backgroundColor: '#1e2240',
        color: 'white',
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    startButton: {
        backgroundColor: '#fff',  // White background
        borderRadius: 10,
        paddingVertical: 12,
        marginBottom: 20,
        width: '100%', // Full width
      },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
    },
    monitoredDirectory: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e2240',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    directoryText: {
        fontSize: 16,
        color: 'white',
    },
    stopButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    stopButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noDirectoryText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
});
