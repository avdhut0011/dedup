import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function ContactsScreen() {
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !emailOrPhone || !message) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Simulate form submission
    Alert.alert('Success', 'Your feedback has been submitted!', [
      { text: 'OK', onPress: () => {
        setName('');
        setEmailOrPhone('');
        setMessage('');
      }},
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>CONTACT US</Text>

      {/* Contact Details */}
      <View style={styles.contactDetails}>
        <Text style={styles.contactText}>📧 EMAIL: support@dedup.com</Text>
        <Text style={styles.contactText}>📞 CONTACT NO: 253 3XXXX</Text>
      </View>

      {/* Feedback Form */}
      <Text style={styles.feedbackHeading}>FEEDBACK FORM</Text>

      {/* Name Input */}
      <Text style={styles.label}>NAME</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#aaa"
      />

      {/* Email/Phone Input */}
      <Text style={styles.label}>EMAIL / PHONE NO</Text>
      <TextInput
        style={styles.input}
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        placeholder="Enter email or phone"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
      />

      {/* Message Input */}
      <Text style={styles.label}>MESSAGE</Text>
      <TextInput
        style={[styles.input, styles.messageBox]}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter your message"
        placeholderTextColor="#aaa"
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0e2a',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactDetails: {
    marginBottom: 20,
  },
  contactText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  feedbackHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1a1e3a',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  messageBox: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#00bcd4', // Light blue for emphasis
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});