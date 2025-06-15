import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';

import ChatScreen from './components/ChatScreen';
import ChatInfo from './components/ChatInfo';
import Account from './components/Account';
import ContactList from './components/ContactList';
import Settings from './components/Settings';
import RequestsScreen from './components/RequestsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        <View style={styles.drawerHeader}>
          <View style={styles.userInfoSection}>
            <View style={styles.profileSection}>
              <Ionicons 
                name="person-circle-outline" 
                size={80} 
                color="#1e293b" 
                style={styles.profileImage}
              />
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userRole}>Driver</Text>
            </View>
          </View>
        </View>
        {props.children}
      </View>
    </DrawerContentScrollView>
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
                name="Account" 
                component={Account}
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
});
