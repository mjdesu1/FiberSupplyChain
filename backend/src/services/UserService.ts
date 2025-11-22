// UserService.ts - User service
import { User } from '../models/User';

export class UserService {
  // Get all users from Supabase
  static async getAllUsers(): Promise<User[]> {
    // This would normally fetch from Supabase
    return [];
  }

  // Get user by ID from Supabase
  static async getUserById(id: string): Promise<User | null> {
    // This would normally fetch from Supabase
    return null;
  }
}