import React, { useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View, Alert, NativeModules, NativeEventEmitter } from 'react-native';
import SSDeepTurboModule from '../../specs/NativeSSDeepModule';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import SQLite from 'react-native-sqlite-storage';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

const { DirectoryMonitor } = NativeModules;
const db = SQLite.openDatabase({ name: 'filehashes.db', location: 'default' });

export default function MainLogic() {
    const [filePath, setFilePath] = React.useState('');
    const [newHash, setNewHash] = React.useState('');
    const [similarFiles, setSimilarFiles] = React.useState([]);
    // Initialize the Database
    const initializeDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, filepath TEXT, hash TEXT, file_type TEXT)',
                [],
                () => console.log('Database initialized successfully'),
                (error) => console.error('Error initializing database:', error)
            );
        });
    };
    const getFileExtension = (filePath) => {
        return filePath.split('.').pop().toLowerCase();
    };

    const pickFile = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            console.log(res[0])
            const fileUri = res[0].uri;
            setFilePath(fileUri);
            const fileExtension = getFileExtension(fileUri);
            console.log('File Extension:', fileExtension);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                Alert.alert('Cancelled', 'File picking cancelled');
            } else {
                Alert.alert('Error', 'Failed to pick file');
                console.error(err);
            }
        }
    };

    const displayNotification = async (title, count) => {
        // Create a channel for Android notifications
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
        });
        // Display the notification
        await notifee.displayNotification({
            title: `<b>${title}</b>`,
            body: ` ${count} Similar file(s) were detected.`,
            android: {
                channelId: 'default',
                smallIcon: 'ic_launcher', // Ensure the icon exists in your project
                actions: [
                    {
                        title: 'View',
                        pressAction: {
                            id: 'view',
                        },
                    },
                    {
                        title: 'Ignore',
                        pressAction: {
                            id: 'ignore',
                        },
                    },
                    {
                        title: 'Delete',
                        pressAction: {
                            id: 'delete',
                        },
                    },
                ],
            },
            data: {
                count: count,
            },
        });
    }
    const computeAndCompareHash = async (filePath) => {
        try {
            // Compute the hash of the new file
            console.log(filePath)
            const hash = SSDeepTurboModule.hashFile(filePath);
            // console.log(hash)
            setNewHash(hash);

            const filetype = await getFileExtension(filePath);
            // Fetch all relevant hashes from the database
            const hashes = await fetchHashesFromDatabase(filetype);

            // Compare the new hash with the array of hashes
            const threshold = 50; // Set your threshold here
            const results = SSDeepTurboModule.compareHashWithArray(hash, hashes, threshold);

            if (results.length > 0) {
                const similarFilesWithPath = await similarFilesPath(results);
                setSimilarFiles(similarFilesWithPath);
                Alert.alert('Duplicate Found', `${similarFilesWithPath.length} similar files found.`);
                await displayNotification('Similar Files Found', similarFilesWithPath.length)
            } else {
                setSimilarFiles([]);
                Alert.alert('No Duplicates', 'No similar files found.');
                // Insert the new file's hash into the database
                await insertHashIntoDatabase(filePath, hash, filetype);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to compute or compare hashes');
            console.error(error);
        }
    };

    const fetchHashesFromDatabase = (filetype) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT hash FROM files WHERE file_type = ?',
                    [filetype],
                    (tx, results) => {
                        const hashes = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            hashes.push(results.rows.item(i).hash);
                        }
                        resolve(hashes);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            });
        });
    };
    const similarFilesPath = async (results) => {
        try {
            const promises = results.map(result => {
                return new Promise((resolve, reject) => {
                    db.transaction((tx) => {
                        tx.executeSql(
                            'SELECT filepath FROM files WHERE hash = ?',
                            [result.hash],
                            (tx, queryResults) => {
                                const similarFilePaths = [];
                                for (let i = 0; i < queryResults.rows.length; i++) {
                                    similarFilePaths.push({
                                        filepath: queryResults.rows.item(i).filepath, 
                                        similarity: result.similarity
                                    });
                                }
                                resolve(similarFilePaths);
                            },
                            (error) => {
                                reject(error);
                            }
                        );
                    });
                });
            });
    
            // Wait for all promises to resolve and flatten the results
            const resolvedResults = await Promise.all(promises);
            return resolvedResults.flat();  // Flatten the nested arrays into a single array
    
        } catch (error) {
            console.error('Error fetching file paths:', error);
            return [];
        }
    };
    
    const insertHashIntoDatabase = (filePath, hash, filetype) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'INSERT INTO files (filepath, hash, file_type) VALUES (?, ?, ?)',
                    [filePath, hash, filetype],
                    () => resolve(),
                    (error) => reject(error)
                );
            });
        });
    };

    const fetchKnownFiles = () => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM files',
                    [],
                    (_, results) => {
                        const knownFiles = {};
                        for (let i = 0; i < results.rows.length; i++) {
                            const row = results.rows.item(i);
                            knownFiles[row.filepath] = row.hash; // Populate knownFiles with file paths and hash
                        }
                        console.log(knownFiles)
                        resolve(knownFiles);
                    },
                    (error) => {
                        console.error('Error fetching known files from database:', error);
                        reject(error);
                    }
                );
            });
        });
    };
    const dropTable = (db, tableName) => {
        db.transaction((tx) => {
            tx.executeSql(`DROP TABLE IF EXISTS ${tableName}`, [],
                () => console.log(`Table "${tableName}" has been dropped.`),
                (error) => console.error(`Error dropping table "${tableName}":`, error)
            );
        });
    };
    const truncateDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM files', [],
                () => console.log('All records from "files" table have been cleared.'),
                (error) => console.error('Error clearing "files" table:', error)
            );
        });
    };
    useEffect(() => {
        // fetchKnownFiles();
        // initializeDatabase();
    }, []);
    useEffect(() => {
        const directoryMonitorEvents = new NativeEventEmitter(DirectoryMonitor);
        const subscription = directoryMonitorEvents.addListener('FileChangeEvent', (event) => {
            const [eventType, filePath] = event.split(":");
            console.log('File change detected:', event);
            // Process changes
            if (eventType == "CREATE") {
                computeAndCompareHash(filePath);
            }
            else if (eventType == "DELETE") {

            }
            else {

            }
        });

        return () => subscription.remove();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.title}>New File Hash Comparison</Text>
                {/* <Button title="Pick File" onPress={pickFile} /> */}
                <Text>File: {filePath}</Text>
                {/* <Button title="Compute and Compare Hash" onPress={computeAndCompareHash} /> */}
                <Text>New Hash: {newHash}</Text>
                {similarFiles.length > 0 && (
                    <View>
                        <Text>Similar Files:</Text>
                        {similarFiles.map((file, index) => (
                            <Text key={index}>
                                {file.filepath} - {file.similarity}% similarity
                            </Text>
                        ))}
                    </View>
                )}
                <Button title="Truncate DB" onPress={truncateDatabase} />
                <Button title="Fetch Database Files" onPress={fetchKnownFiles} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
    },
});