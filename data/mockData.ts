import { Member, Recipient, RequestItem } from '../types';

export const mockRecipients: Recipient[] = [
  { 
    id: '1', 
    name: 'John Smith', 
    vehiclePlate: 'KCF 456Y', 
    isPinned: true, 
    isRegistered: true,
    sacco: 'Super Metro'
  },
  { 
    id: '2', 
    name: 'Mary Johnson', 
    vehiclePlate: 'KDG 789Z', 
    isPinned: true, 
    isRegistered: true,
    sacco: 'Metro Trans'
  },
  { 
    id: '3', 
    name: 'Peter Omondi', 
    vehiclePlate: 'KBZ 123X', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'City Hoppa'
  },
  { 
    id: '4', 
    name: 'Sarah Kamau', 
    vehiclePlate: 'KCA 234W', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Super Metro'
  },
  { 
    id: '5', 
    name: 'James Maina', 
    vehiclePlate: 'KDE 567H', 
    isPinned: true, 
    isRegistered: true,
    sacco: 'Forward Travelers'
  },
  { 
    id: '6', 
    name: 'Alice Wanjiku', 
    vehiclePlate: 'KBN 890P', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Metro Trans'
  },
  { 
    id: '7', 
    name: 'David Kiprop', 
    vehiclePlate: 'KCH 345M', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'City Hoppa'
  },
  { 
    id: '8', 
    name: 'Grace Akinyi', 
    vehiclePlate: 'KDJ 678N', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Forward Travelers'
  },
  { 
    id: '9', 
    name: 'Michael Njoroge', 
    vehiclePlate: 'KBP 901Q', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Super Metro'
  },
  { 
    id: '10', 
    name: 'Elizabeth Mutua', 
    vehiclePlate: 'KCL 234R', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Metro Trans'
  },
  { 
    id: '11', 
    name: 'Daniel Kimani', 
    vehiclePlate: 'KDM 567S', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'City Hoppa'
  },
  { 
    id: '12', 
    name: 'Faith Wambui', 
    vehiclePlate: 'KBR 890T', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Forward Travelers'
  },
  { 
    id: '13', 
    name: 'Joseph Ochieng', 
    vehiclePlate: 'KCN 123U', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Super Metro'
  },
  { 
    id: '14', 
    name: 'Catherine Njeri', 
    vehiclePlate: 'KDP 456V', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Metro Trans'
  },
  { 
    id: '15', 
    name: 'Stephen Mutuku', 
    vehiclePlate: 'KBT 789W', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'City Hoppa'
  },
  { 
    id: '16', 
    name: 'Ann Muthoni', 
    vehiclePlate: 'KCQ 012X', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Forward Travelers'
  },
  { 
    id: '17', 
    name: 'Patrick Kibet', 
    vehiclePlate: 'KDR 345Y', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Super Metro'
  },
  { 
    id: '18', 
    name: 'Lucy Wairimu', 
    vehiclePlate: 'KBV 678Z', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'Metro Trans'
  },
  { 
    id: '19', 
    name: 'George Otieno', 
    vehiclePlate: 'KCS 901A', 
    isPinned: false, 
    isRegistered: true,
    sacco: 'City Hoppa'
  },
];

export const mockRequests: RequestItem[] = [
  {
    id: '1',
    vehiclePlate: 'KBZ 123X',
    requestor: 'John Kamau',
    route: 'Westlands - CBD',
    location: 'Westlands',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    chatName: 'John Kamau',
    sacco: 'Super Metro',
  },
  {
    id: '2',
    vehiclePlate: 'KCA 234W',
    requestor: 'Mary Wanjiku',
    route: 'Thika Road - CBD',
    location: 'Thika Road',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    chatName: 'Mary Wanjiku',
    sacco: 'Metro Trans',
  },
  {
    id: '3',
    vehiclePlate: 'KDE 567H',
    requestor: 'Peter Omondi',
    route: 'Mombasa Road - CBD',
    location: 'Mombasa Road',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    chatName: 'Peter Omondi',
    sacco: 'City Hoppa',
  },
]; 