import React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import SSDeepTurboModule from '../../specs/NativeSSDeepModule';
import RNFS from 'react-native-fs';

export default function TurboModule() {
  const [file1Path, setFile1Path] = React.useState('');
  const [file2Path, setFile2Path] = React.useState('');
  const [hash1, setHash1] = React.useState('');
  const [hash2, setHash2] = React.useState('');
  const [similarity, setSimilarity] = React.useState(null);

  const pickFile = async (setFile1Path) => {
    try {
      setFile1Path(`${RNFS.ExternalStorageDirectoryPath}/Documents/Blockchain.pptx`)
      setFile2Path(`${RNFS.ExternalStorageDirectoryPath}/Documents/Blockchain_Technology.pptx`)
    } catch (err) {
        Alert.alert('Cancelled', 'File setting error');
        console.error(err);
      }
  };

  const computeHash = async (filePath, setHash) => {
    try {
      const hash = SSDeepTurboModule.hashFile(filePath);
      setHash(hash);
    } catch (error) {
      Alert.alert('Error', 'Failed to compute file hash');
      console.error(error);
    }
  };

  const compareFiles = async () => {
    if (!hash1 || !hash2) {
      Alert.alert('Error', 'Please compute hashes for both files first');
      return;
    }

    try {
      const similarityPercentage = SSDeepTurboModule.compareHashes(hash1, hash2);
      setSimilarity(similarityPercentage);
    } catch (error) {
      Alert.alert('Error', 'Failed to compare file hashes');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>
          File Hash Comparison with ssdeep
        </Text>

        <Button
          title="Set Files"
          onPress={() => pickFile(setFile1Path)}
        />
        <Text>File 1: {file1Path}</Text>
        <Button
          title="Compute Hash for File 1"
          onPress={() => computeHash(file1Path, setHash1)}
        />
        <Text>Hash 1: {hash1}</Text>

        {/* <Button
          title="Pick File 2"
          onPress={() => pickFile(setFile2Path)}
        /> */}
        <Text>File 2: {file2Path}</Text>
        <Button
          title="Compute Hash for File 2"
          onPress={() => computeHash(file2Path, setHash2)}
        />
        <Text>Hash 2: {hash2}</Text>

        <Button
          title="Compare Hashes"
          onPress={compareFiles}
        />
        {similarity !== null && (
          <Text>Similarity: {similarity}%</Text>
        )}
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