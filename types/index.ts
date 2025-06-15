export type RequestType = 'traffic_update' | 'route_assignment';

export interface Member {
  id: string;
  vehiclePlate: string;
  requestor: string;
  route: string;
  timestamp: Date;
  location: string;
  chatName?: string;
  isGrouped?: boolean;
  groupMembers?: Member[];
  sacco?: string;
}

export interface Recipient {
  id: string;
  name: string;
  vehiclePlate: string;
  isPinned?: boolean;
  isRegistered: boolean;
  sacco?: string;
}

export type RequestItem = Member;

export type DrawerParamList = {
  MainStack: undefined;
  Account: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
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