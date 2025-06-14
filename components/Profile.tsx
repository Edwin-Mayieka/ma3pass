import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, List, TouchableRipple, Avatar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const navigation = useNavigation();
  
  // Profile Data States
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'John Doe',
    saccoName: 'Metro Transit',
    phoneNumber: '+254 712 345 678',
    email: 'john.doe@example.com',
    memberSince: 'January 2024',
    tripsCompleted: 156,
    rating: 4.8,
    status: 'Active',
    routes: ['Nairobi CBD - Westlands', 'Westlands - Kangemi']
  });
  const [editableData, setEditableData] = useState({ ...profileData });
  
  // Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Save Profile Changes
  const saveChanges = () => {
    setProfileData(editableData);
    setIsEditing(false);
  };

  // Cancel Editing
  const cancelEditing = () => {
    setEditableData({ ...profileData });
    setIsEditing(false);
  };

  // Add New Route
  const addRoute = () => {
    // Implementation for adding a new route
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableRipple onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" style={styles.backButton} />
        </TouchableRipple>
        <Text style={styles.title}>Profile</Text>
        <TouchableRipple onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color="black" />
        </TouchableRipple>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          {profileImage ? (
            <Avatar.Image size={120} source={{ uri: profileImage }} />
          ) : (
            <Avatar.Text size={120} label={profileData.username.split(' ').map(n => n[0]).join('')} />
          )}
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        <View style={styles.statusSection}>
          <Chip 
            icon="check-circle" 
            mode="outlined" 
            style={[styles.statusChip, { backgroundColor: '#e0f2f1' }]}
          >
            {profileData.status}
          </Chip>
          <Chip 
            icon="star" 
            mode="outlined" 
            style={[styles.statusChip, { backgroundColor: '#fff3e0' }]}
          >
            {profileData.rating} Rating
          </Chip>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <TextInput
              label="Username"
              value={isEditing ? editableData.username : profileData.username}
              onChangeText={(text) => setEditableData({ ...editableData, username: text })}
              disabled={!isEditing}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Sacco Name"
              value={isEditing ? editableData.saccoName : profileData.saccoName}
              onChangeText={(text) => setEditableData({ ...editableData, saccoName: text })}
              disabled={!isEditing}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Phone Number"
              value={profileData.phoneNumber}
              disabled={true}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={profileData.email}
              disabled={true}
              mode="outlined"
              style={styles.input}
            />
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.tripsCompleted}</Text>
              <Text style={styles.statLabel}>Trips Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.memberSince}</Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* Routes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Routes</Text>
            {isEditing && (
              <TouchableOpacity onPress={addRoute}>
                <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
          {profileData.routes.map((route, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.routeChip}
              onClose={isEditing ? () => {
                const newRoutes = editableData.routes.filter((_, i) => i !== index);
                setEditableData({ ...editableData, routes: newRoutes });
              } : undefined}
            >
              {route}
            </Chip>
          ))}
        </View>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <View style={styles.buttonGroup}>
            <Button 
              mode="contained" 
              onPress={saveChanges}
              style={[styles.button, styles.saveButton]}
            >
              Save Changes
            </Button>
            <Button 
              mode="outlined" 
              onPress={cancelEditing}
              style={styles.button}
            >
              Cancel
            </Button>
          </View>
        )}
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
    flex: 1,
  },
  editButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  changePhotoButton: {
    marginTop: 12,
  },
  changePhotoText: {
    color: '#2563eb',
    fontSize: 16,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statusChip: {
    borderRadius: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  routeChip: {
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
}); 