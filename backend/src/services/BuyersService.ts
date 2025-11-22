// BuyersService.ts - Buyers service
import { BuyerProfile, BuyerTransaction } from '../models/Buyers';

export class BuyersService {
  // Get buyer profile from Supabase
  static async getBuyerProfile(): Promise<BuyerProfile> {
    // This would normally fetch from Supabase
    return {
      id: '1',
      name: 'Nonoy Abaca Trading',
      contactPerson: 'Nonoy Reyes',
      phone: '+63 912 345 6789',
      email: 'nonoy@abacatrading.com',
      address: 'Barangay Culiram, Talacogon, Agusan del Sur',
      verified: true,
      memberSince: '2023-01-15'
    };
  }

  // Get buyer transactions from Supabase
  static async getBuyerTransactions(): Promise<BuyerTransaction[]> {
    // This would normally fetch from Supabase
    return [
      { id: '1', date: '2023-10-15', quantity: 50, grade: 'T1', amount: 25000 },
      { id: '2', date: '2023-09-22', quantity: 30, grade: 'T2', amount: 12000 }
    ];
  }
}