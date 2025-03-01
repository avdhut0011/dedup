import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutUsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* About Us Section */}
      <Text style={styles.heading}>ABOUT US</Text>
      <Text style={styles.content}>
        Welcome to <Text style={styles.highlight}>Dedup</Text>, your ultimate solution for efficient storage management. Our app helps you identify and remove duplicate files, freeing up space and optimizing your device's performance.
      </Text>
      <Text style={styles.content}>
        Our mission is to provide a seamless and secure way to manage your files with cutting-edge technology. We value <Text style={styles.highlight}>efficiency</Text>, <Text style={styles.highlight}>simplicity</Text>, and <Text style={styles.highlight}>user experience</Text> at the core of our development.
      </Text>

      {/* Privacy Policy Section */}
      <Text style={styles.subHeading}>PRIVACY POLICY</Text>
      <Text style={styles.content}>
        At <Text style={styles.highlight}>Dedup</Text>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our app.
      </Text>
      <Text style={styles.content}>
        <Text style={styles.bold}>1. Information We Collect:</Text> We collect minimal information necessary to provide our services, such as file metadata (e.g., file names, sizes, and types) to identify duplicates. We do not access or store the content of your files.
      </Text>
      <Text style={styles.content}>
        <Text style={styles.bold}>2. How We Use Your Information:</Text> The information we collect is used solely for the purpose of identifying and managing duplicate files. We do not share, sell, or distribute your data to third parties.
      </Text>
      <Text style={styles.content}>
        <Text style={styles.bold}>3. Data Security:</Text> We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. All file processing is done locally on your device, ensuring your data never leaves your device.
      </Text>
      <Text style={styles.content}>
        <Text style={styles.bold}>4. Permissions:</Text> To provide our services, we request access to your device's storage. This permission is used only to scan and manage files within the app.
      </Text>
      <Text style={styles.content}>
        <Text style={styles.bold}>5. Changes to This Policy:</Text> We may update this Privacy Policy from time to time. Any changes will be reflected in the app, and we encourage you to review this policy periodically.
      </Text>
      <Text style={styles.content}>
        If you have any questions or concerns about our Privacy Policy, please contact us at <Text style={styles.highlight}>support@dedup.com</Text>.
      </Text>

      {/* Footer */}
      <Text style={styles.footer}>© 2025 Dedup. All rights reserved.</Text>
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
  subHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  content: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    marginBottom: 15,
    lineHeight: 24,
  },
  highlight: {
    color: '#00bcd4', // Light blue for emphasis
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
    color: '#00bcd4', // Light blue for emphasis
  },
  footer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
});