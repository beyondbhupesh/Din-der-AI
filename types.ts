export enum AppScreen {
  LANDING = 'LANDING',
  LOBBY = 'LOBBY',
  LOCATION = 'LOCATION',
  SWIPE = 'SWIPE',
  MATCH = 'MATCH'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  status: 'active' | 'idle' | 'ready';
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  price: string;
  rating: number;
  distance: string;
  image: string;
  tags: string[];
  reviews: number;
  googleMapsUri?: string;
}