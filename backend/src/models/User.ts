// User.ts - User model interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mao' | 'buyer' | 'farmer';
  createdAt: Date;
}