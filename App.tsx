import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatScreen from './components/ChatScreen';
import ChatInfo from './components/ChatInfo';
import { Button, Dialog, Portal, Provider as PaperProvider } from 'react-native-paper';

type Member = {
  id: string;
  vehiclePlate: string;
  requestor: string;
  route: string;
  timestamp: Date;
  location: string;
  chatName?: string;
  isGrouped?: boolean;
  groupMembers?: Member[];
};

type RequestItem = Member;

type RootStackParamList = {
  Home: undefined;
  Chat: {
    members: Member[];
    isLiveSpace?: boolean;
    chatName?: string;
  };
  ChatInfo: {
    members: Member[];
  };
};

const mockRequests: RequestItem[] = [
  {
    id: '1',
    vehiclePlate: 'KBZ 123X',
    requestor: 'John Kamau',
    route: 'Westlands - CBD',
    location: 'Westlands',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    chatName: 'John Kamau',
  },
  {
    id: '2',
    vehiclePlate: 'KCF 456Y',
    requestor: 'Peter Omondi',
    route: 'Westlands - CBD',
    location: 'Westlands',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    chatName: 'Peter Omondi',
  },
  {
    id: '3',
    vehiclePlate: 'KDG 789Z',
    requestor: 'Mary Njeri',
    route: 'Kasarani - CBD',
    location: 'Kasarani',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    chatName: 'Mary Njeri',
  },
];

const Stack = createNativeStackNavigator<RootStackParamList>();

type RequestsScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

function RequestsScreen({ navigation }: RequestsScreenProps) {
  const [requests, setRequests] = useState<RequestItem[]>(mockRequests);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [existingGroupChats] = useState<Set<string>>(new Set());
  const [isChatNameDialogVisible, setIsChatNameDialogVisible] = useState(false);
  const [pendingChatNavigation, setPendingChatNavigation] = useState<{
    members: Member[];
    isLiveSpace: boolean;
  } | null>(null);
  const [chatName, setChatName] = useState('');

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

  const handleChatNameSubmit = () => {
    if (!pendingChatNavigation) return;

    const { members, isLiveSpace } = pendingChatNavigation;
    
    // Generate a deterministic ID based on sorted member IDs
    const groupId = members
      .map(item => item.id)
      .sort()
      .join('_');

    // Create a new grouped item with the chat name
    const groupedItem: RequestItem = {
      id: groupId,
      vehiclePlate: chatName || `Group (${members.length})`, // Ensure we always have a string
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
      // If group doesn't exist, create it and remove individual items
      return [
        groupedItem,
        ...prev.filter(item => !members.some(selectedItem => selectedItem.id === item.id))
      ];
    });

    // Navigate to chat with the chat name
    navigation.navigate('Chat', {
      members: members.map(item => ({
        ...item,
        chatName: chatName, // Use the chat name for all members
        location: item.location,
      })),
      isLiveSpace,
      chatName: chatName, // Use the chat name as the title
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
            <Text style={styles.vehiclePlate}>
              {item.isGrouped ? (item.chatName || item.vehiclePlate) : item.vehiclePlate}
            </Text>
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
              <Text style={styles.route}>{item.route}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
      <View style={styles.topBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Ma3pass</Text>
          {selectedIds.size > 0 && (
            <Text style={styles.selectedCount}>
              {selectedIds.size} selected
            </Text>
          )}
        </View>
        <View style={styles.topBarButtons}>
          {selectedIds.size > 0 ? (
            <>
              <TouchableOpacity 
                onPress={() => openChat(getSelectedItems())}
                style={styles.iconButton}
              >
                <Ionicons name="arrow-up" size={24} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDelete}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={24} color="#dc2626" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => console.log('Search')}>
                <Ionicons name="search" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log('Options')}>
                <Ionicons name="ellipsis-vertical" size={24} color="black" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <View 
        style={styles.listContainer} 
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) {
            clearSelection();
          }
        }}
      >
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      </View>
      
      <Portal>
        <Dialog
          visible={isChatNameDialogVisible}
          onDismiss={() => {
            setIsChatNameDialogVisible(false);
            setPendingChatNavigation(null);
            setChatName('');
            clearSelection();
          }}
        >
          <Dialog.Title>Enter Chat Name</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={chatName}
              onChangeText={setChatName}
              placeholder="Enter chat name"
              style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="text"
              onPress={() => {
                setIsChatNameDialogVisible(false);
                setPendingChatNavigation(null);
                setChatName('');
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
      </Portal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen 
              name="Home" 
              component={RequestsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="ChatInfo" 
              component={ChatInfo}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
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
  vehiclePlate: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
    flex: 1,
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
  route: {
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
});
