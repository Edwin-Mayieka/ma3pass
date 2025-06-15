import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import {
  Button,
  Dialog,
  Portal,
  FAB,
  List,
  SegmentedButtons,
  Searchbar,
  Chip,
  Snackbar,
} from 'react-native-paper';
import { RequestType, Member, Recipient, RequestItem, DrawerParamList, RootStackParamList } from '../types';
import { mockRecipients, mockRequests } from '../data/mockData';

type RequestsScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'Home'>,
  DrawerNavigationProp<DrawerParamList>
>;

type RequestsScreenProps = {
  navigation: RequestsScreenNavigationProp;
};

export default function RequestsScreen({ navigation }: RequestsScreenProps) {
  const [requests, setRequests] = useState<RequestItem[]>(mockRequests);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [existingGroupChats] = useState<Set<string>>(new Set());
  const [isChatNameDialogVisible, setIsChatNameDialogVisible] = useState(false);
  const [isCreateRequestDialogVisible, setIsCreateRequestDialogVisible] = useState(false);
  const [pendingChatNavigation, setPendingChatNavigation] = useState<{
    members: Member[];
    isLiveSpace: boolean;
  } | null>(null);
  const [chatName, setChatName] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRequest, setNewRequest] = useState({
    type: '' as RequestType,
    location: '',
    recipient: null as Recipient | null,
  });
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [isSelectingRecipient, setIsSelectingRecipient] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const filteredRecipients = mockRecipients
    .filter(recipient =>
      recipient.isRegistered && (
        recipient.name.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
        recipient.vehiclePlate?.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
        recipient.sacco?.toLowerCase().includes(recipientSearchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      // Sort pinned contacts to the top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then sort by name
      return a.name.localeCompare(b.name);
    });

  const toggleSelection = (id: string) => {
    const selectedItem = requests.find(r => r.id === id);
    if (!selectedItem) return;

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      // If deselecting
      if (newSet.has(id)) {
        newSet.delete(id);
        return newSet;
      }

      // If nothing is selected yet, allow selecting anything
      if (prev.size === 0) {
        newSet.add(id);
        return newSet;
      }

      // Get currently selected items
      const currentlySelected = requests.filter(item => prev.has(item.id));
      const hasGroupSelected = currentlySelected.some(item => item.isGrouped);
      const isSelectingGroup = selectedItem.isGrouped;

      // If a group is already selected, only allow selecting one non-group item
      if (hasGroupSelected) {
        if (!isSelectingGroup && currentlySelected.length === 1) {
          newSet.add(id);
        }
        return newSet;
      }

      // If selecting a group and we have regular items selected
      if (isSelectingGroup && currentlySelected.length === 1) {
        newSet.add(id);
        return newSet;
      }

      // If selecting regular items (no groups involved)
      if (!isSelectingGroup && !hasGroupSelected) {
        newSet.add(id);
        return newSet;
      }

      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const getSelectedItems = () => {
    return requests.filter(item => selectedIds.has(item.id));
  };

  const handleDelete = () => {
    const selectedItems = getSelectedItems();
    const itemCount = selectedItems.length;
    const itemWord = itemCount === 1 ? 'item' : 'items';
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${itemCount} ${itemWord}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRequests(prev => {
              const itemsToDelete = new Set(selectedIds);
              // If deleting a group chat, also remove its ID from tracking
              prev.forEach(item => {
                if (itemsToDelete.has(item.id) && item.isGrouped) {
                  existingGroupChats.delete(item.id);
                }
              });
              return prev.filter(item => !itemsToDelete.has(item.id));
            });
            clearSelection();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const openChat = (items: RequestItem[]) => {
    const selectedItems = getSelectedItems();
    
    // If this is a new group chat (multiple regular items selected)
    if (items.length > 1 && !items.some(item => item.isGrouped)) {
      // Generate a deterministic ID based on sorted member IDs
      const groupId = items
        .map(item => item.id)
        .sort()
        .join('_');

      // Check if the group already exists
      const existingGroup = requests.find(item => item.id === groupId);
      if (existingGroup) {
        // Remove the individual items and keep the group
        setRequests(prev => prev.filter(item => 
          !items.map(i => i.id).includes(item.id) || item.id === existingGroup.id
        ));

        // Navigate to the existing group chat
        navigation.navigate('Chat', {
          members: existingGroup.groupMembers?.map(item => ({
            ...item,
            chatName: existingGroup.chatName || existingGroup.vehiclePlate,
          })) || [],
          isLiveSpace: false,
          chatName: existingGroup.chatName || existingGroup.vehiclePlate,
        });
        clearSelection();
        return;
      }

      // Only show dialog for new groups that don't exist yet
      setPendingChatNavigation({
        members: items.map(item => ({
          ...item,
          location: item.location,
        })),
        isLiveSpace: false,
      });
      setIsChatNameDialogVisible(true);
      return;
    }

    // If we have a group and a single item selected (adding to group)
    if (items.length === 2 && items.some(item => item.isGrouped)) {
      const groupItem = items.find(item => item.isGrouped);
      const newMember = items.find(item => !item.isGrouped);
      
      if (groupItem && newMember && groupItem.groupMembers) {
        // Create updated members list
        const updatedMembers = [...groupItem.groupMembers, newMember];
        
        // Generate new group ID based on all members
        const newGroupId = updatedMembers
          .map(item => item.id)
          .sort()
          .join('_');

        // Update the group in the requests list and remove the added item
        setRequests(prev => prev.map(item => {
          if (item.id === groupItem.id) {
            return {
              ...item,
              id: newGroupId, // Update the group ID to include new member
              groupMembers: updatedMembers,
              requestor: updatedMembers.length > 2 
                ? `${updatedMembers[0].requestor}, ${updatedMembers[1].requestor}...`
                : updatedMembers.map(i => i.requestor).join(', '),
            };
          }
          return item;
        }).filter(item => item.id !== newMember.id));

        // Navigate to the updated chat
        navigation.navigate('Chat', {
          members: updatedMembers.map(item => ({
            ...item,
            chatName: groupItem.chatName || groupItem.vehiclePlate,
          })),
          isLiveSpace: false,
          chatName: groupItem.chatName || groupItem.vehiclePlate,
        });
        
        clearSelection();
        return;
      }
    }

    // If clicking a group chat directly, just open it without creating a new group
    if (items.length === 1 && items[0].isGrouped) {
      const groupItem = items[0];
      const groupMembers = groupItem.groupMembers || [];

      // Just navigate to the chat without modifying state
      navigation.navigate('Chat', {
        members: groupMembers.map(item => ({
          ...item,
          chatName: groupItem.chatName || groupItem.vehiclePlate,
        })),
        isLiveSpace: false,
        chatName: groupItem.chatName || groupItem.vehiclePlate,
      });
      
      clearSelection();
      return;
    }

    // Regular single chat opening logic
    navigation.navigate('Chat', {
      members: items.map(item => ({
        ...item,
        chatName: item.chatName || item.vehiclePlate,
        location: item.location,
      })),
      isLiveSpace: false,
      chatName: items[0].chatName || items[0].vehiclePlate,
    });

    clearSelection();
  };

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleCreateRequest = () => {
    if (!newRequest.type) {
      showToast('Please select a request type');
      return;
    }
    if (!newRequest.recipient) {
      showToast('Please select a recipient');
      return;
    }
    if (!newRequest.location) {
      showToast('Please enter your current location');
      return;
    }

    const request: RequestItem = {
      id: Date.now().toString(),
      vehiclePlate: newRequest.recipient.vehiclePlate || 'Unknown',
      requestor: newRequest.recipient.name,
      route: 'Westlands - CBD', // This would come from account details in production
      location: newRequest.location,
      timestamp: new Date(),
      chatName: newRequest.recipient.name,
      sacco: newRequest.recipient.sacco,
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({
      type: '' as RequestType,
      location: '',
      recipient: null,
    });
    setIsCreateRequestDialogVisible(false);
  };

  const handleChatNameSubmit = () => {
    if (!pendingChatNavigation) return;

    if (!chatName.trim()) {
      showToast('Please enter a group chat name');
      return;
    }

    const { members, isLiveSpace } = pendingChatNavigation;
    
    // Generate a deterministic ID based on sorted member IDs
    const groupId = members
      .map(item => item.id)
      .sort()
      .join('_');

    // Create a new grouped item with the chat name
    const groupedItem: RequestItem = {
      id: groupId,
      vehiclePlate: chatName || `Group (${members.length})`,
      requestor: members.length > 2 
        ? `${members[0].requestor}, ${members[1].requestor}...`
        : members.map(i => i.requestor).join(', '),
      route: members[0].route,
      location: members[0].location || '',
      timestamp: new Date(),
      isGrouped: true,
      groupMembers: members,
      chatName: chatName,
    };

    // Update the requests list with the new group and remove individual items
    setRequests(prev => {
      return [
        groupedItem,
        ...prev.filter(item => !members.some(selectedItem => selectedItem.id === item.id))
      ];
    });

    // Navigate to chat with the chat name
    navigation.navigate('Chat', {
      members: members.map(item => ({
        ...item,
        chatName: chatName,
        location: item.location,
      })),
      isLiveSpace,
      chatName: chatName,
    });

    // Reset dialog state
    setIsChatNameDialogVisible(false);
    setPendingChatNavigation(null);
    setChatName('');
    clearSelection();
  };

  const handleItemPress = (item: RequestItem) => {
    if (selectedIds.size > 0) {
      toggleSelection(item.id);
    } else {
      openChat(item.isGrouped && item.groupMembers ? item.groupMembers : [item]);
    }
  };

  const handleItemLongPress = (item: RequestItem) => {
    if (selectedIds.size === 0) {
      toggleSelection(item.id);
    }
  };

  const handleLocationChipPress = (location: string) => {
    setNewRequest(prev => ({ ...prev, location }));
  };

  // Popular locations
  const popularLocations = [
    'CBD',
    'Westlands',
    'Kasarani',
    'Kiambu Road',
    'Thika Road',
    'Mombasa Road',
    'Ngong Road',
    'Karen',
  ];

  const renderRecipientItem = ({ item }: { item: Recipient }) => (
    <List.Item
      title={item.name}
      description={`${item.vehiclePlate}${item.sacco ? ` • ${item.sacco}` : ''}`}
      descriptionStyle={styles.recipientDescription}
      left={props => (
        <View style={styles.recipientIconContainer}>
          <List.Icon {...props} icon="account" />
          {item.isPinned && (
            <Ionicons 
              name="pin" 
              size={14} 
              color="#2563eb"
              style={styles.pinnedIcon}
            />
          )}
        </View>
      )}
      onPress={() => {
        setNewRequest(prev => ({ ...prev, recipient: item }));
        setIsSelectingRecipient(false);
        setRecipientSearchQuery('');
      }}
      style={styles.recipientItem}
    />
  );

  function renderItem({ item }: { item: RequestItem }) {
    const isSelected = selectedIds.has(item.id);
    
    const formatTimestamp = (date: Date) => {
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `${hours}h ago`;
      }
      return date.toLocaleDateString();
    };

    const truncateText = (text: string, maxLength: number) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
      <TouchableOpacity
        style={[
          styles.requestItem,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
      >
        <View style={styles.requestInfo}>
          <View style={styles.titleRow}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehiclePlate}>
                {item.isGrouped ? (item.chatName || item.vehiclePlate) : (
                  <>
                    {item.vehiclePlate}
                    {!item.isGrouped && item.sacco && (
                      <>
                        <Text style={styles.dotSeparator}> • </Text>
                        <Text style={styles.saccoName}>
                          {truncateText(item.sacco, 15)}
                        </Text>
                      </>
                    )}
                  </>
                )}
              </Text>
            </View>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <View style={styles.requestorRow}>
            <Text style={styles.requestor}>{item.requestor}</Text>
            {item.isGrouped ? (
              <View style={styles.groupInfo}>
                <Text style={styles.memberCount}>
                  {item.groupMembers?.length || 0}
                </Text>
                <Ionicons name="people" size={20} color="#666" />
              </View>
            ) : (
              <Text style={styles.location}>{item.location}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={() => {
          console.log('Opening drawer...');
          navigation.openDrawer();
        }}
        style={styles.menuButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="menu-outline" size={24} color="#222" />
      </TouchableOpacity>

      {isSearchVisible ? (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
            <Ionicons name="close-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Ma3Pass</Text>
            {selectedIds.size > 0 && (
              <Text style={styles.selectedCount}>
                {selectedIds.size} selected
              </Text>
            )}
          </View>
          
          <View style={styles.topBarButtons}>
            {selectedIds.size > 0 ? (
              <>
                <TouchableOpacity onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const selectedItems = getSelectedItems();
                    openChat(selectedItems);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setIsSearchVisible(true)}
                  style={styles.iconButton}
                >
                  <Ionicons name="search-outline" size={24} color="#222" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ContactList')}
                  style={styles.iconButton}
                >
                  <Ionicons name="people-outline" size={24} color="#222" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderTopBar()}
      <View style={styles.listContainer}>
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setIsCreateRequestDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={isChatNameDialogVisible} onDismiss={() => setIsChatNameDialogVisible(false)}>
          <Dialog.Title>Create Group Chat</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter group name..."
              value={chatName}
              onChangeText={setChatName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setIsChatNameDialogVisible(false);
                clearSelection();
              }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={handleChatNameSubmit} 
              disabled={!chatName.trim()}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={isCreateRequestDialogVisible} onDismiss={() => setIsCreateRequestDialogVisible(false)}>
          <Dialog.Title>New Request</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView>
              <View style={styles.dialogContent}>
                <View style={styles.requestTypeContainer}>
                  <Text style={styles.fieldLabel}>Request Type</Text>
                  <SegmentedButtons
                    value={newRequest.type}
                    onValueChange={value => setNewRequest(prev => ({ ...prev, type: value as RequestType }))}
                    buttons={[
                      { value: 'traffic_update', label: 'Traffic Update' },
                      { value: 'route_assignment', label: 'Route Assignment' },
                    ]}
                    style={styles.segmentedButtons}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Recipient</Text>
                  {newRequest.recipient ? (
                    <View style={styles.selectedRecipient}>
                      <View style={styles.selectedRecipientInfo}>
                        <Text style={styles.selectedRecipientName}>{newRequest.recipient.name}</Text>
                        <Text style={styles.selectedRecipientPlate}>{newRequest.recipient.vehiclePlate}</Text>
                      </View>
                      <Button
                        mode="outlined"
                        onPress={() => setIsSelectingRecipient(true)}
                        style={styles.changeRecipientButton}
                      >
                        Change
                      </Button>
                    </View>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={() => setIsSelectingRecipient(true)}
                      icon="account-plus"
                    >
                      Select Recipient
                    </Button>
                  )}
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Current Location</Text>
                  <TextInput
                    style={styles.dialogInput}
                    placeholder="Enter your current location"
                    value={newRequest.location}
                    onChangeText={text => setNewRequest(prev => ({ ...prev, location: text }))}
                  />
                  <View style={styles.locationChipsContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.locationChipsScroll}
                    >
                      {popularLocations.map((location) => (
                        <Chip
                          key={location}
                          mode="outlined"
                          selected={newRequest.location === location}
                          onPress={() => handleLocationChipPress(location)}
                          style={styles.locationChip}
                          selectedColor="#2563eb"
                        >
                          {location}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setIsCreateRequestDialogVisible(false)}>
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={handleCreateRequest}
              disabled={!newRequest.type || !newRequest.location || !newRequest.recipient}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={isSelectingRecipient} 
          onDismiss={() => setIsSelectingRecipient(false)}
          style={styles.recipientDialog}
        >
          <Dialog.Title>Select Recipient</Dialog.Title>
          <Dialog.Content style={styles.recipientDialogContent}>
            <Searchbar
              placeholder="Search by name, plate number, or sacco"
              onChangeText={setRecipientSearchQuery}
              value={recipientSearchQuery}
              style={styles.searchbar}
            />
            
            <FlatList
              data={filteredRecipients}
              renderItem={renderRecipientItem}
              keyExtractor={item => item.id}
              style={styles.recipientList}
              contentContainerStyle={styles.recipientListContent}
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsSelectingRecipient(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#000',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  iconButton: {
    marginLeft: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    height: 100,
    backgroundColor: '#fafbfc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  topBarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listContainer: {
    flex: 1,
  },
  requestItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectedItem: {
    backgroundColor: '#e8f0fe',
  },
  requestInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
  requestorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  requestor: {
    color: '#2563eb',
    fontSize: 15,
    flex: 1,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  timestamp: {
    color: '#666',
    fontSize: 13,
    marginLeft: 8,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#2563eb',
  },
  requestTypeContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: '#f1f5f9',
  },
  dialogInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  dialogContent: {
    padding: 20,
  },
  searchbar: {
    marginBottom: 16,
    marginHorizontal: 20,
    elevation: 0,
    backgroundColor: '#f1f5f9',
  },
  recipientDialog: {
    maxHeight: '80%',
  },
  recipientDialogContent: {
    paddingHorizontal: 0,
  },
  recipientList: {
    flex: 1,
  },
  recipientListContent: {
    paddingBottom: 16,
  },
  recipientItem: {
    paddingHorizontal: 20,
  },
  recipientDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  recipientIconContainer: {
    position: 'relative',
  },
  pinnedIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  selectedRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
  },
  selectedRecipientInfo: {
    flex: 1,
  },
  selectedRecipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 2,
  },
  selectedRecipientPlate: {
    fontSize: 14,
    color: '#64748b',
  },
  changeRecipientButton: {
    marginLeft: 12,
  },
  locationChipsContainer: {
    marginTop: 12,
  },
  locationChipsScroll: {
    paddingVertical: 8,
    gap: 8,
  },
  locationChip: {
    marginRight: 8,
  },
  snackbar: {
    marginBottom: 80,
  },
  dotSeparator: {
    color: '#64748b',
    fontSize: 14,
  },
  saccoName: {
    color: '#64748b',
    fontSize: 14,
  },
}); 