export type UserRole = 'user' | 'barber' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: number;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  category: string; // "Hair", "Beard", "Nails", etc.
}

export interface BarberProfile extends UserProfile {
  bio: string;
  portfolio: string[]; // URLs
  rating: number;
  reviewCount: number;
  specialties: string[];
  services: Service[];
  category: string; // Primary category for discovery (e.g., "Barbershop", "Hair Salon")
  availability: {
    [day: string]: {
      start: string; // "09:00"
      end: string;   // "18:00"
      active: boolean;
    };
  };
}

export interface Appointment {
  id: string;
  userId: string;
  barberId: string;
  serviceId: string;
  startTime: number;
  endTime: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid';
  paymentId?: string;
  selectedHairstyle?: string; // URL or style name
  notes?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  imageURL?: string;
  timestamp: number;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[]; // [userId, barberId]
  lastMessage?: string;
  lastTimestamp?: number;
}

export interface Review {
  id: string;
  appointmentId: string;
  userId: string;
  barberId: string;
  rating: number;
  comment: string;
  createdAt: number;
}
