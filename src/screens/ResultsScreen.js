import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ResultsScreen() {
  return (
    <View style={styles.container}>
      

      {/* Duplicate Files List */}
      <Text style={styles.subHeading}>DUPLICATE FILES :</Text>

      {/* Checkboxes (Static UI) */}
      <View style={styles.fileItem}><Text style={styles.checkbox}>⬜</Text><Text style={styles.fileText}>Presentation 1</Text></View>
      <View style={styles.fileItem}><Text style={styles.checkbox}>⬜</Text><Text style={styles.fileText}>Resume</Text></View>
      <View style={styles.fileItem}><Text style={styles.checkbox}>⬜</Text><Text style={styles.fileText}>Movie 3</Text></View>
      <View style={styles.fileItem}><Text style={styles.checkbox}>⬜</Text><Text style={styles.fileText}>Book 8</Text></View>
      <View style={styles.fileItem}><Text style={styles.checkbox}>⬜</Text><Text style={styles.fileText}>Document</Text></View>
      <View style={styles.fileItem}><Text style={styles.checkbox}>⬜</Text><Text style={styles.fileText}>Layout PDF</Text></View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>SELECT ALL</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.buttonText}>DELETE SELECTED</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e2a',
    padding: 20,
  },
  menuText: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 28,
    color: 'white',
  },
  logo: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 60,
  },
  subHeading: {
    fontSize: 16,
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    fontSize: 20,
    color: 'white',
  },
  fileText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

