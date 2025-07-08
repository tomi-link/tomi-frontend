export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'business' | 'admin';
  token?: string;
}

export interface Business {
  id: number;
  name: string;
  description: string;
  category: string;
  phone: string;
  location: string;
  imageUrl?: string;
  rating?: number;
}

export interface Review {
  id: number;
  userId: number;
  businessId: number;
  comment: string;
  rating: number;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
}
