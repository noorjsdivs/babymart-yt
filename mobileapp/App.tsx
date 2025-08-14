/**
 * BabyShop Mobile App
 * React Native E-commerce Application
 * 
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc',
    flex: 1,
  };

  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const cardBg = isDarkMode ? '#374151' : '#ffffff';

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              🍼 BabyShop Mobile
            </Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              React Native E-commerce App
            </Text>
          </View>

          {/* Main Card */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              📱 Mobile Application
            </Text>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                🚀 Technology Stack
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • React Native with TypeScript
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Native mobile performance
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Cross-platform compatibility
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Zustand for state management
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                ✨ Mobile Features
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Native mobile shopping experience
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Push notifications
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Offline support
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Camera integration
              </Text>
              <Text style={[styles.listItem, { color: textColor, opacity: 0.8 }]}>
                • Touch ID / Face ID support
              </Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#065f46' : '#ecfdf5' }]}>
            <Text style={[styles.infoTitle, { color: isDarkMode ? '#10b981' : '#047857' }]}>
              🛠️ Ready to Start Development?
            </Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#d1fae5' : '#065f46' }]}>
              This placeholder content shows the mobile app structure. Replace this with your custom mobile features!
            </Text>
            <View style={[styles.codeBlock, { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }]}>
              <Text style={[styles.codeText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                Quick start commands:
              </Text>
              <Text style={[styles.code, { color: isDarkMode ? '#f3f4f6' : '#374151' }]}>
                npm start - Start Metro bundler
              </Text>
            </View>
          </View>

          {/* Platform Cards */}
          <View style={styles.platformContainer}>
            <View style={[styles.platformCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.platformTitle, { color: textColor }]}>🖥️ Admin</Text>
              <Text style={[styles.platformPort, { color: textColor, opacity: 0.7 }]}>:5173</Text>
            </View>
            <View style={[styles.platformCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.platformTitle, { color: textColor }]}>🌐 Client</Text>
              <Text style={[styles.platformPort, { color: textColor, opacity: 0.7 }]}>:3000</Text>
            </View>
            <View style={[styles.platformCard, { backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe', borderWidth: 2, borderColor: isDarkMode ? '#3b82f6' : '#2563eb' }]}>
              <Text style={[styles.platformTitle, { color: isDarkMode ? '#60a5fa' : '#1d4ed8' }]}>📱 Mobile</Text>
              <Text style={[styles.platformPort, { color: isDarkMode ? '#93c5fd' : '#2563eb' }]}>You are here</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor, opacity: 0.5 }]}>
              📖 Check README.md for complete setup instructions
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  codeBlock: {
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 12,
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  platformContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  platformCard: {
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  platformTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  platformPort: {
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default App;
