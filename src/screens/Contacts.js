import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ContactsScreen() {
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>CONTACT</Text>

      {/* Contact Details */}
      <Text style={styles.contactText}>EMAIL : XYZ@GMAIL.COM</Text>
      <Text style={styles.contactText}>CONTACT NO : 253 3XXXX</Text>

      {/* Feedback Form */}
      <Text style={styles.feedbackHeading}>FEEDBACK FORM :</Text>

      <Text style={styles.label}>NAME :</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
        placeholder="Enter your name" 
        placeholderTextColor="#aaa" 
      />

      <Text style={styles.label}>EMAIL / PHONE NO :</Text>
      <TextInput 
        style={styles.input} 
        value={emailOrPhone} 
        onChangeText={setEmailOrPhone} 
        placeholder="Enter email or phone" 
        placeholderTextColor="#aaa" 
      />

      <Text style={styles.label}>MESSAGE :</Text>
      <TextInput 
        style={[styles.input, styles.messageBox]} 
        value={message} 
        onChangeText={setMessage} 
        placeholder="Enter your message" 
        placeholderTextColor="#aaa" 
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>SUBMIT</Text>
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  feedbackHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: 'white',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1a1e3a',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  messageBox: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0a0e2a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
