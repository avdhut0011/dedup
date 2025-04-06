import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'filehashes.db', location: 'default' });

export default function ResultsScreen() {
  const [duplicates, setDuplicates] = useState([]);

  const getDuplicateFiles = (callback) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT dr.id, 
                fr1.file_name AS original_name, 
                fr1.file_path AS original_path, 
                fr1.file_size AS original_size, 
                fr2.file_name AS duplicate_name, 
                fr2.file_path AS duplicate_path, 
                fr2.file_size AS duplicate_size, 
                dr.similarity_score 
         FROM Duplicates_Record dr
         JOIN Files_Record fr1 ON dr.original_fid = fr1.id
         JOIN Files_Record fr2 ON dr.duplicate_fid = fr2.id
         ORDER BY dr.similarity_score DESC`,
        [],
        (_, result) => {
          let duplicates = [];
          for (let i = 0; i < result.rows.length; i++) {
            duplicates.push(result.rows.item(i)); // Correct way to extract each row
          }
          console.log(duplicates.length)
          callback(duplicates);
        },
        (error) => console.error('Error fetching duplicate files:', error)
      );
    });
  };
  useEffect(() => {
    getDuplicateFiles(setDuplicates);
  }, []);

  // Function to render image or video preview
  const renderFilePreview = (filePath) => {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png'].includes(fileExtension);
    const isVideo = ['mp4', 'mkv', 'avi', 'mov'].includes(fileExtension);

    if (isImage) {
      return <Image source={{ uri: `file://${filePath}` }} style={{ width: 60, height: 60, borderRadius: 5 }} />;
    } else if (isVideo) {
      return (
        <Video
          source={{ uri: `file://${filePath}` }}
          style={{ width: 60, height: 60, borderRadius: 5 }}
          muted
          resizeMode="cover"
        />
      );
    } else {
      return <Text style={{ width: 60, height: 60, borderRadius: 5 }}>{fileExtension}</Text>;
    }
  };

  console.log("result")

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Duplicate Files</Text>

      <FlatList
        data={duplicates}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.setHeader}>Set {index + 1}</Text>

            {/* Duplicate File Section */}
            <View style={styles.fileRow}>
              {renderFilePreview(item.duplicate_path)}
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>Duplicate File: {item.duplicate_name}</Text>
                <Text style={styles.fileDetails}>Size: {(item.duplicate_size / 1024).toFixed(2)} MB</Text>
                <Text style={styles.fileDetails}>Similarity: {item.similarity_score}%</Text>
                <Text style={styles.filePath}>{item.duplicate_path}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Original File Section */}
            <View style={styles.fileRow}>
              {renderFilePreview(item.original_path)}
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>Original File: {item.original_name}</Text>
                <Text style={styles.fileDetails}>Size: {(item.original_size / 1024).toFixed(2)} MB</Text>
                <Text style={styles.filePath}>{item.original_path}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5", // Light gray background like CCleaner UI
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#ffffff", // White card background
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  setHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  fileName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  fileDetails: {
    fontSize: 12,
    color: "#666",
  },
  filePath: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },
  deleteButton: {
    backgroundColor: "#D9534F", // CCleaner-style red button
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
