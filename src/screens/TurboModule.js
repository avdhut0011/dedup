import React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import SampleTurboModule from '../../specs/NativeSampleModule';

export default function TurboModule() {
  const [value, setValue] = React.useState('');
  const [reversedValue, setReversedValue] = React.useState('');
  const onPress = () => {
    const revString = SampleTurboModule.reverseString(value);
    setReversedValue(revString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>
          Welcome to C++ Turbo Native Module Example
        </Text>
        <Text style={styles.subtitle}>Write down the text you want to revert</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Write your text here"
          onChangeText={setValue}
          value={value}
          placeholderTextColor="#aaa"
        />
        <View style={styles.buttonContainer}>
          <Button title="Reverse" onPress={onPress} color="#0a0e2a" />
        </View>
        <Text style={styles.reversedText}>Reversed text: {reversedValue}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e2a',  // Dark background color
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  textInput: {
    borderColor: '#1e2240',  // Dark border color
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: '80%',
    backgroundColor: '#1e2240', // Dark background for input
    color: 'white',
    marginTop: 10,
  },
  buttonContainer: {
    marginVertical: 20,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  reversedText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    fontWeight: 'bold',
  },
});
