import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme,
  ActivityIndicator,
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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ContactList() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [longPressedId, setLongPressedId] = useState<string | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [
              Contacts.Fields.Name,
              Contacts.Fields.PhoneNumbers,
            ],
          });

          if (data.length > 0) {
            // Transform contacts data
            const transformedContacts: Contact[] = data
              .filter((contact): contact is Contacts.Contact & { id: string } => 
                typeof contact.id === 'string' && // Type guard for string ID
                Boolean(contact.name) && 
                Boolean(contact.phoneNumbers?.[0]?.number)
              )
              .map(contact => ({
                id: contact.id,
                name: contact.name || '',
                phoneNumber: contact.phoneNumbers?.[0]?.number || '',
                isRegistered: Math.random() < 0.3, // Simulate some contacts being registered
                isPinned: false,
                vehiclePlate: Math.random() < 0.2 ? `KX${Math.floor(Math.random() * 1000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}` : undefined,
                sacco: Math.random() < 0.15 ? ['Super Metro', 'Metro Trans', 'City Hoppa'][Math.floor(Math.random() * 3)] : undefined,
              }));

            setContacts(transformedContacts);
            setFilteredContacts(transformedContacts);
          }
        } else {
          Alert.alert(
            'Permission Required',
            'Please grant contacts permission to use this feature.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        Alert.alert(
          'Error',
          'Failed to load contacts. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setIsSearching(true);
    const searchTerms = debouncedSearchQuery.toLowerCase().split(' ');
    
    const filtered = contacts
      .filter(contact => {
        if (!debouncedSearchQuery) return true;
        
        return searchTerms.every(term =>
          contact.name.toLowerCase().includes(term) ||
          contact.phoneNumber.toLowerCase().includes(term) ||
          contact.vehiclePlate?.toLowerCase().includes(term) ||
          contact.sacco?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        // Sort pinned contacts to the top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by registration status
        if (a.isRegistered && !b.isRegistered) return -1;
        if (!a.isRegistered && b.isRegistered) return 1;
        
        // Finally sort by name
        return a.name.localeCompare(b.name);
      });

    setFilteredContacts(filtered);
    setIsSearching(false);
  }, [debouncedSearchQuery, contacts]);

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

  const togglePin = (contact: Contact) => {
    setContacts(prevContacts =>
      prevContacts.map(c =>
        c.id === contact.id
          ? { ...c, isPinned: !c.isPinned }
          : c
      )
    );
    setLongPressedId(null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredContacts(contacts);
  };

  const handleLongPress = (contact: Contact) => {
    setLongPressedId(contact.id);
  };

  const handlePress = (contact: Contact) => {
    if (longPressedId === contact.id) {
      togglePin(contact);
    }
  };

  const renderItem = ({ item }: { item: Contact }) => {
    const isLongPressed = longPressedId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          item.isPinned && styles.pinnedContact,
          isLongPressed && styles.longPressedItem
        ]}
        onLongPress={() => handleLongPress(item)}
        onPress={() => handlePress(item)}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        <View style={styles.contactInfo}>
          <View style={styles.avatarSection}>
            <Avatar.Text
              size={50}
              label={item.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: item.isRegistered ? theme.colors.primary : '#94a3b8' }}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>
              {item.name}
              {item.isPinned && (
                <Text style={styles.pinnedIndicator}> • Pinned</Text>
              )}
            </Text>
            <Text style={styles.phone}>{item.phoneNumber}</Text>
            {item.vehiclePlate && (
              <Text style={[styles.vehiclePlate, { color: theme.colors.primary }]}>
                {item.vehiclePlate} {item.sacco ? `• ${item.sacco}` : ''}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            mode={item.isRegistered ? "contained" : "outlined"}
            onPress={() => {
              if (isLongPressed) {
                togglePin(item);
              } else if (!item.isRegistered) {
                handleInvite(item);
              }
              // If registered and not long pressed, do nothing (will be handled by navigation)
            }}
            style={[
              item.isRegistered ? styles.messageButton : styles.inviteButton,
              { borderColor: theme.colors.primary },
              item.isRegistered && { backgroundColor: theme.colors.primary }
            ]}
          >
            {isLongPressed 
              ? (item.isPinned ? "Unpin" : "Pin") 
              : (item.isRegistered ? "Message" : "Invite")
            }
          </Button>
        </View>
      </TouchableOpacity>
    );
  };

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
          placeholder="Search by name, phone, vehicle..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery ? (
              <TextInput.Icon 
                icon="close" 
                onPress={handleClearSearch}
              />
            ) : null
          }
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons 
            name="search" 
            size={48} 
            color={theme.colors.surfaceDisabled} 
            style={styles.noResultsIcon} 
          />
          <Text style={styles.noResultsText}>
            {searchQuery 
              ? 'No contacts found matching your search'
              : 'No contacts found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isSearching ? (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            ) : null
          }
        />
      )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsIcon: {
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  searchingText: {
    marginLeft: 8,
    color: '#64748b',
  },
  listContent: {
    flexGrow: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSection: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: '500',
  },
  longPressedItem: {
    backgroundColor: '#fef3c7', // Light amber background
  },
  pinnedContact: {
    backgroundColor: '#f8fafc',
  },
  pinnedIndicator: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: 'normal',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    marginLeft: 8,
  },
  inviteButton: {
    marginLeft: 8,
  },
}); 