import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List, Switch, Divider, TouchableRipple, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Settings() {
  const navigation = useNavigation();
  const theme = useTheme();
  
  // App Settings
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isBackgroundLocationEnabled, setIsBackgroundLocationEnabled] = useState(true);
  const [isLiveModeEnabled, setIsLiveModeEnabled] = useState(true);
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);
  const [isAutoPlayVoiceNotes, setIsAutoPlayVoiceNotes] = useState(true);
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableRipple onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" style={styles.backButton} />
        </TouchableRipple>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Account Settings */}
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Account Information"
            description="Manage your account details"
            left={props => <List.Icon {...props} icon="account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy"
            description="Manage your privacy settings"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </List.Section>
        
        <Divider />
        
        {/* App Settings */}
        <List.Section>
          <List.Subheader>App Settings</List.Subheader>
          <List.Item
            title="Dark Mode"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
              />
            )}
          />
          <List.Item
            title="Notifications"
            description="Manage push notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
              />
            )}
          />
          <List.Item
            title="Location Services"
            description="Allow app to access your location"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={isLocationEnabled}
                onValueChange={setIsLocationEnabled}
              />
            )}
          />
          <List.Item
            title="Background Location"
            description="Allow location access while app is in background"
            left={props => <List.Icon {...props} icon="crosshairs-gps" />}
            right={() => (
              <Switch
                value={isBackgroundLocationEnabled}
                onValueChange={setIsBackgroundLocationEnabled}
              />
            )}
          />
        </List.Section>
        
        <Divider />
        
        {/* Chat & Communication */}
        <List.Section>
          <List.Subheader>Chat & Communication</List.Subheader>
          <List.Item
            title="Live Mode"
            description="Enable live traffic updates and spaces"
            left={props => <List.Icon {...props} icon="access-point" />}
            right={() => (
              <Switch
                value={isLiveModeEnabled}
                onValueChange={setIsLiveModeEnabled}
              />
            )}
          />
          <List.Item
            title="Data Saver"
            description="Reduce data usage for media and updates"
            left={props => <List.Icon {...props} icon="data-matrix" />}
            right={() => (
              <Switch
                value={isDataSaverEnabled}
                onValueChange={setIsDataSaverEnabled}
              />
            )}
          />
          <List.Item
            title="Auto-play Voice Notes"
            description="Automatically play voice notes in chats"
            left={props => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={isAutoPlayVoiceNotes}
                onValueChange={setIsAutoPlayVoiceNotes}
              />
            )}
          />
        </List.Section>
        
        <Divider />
        
        {/* Support & About */}
        <List.Section>
          <List.Subheader>Support & About</List.Subheader>
          <List.Item
            title="Help & Support"
            description="Get help and contact support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="About Ma3pass"
            description="Version 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </List.Section>
        
        {/* Danger Zone */}
        <List.Section>
          <List.Subheader style={styles.dangerZone}>Danger Zone</List.Subheader>
          <List.Item
            title="Clear Cache"
            description="Clear temporary files and data"
            left={props => <List.Icon {...props} icon="trash-can" color={theme.colors.error} />}
            onPress={() => {}}
          />
          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginTop: 8,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  dangerZone: {
    color: '#dc2626',
  },
}); 