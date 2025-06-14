import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface Member {
  id: string;
  vehiclePlate: string;
  requestor: string;
  route: string;
  timestamp: Date;
}

type RootStackParamList = {
  Requests: undefined;
  Chat: {
    members: Member[];
    isLiveSpace?: boolean;
  };
  ChatInfo: {
    members: Member[];
  };
};

type ChatInfoProps = NativeStackScreenProps<RootStackParamList, 'ChatInfo'>;

export default function ChatInfo({ route, navigation }: ChatInfoProps) {
  const { members } = route.params;

  // Function to format the time
  const formatTime = (date: Date) => {
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

  const showMemberOptions = (member: Member) => {
    Alert.alert(
      'Member Options',
      member.vehiclePlate,
      [
        {
          text: 'Remove from Chat',
          style: 'destructive',
          onPress: () => {
            // Remove member from chat
          },
        },
        {
          text: 'View Location',
          onPress: () => {
            // Navigate to map view
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberContainer}
      onPress={() => showMemberOptions(item)}
    >
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
          <Text style={styles.vehiclePlate}>{item.vehiclePlate}</Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.requestor}>{item.requestor}</Text>
        <Text style={styles.route}>{item.route}</Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Info</Text>
      </View>

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>
          Members ({members.length})
        </Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.membersList}
        />
      </View>
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
    borderBottomColor: '#e5e7eb',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#000',
  },
  membersSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  membersList: {
    padding: 16,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehiclePlate: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  requestor: {
    color: '#2563eb',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
  },
  route: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
}); 