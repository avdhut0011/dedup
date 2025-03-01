import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
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

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Duplicate Files</Text>
      <FlatList
        data={duplicates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={{marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Set: {index + 1}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              {renderFilePreview(item.duplicate_path)}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>Duplicate File: {item.duplicate_name}</Text>
                <Text style={{ color: 'gray', fontSize: 12 }}>Duplicate File Size: {(item.duplicate_size / 1024).toFixed(2)} MB</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>Similarity: {item.similarity_score}%</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>{item.duplicate_path}</Text>
              </View>
              <TouchableOpacity style={{ padding: 10, backgroundColor: 'red', borderRadius: 5 }}>
                <Text style={{ color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              {renderFilePreview(item.original_path)}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>Original File : {item.original_name}</Text>
                <Text style={{ color: 'gray', fontSize: 12 }}>Original File Size: {(item.original_size / 1024).toFixed(2)} MB</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>{item.original_path}</Text>
              </View>
              <TouchableOpacity style={{ padding: 10, backgroundColor: 'red', borderRadius: 5 }}>
                <Text style={{ color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};
