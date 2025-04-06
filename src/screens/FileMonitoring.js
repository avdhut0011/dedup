import React, { useEffect, useState } from 'react';
import { View, Text, Button, NativeEventEmitter, NativeModules, StyleSheet, FlatList ,TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { DirectoryMonitor } = NativeModules;

export default function FileMonitoring() {
    const [availableDirectories, setAvailableDirectories] = useState({});
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [monitoredDirectories, setMonitoredDirectories] = useState([]);

    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                // const dirsJson = await DirectoryMonitor.getRootDirectory();
                const dirsJson = await DirectoryMonitor.getAvailableDirectories();
                const dirs = JSON.parse(dirsJson);
                setAvailableDirectories(dirs);
                console.log(dirs)
                setSelectedDirectory(Object.values(dirs)[0] || '');
            } catch (error) {
                console.error('Error fetching directories:', error);
            }
        };
        fetchDirectories();
    }, []);

    useEffect(() => {
        // const directoryMonitorEvents = new NativeEventEmitter(DirectoryMonitor);
        // const subscription = directoryMonitorEvents.addListener('FileChangeEvent', (event) => {
        //     console.log('File Change Detected:', event);
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
        // <View style={styles.container}>
        //     <Text style={styles.title}>Select Directory to Monitor</Text>
        //     <Picker
        //         selectedValue={selectedDirectory}
        //         style={styles.picker}
        //         onValueChange={(itemValue) => setSelectedDirectory(itemValue)}
        //     >
        //         {/* <Picker.Item key={9999} label={'root'} value={'/storage/emulated/0'} /> */}
        //         {Object.entries(availableDirectories).map(([key, value]) => (
        //             <Picker.Item key={key} label={key} value={value} />
        //         ))}
        //     </Picker>

        //     <Button title="Start Monitoring" onPress={startMonitoring} color="#000000" />



        //     <Text style={styles.subtitle}>Monitored Directories:</Text>
        //     <FlatList
        //         data={monitoredDirectories}
        //         keyExtractor={(item) => item}
        //         renderItem={({ item }) => (
        //             <View style={styles.monitoredDirectory}>
        //                 <Text>{item}</Text>
        //                 <Button title="Stop" onPress={() => stopMonitoring(item)} />
        //             </View>
        //         )}
        //         ListEmptyComponent={
        //           <Text style={styles.noDirectoryText}>No directories being monitored</Text>
        //       }
        //     />
        // </View>

        <View style={styles.container}>
            <Text style={styles.title}>Select Directory to Monitor</Text>
            <View style={styles.card}>
                <Picker
                    selectedValue={selectedDirectory}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedDirectory(itemValue)}
                >
                    {Object.entries(availableDirectories).map(([key, value]) => (
                        <Picker.Item key={key} label={key} value={value} />
                    ))}
                </Picker>
                <TouchableOpacity style={styles.startButton} onPress={startMonitoring}>
                    <Text style={styles.startButtonText}>Start Monitoring</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Monitored Directories</Text>

            <FlatList
                data={monitoredDirectories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.directoryCard}>
                        <Text style={styles.directoryText}>{item}</Text>
                        <TouchableOpacity style={styles.stopButton} onPress={() => stopMonitoring(item)}>
                            <Text style={styles.stopButtonText}>Stop</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noDirectoryText}>No directories being monitored</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f5f5f5", // Light gray background like CCleaner UI
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    card: {
        backgroundColor: "#ffffff", // White card background
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    picker: {
        height: 50,
        width: "100%",
        backgroundColor: "black",
        borderRadius: 8,
        overflow: "hidden",
    },
    startButton: {
        backgroundColor: "#007BFF", // Blue start button like CCleaner
        paddingVertical: 10,
        marginTop: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    startButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#555",
        marginBottom: 10,
    },
    directoryCard: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    directoryText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    stopButton: {
        backgroundColor: "#D9534F", // CCleaner-style red button
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    stopButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    noDirectoryText: {
        color: "#888",
        textAlign: "center",
        marginTop: 10,
    },
});