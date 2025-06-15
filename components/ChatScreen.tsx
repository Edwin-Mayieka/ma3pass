import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  Easing,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface Member {
  vehiclePlate: string;
  id: string;
  requestor: string;
  sacco?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: string;
  type: 'text' | 'voice';
  duration?: number;
  uri?: string;
}

type RootStackParamList = {
  Chat: {
    members: Member[];
    isLiveSpace?: boolean;
    chatName?: string;
  };
  ChatInfo: {
    members: Member[];
  };
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { members, isLiveSpace } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [liveSpaceActive, setLiveSpaceActive] = useState(isLiveSpace || false);
  const marqueeAnim = useRef(new Animated.Value(0)).current;
  const recording = useRef<Audio.Recording | null>(null);

  // Create the marquee text
  const getMarqueeText = () => {
    return members.map(m => m.vehiclePlate).join(' • ');
  };

  // Marquee animation
  useEffect(() => {
    if (members.length > 1) {
      const textWidth = getMarqueeText().length * 10; // Approximate width based on text length
      const duration = textWidth * 50; // Adjust speed based on text length

      const startMarquee = () => {
        marqueeAnim.setValue(300); // Start from right edge
        Animated.timing(marqueeAnim, {
          toValue: -textWidth, // Move to left beyond screen
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => startMarquee()); // Loop animation
      };

      startMarquee();
    }
  }, [members.length]);

  const showChatInfo = () => {
    navigation.navigate('ChatInfo', { members });
  };

  const startLiveSpace = () => {
    setLiveSpaceActive(true);
    // Implement live space logic here
  };

  // Request audio permissions
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone to record voice notes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Function to handle sending a text message
  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date(),
        sender: 'currentUser',
        type: 'text',
      };
      setMessages(prev => [newMessage, ...prev]);
      setInputText('');
    }
  };

  // Function to start recording
  const startRecording = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record voice notes.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Function to stop recording and send voice message
  const stopRecording = async () => {
    try {
      if (!recording.current) return;

      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      setIsRecording(false);

      if (uri) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: 'Voice message',
          timestamp: new Date(),
          sender: 'currentUser',
          type: 'voice',
          duration: 5, // You would calculate actual duration
          uri: uri,
        };
        setMessages(prev => [newMessage, ...prev]);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Function to toggle voice recording
  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Function to play voice message
  const playVoiceMessage = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play voice message', err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[
        styles.messageContainer,
        item.sender === 'currentUser' && styles.sentMessage,
      ]}
      onPress={() => {
        if (item.type === 'voice' && item.uri) {
          playVoiceMessage(item.uri);
        }
      }}
    >
      {item.type === 'text' ? (
        <Text style={styles.messageText}>{item.text}</Text>
      ) : (
        <View style={styles.voiceMessageContainer}>
          <Ionicons name="mic" size={20} color="#2563eb" />
          <Text style={styles.voiceDuration}>{item.duration}s</Text>
          <Ionicons name="play" size={20} color="#2563eb" />
        </View>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.titleContainer} onPress={showChatInfo}>
          {members.length > 1 ? (
            <>
              <Text style={styles.title}>{route.params.chatName || 'Group Chat'}</Text>
              <Text style={styles.subtitle}>{members.length}</Text>
            </>
          ) : (
            <View style={styles.singleChatTitle}>
              <Text style={styles.title}>{members[0]?.requestor}</Text>
              <View style={styles.subtitleContainer}>
                <Text style={styles.vehiclePlateText}>{members[0]?.vehiclePlate}</Text>
                {members[0]?.sacco && (
                  <>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.saccoText}>
                      {members[0]?.sacco}
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
        {liveSpaceActive && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
          />
          {inputText.length > 0 ? (
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#2563eb" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={toggleRecording}
              style={[
                styles.sendButton,
                isRecording && styles.recordingButton,
              ]}
            >
              <Ionicons
                name="mic"
                size={24}
                color={isRecording ? '#dc2626' : '#2563eb'}
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {!liveSpaceActive && (
        <TouchableOpacity style={styles.fab} onPress={startLiveSpace}>
          <Ionicons name="radio-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  singleChatTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehiclePlateText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  dotSeparator: {
    color: '#94a3b8',
    marginHorizontal: 6,
    fontSize: 14,
  },
  saccoText: {
    fontSize: 14,
    color: '#64748b',
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
  titleContainer: {
    flex: 1,
    marginLeft: 16,
    overflow: 'hidden', // Ensure marquee stays within bounds
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  liveIndicator: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceDuration: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#fee2e2',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: '#2563eb',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e8f0fe',
  },
}); 