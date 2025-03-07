import { NativeModules, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

const { StorageModule } = NativeModules;

// Helper function to convert bytes to GB
const formatGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2) + ' GB';

const StorageStats = () => {
    const [storageStats, setStorageStats] = useState(null);

    useEffect(() => {
        const fetchStorageStats = async () => {
            try {
                const storageData = await StorageModule.getStorageStats();
                const stats = JSON.parse(storageData);
                setStorageStats(stats);
            } catch (error) {
                console.error('Error fetching storage stats:', error);
            }
        };
        fetchStorageStats();
    }, []);

    if (!storageStats) {
        return <Text>Loading storage stats...</Text>;
    }

    return (
        <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Storage Statistics</Text>

        {/* <Text style={styles.statItem}>Total Storage: {formatGB(storageStats.totalStorage)}</Text>
        <Text style={styles.statItem}>Used Storage: {formatGB(storageStats.usedStorage)}</Text>
        <Text style={styles.statItem}>Available Storage: {formatGB(storageStats.availableStorage)}</Text>
        <Text style={styles.statItem}>System Storage: {formatGB(storageStats.systemStorage)}</Text>
        <Text style={styles.statItem}>Installed Apps Storage: {formatGB(storageStats.installedAppsStorage)}</Text>
        <Text style={styles.statItem}>App Data Storage: {formatGB(storageStats.appDataStorage)}</Text>

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>File Categories:</Text>
        <Text style={styles.statItem}>Images: {formatGB(storageStats.imagesSize)}</Text>
        <Text style={styles.statItem}>Videos: {formatGB(storageStats.videosSize)}</Text>
        <Text style={styles.statItem}>Audio: {formatGB(storageStats.audioSize)}</Text>
        <Text style={styles.statItem}>Documents: {formatGB(storageStats.documentsSize)}</Text>
        <Text style={styles.statItem}>APKs: {formatGB(storageStats.apkSize)}</Text> */}
         <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Storage Stats</Text>
            {storageStats && (
                <>
                    <Text>Total Storage: {(storageStats.totalStorage / 1e9).toFixed(2)} GB</Text>
                    <Text>Used Storage: {(storageStats.usedStorage / 1e9).toFixed(2)} GB</Text>
                    <Text>Free Storage: {(storageStats.freeStorage / 1e9).toFixed(2)} GB</Text>
                    <Text>Images: {(storageStats.images / 1e6).toFixed(2)} MB</Text>
                    <Text>Videos: {(storageStats.videos / 1e6).toFixed(2)} MB</Text>
                    <Text>Audios: {(storageStats.audios / 1e6).toFixed(2)} MB</Text>
                    <Text>Documents: {(storageStats.documents / 1e6).toFixed(2)} MB</Text>
                    <Text>APKs: {(storageStats.apks / 1e6).toFixed(2)} MB</Text>
                </>
            )}
    </ScrollView>
    );
};

// Styles for better UI
const styles = {
    statItem: {
        fontSize: 18,
        marginVertical: 5,
    },
};

export default StorageStats;