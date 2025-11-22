// Buyers.ts - Buyers model interfaces
export interface BuyerProfile {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  verified: boolean;
  memberSince: string;
}

export interface BuyerTransaction {
  id: string;
  date: string;
  quantity: number;
  grade: string;
  amount: number;
}