import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  TouchableRipple,
  Avatar,
  Button,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useNavigation } from '@react-navigation/native';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  vehiclePlate?: string;
  sacco?: string;
  isRegistered: boolean;
  isPinned: boolean;
}

export default function ContactList() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
          });

          if (data.length > 0) {
            // Transform contacts and add mock data for demo
            const transformedContacts: Contact[] = data
              .filter((contact): contact is Contacts.Contact & { id: string } => 
                typeof contact.id === 'string'
              )
              .map((contact) => ({
                id: contact.id,
                name: contact.name || 'Unknown',
                phoneNumber: contact.phoneNumbers?.[0]?.number || '',
                isRegistered: Math.random() > 0.5, // Mock registration status
                vehiclePlate: Math.random() > 0.5 ? `KBZ ${Math.floor(Math.random() * 1000)}X` : undefined,
                sacco: Math.random() > 0.5 ? 'Metro Transit' : undefined,
                isPinned: false,
              }));

            setContacts(transformedContacts);
            setFilteredContacts(transformedContacts);
          }
        } else {
          Alert.alert(
            'Permission Required',
            'Please grant contacts permission to use this feature',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        Alert.alert('Error', 'Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const filtered = contacts
      .filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery) ||
        contact.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.sacco?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort pinned contacts first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then sort by name
        return a.name.localeCompare(b.name);
      });

    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const handleInvite = async (contact: Contact) => {
    try {
      const message = `Join me on Ma3pass! Download the app to stay connected and get real-time traffic updates. Contact: ${contact.name}`;
      await Share.share({
        message,
        title: 'Join Ma3pass',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const togglePin = (contactId: string) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, isPinned: !contact.isPinned }
          : contact
      )
    );
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={50}
            label={item.name.split(' ').map(n => n[0]).join('')}
            style={{ backgroundColor: item.isRegistered ? theme.colors.primary : '#94a3b8' }}
          />
          {item.isPinned && (
            <View style={[styles.pinnedBadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="pin" size={12} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phoneNumber}</Text>
          {item.vehiclePlate && (
            <Text style={[styles.vehiclePlate, { color: theme.colors.primary }]}>
              {item.vehiclePlate} {item.sacco ? `• ${item.sacco}` : ''}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <IconButton
          icon={item.isPinned ? "pin" : "pin-outline"}
          size={20}
          onPress={() => togglePin(item.id)}
          style={styles.pinButton}
        />
        {item.isRegistered ? (
          <Button
            mode="contained"
            onPress={() => {}}
            style={[styles.messageButton, { backgroundColor: theme.colors.primary }]}
          >
            Message
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={() => handleInvite(item)}
            style={[styles.inviteButton, { borderColor: theme.colors.primary }]}
          >
            Invite
          </Button>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableRipple onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" style={styles.backButton} />
        </TouchableRipple>
        <Text style={styles.title}>Contacts</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.listContent}
      />
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
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  pinnedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinButton: {
    margin: 0,
  },
  messageButton: {
    marginLeft: 8,
  },
  inviteButton: {
    marginLeft: 8,
  },
}); 