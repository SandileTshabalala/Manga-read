import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const handlePress = () => {
    router.replace('/homescreen');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome to Manga Reader</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Start Reading</Text>
        </TouchableOpacity>
        
        <View style={styles.credits}>
          <Text style={styles.creditsText}>Powered by</Text>
          <Text style={styles.creditsCompany}>MangaDex</Text>
          
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>Important Notice:</Text>
            <Text style={styles.disclaimerText}>
              • All manga content is provided by scanlation groups who dedicate their time and effort to translate and share manga
            </Text>
            <Text style={styles.disclaimerText}>
              • We respect scanlation groups' rights and will immediately remove content upon their request
            </Text>
            <Text style={styles.disclaimerText}>
              • Each chapter displays credits for the scanlation group responsible for the translation
            </Text>
            <Text style={styles.disclaimerText}>
              • Support official releases and scanlation groups when possible
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  credits: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  creditsText: {
    color: '#888888',
    fontSize: 14,
  },
  creditsCompany: {
    color: '#FF4081',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 20,
  },
  disclaimer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 8,
    maxWidth: 400,
  },
  disclaimerTitle: {
    color: '#FF4081',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  disclaimerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
