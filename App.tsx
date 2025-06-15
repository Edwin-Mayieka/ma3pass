import 'react-native-gesture-handler';
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
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ChatScreen from './components/ChatScreen';
import ChatInfo from './components/ChatInfo';
import Profile from './components/Profile';
import ContactList from './components/ContactList';
import Settings from './components/Settings';
import { Button, Dialog, Portal, Provider as PaperProvider } from 'react-native-paper';
import { Drawer as PaperDrawer } from 'react-native-paper';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';

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

type DrawerParamList = {
  MainStack: undefined;
  Profile: undefined;
  Settings: undefined;
};

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
  ContactList: undefined;
};

type RequestsScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'Home'>,
  DrawerNavigationProp<DrawerParamList>
>;

type RequestsScreenProps = {
  navigation: RequestsScreenNavigationProp;
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
const Drawer = createDrawerNavigator();

function DrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.userInfoSection}>
            <View style={styles.profileSection}>
              <View style={styles.profileImage}>
                <Ionicons name="person-circle" size={60} color="#2563eb" />
              </View>
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userRole}>Driver</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <PaperDrawer.Section>
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            )}
            label="Profile"
            onPress={() => props.navigation.navigate('Profile')}
          />
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="help-circle-outline" size={size} color={color} />
            )}
            label="Help & Support"
            onPress={() => {}}
          />
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="information-circle-outline" size={size} color={color} />
            )}
            label="About Ma3pass (v1.0.0)"
            onPress={() => {}}
          />
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            )}
            label="Terms of Service"
            onPress={() => {}}
          />
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="shield-outline" size={size} color={color} />
            )}
            label="Privacy Policy"
            onPress={() => {}}
          />
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            )}
            label="Settings"
            onPress={() => props.navigation.navigate('Settings')}
          />
          <PaperDrawer.Item
            icon={({ color, size }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            )}
            label="Sign Out"
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                      // Add sign out logic here
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        </PaperDrawer.Section>
      </View>
    </DrawerContentScrollView>
  );
}

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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      </Portal>
    </SafeAreaView>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={RequestsScreen}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
      />
      <Stack.Screen 
        name="ChatInfo" 
        component={ChatInfo}
      />
      <Stack.Screen 
        name="ContactList" 
        component={ContactList}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider>
            <Drawer.Navigator
              drawerContent={(props) => <DrawerContent {...props} />}
              screenOptions={{
                headerShown: false,
                drawerStyle: {
                  backgroundColor: '#fff',
                  width: 280,
                },
                drawerType: 'front',
                overlayColor: 'rgba(0,0,0,0.5)',
                swipeEnabled: true,
                swipeEdgeWidth: 100,
                drawerStatusBarAnimation: 'slide',
              }}
              initialRouteName="MainStack"
            >
              <Drawer.Screen 
                name="MainStack" 
                component={MainStack}
                options={{
                  drawerItemStyle: { display: 'none' }
                }}
              />
              <Drawer.Screen 
                name="Profile" 
                component={Profile}
                options={{
                  drawerIcon: ({ color, size }) => (
                    <Ionicons name="person-outline" size={size} color={color} />
                  ),
                }}
              />
              <Drawer.Screen 
                name="Settings" 
                component={Settings}
                options={{
                  drawerIcon: ({ color, size }) => (
                    <Ionicons name="settings-outline" size={size} color={color} />
                  ),
                }}
              />
            </Drawer.Navigator>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfoSection: {
    marginBottom: 15,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
  },
  drawerSection: {
    marginTop: 15,
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
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
});
