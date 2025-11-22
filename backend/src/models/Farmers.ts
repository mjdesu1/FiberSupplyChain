// Farmers.ts - Farmers model interfaces
export interface FarmerProfile {
  id: string;
  name: string;
  farmLocation: string;
  contact: string;
  totalArea: string;
  fiberGrade: string;
  memberSince: string;
}

export interface FarmerListing {
  id: string;
  date: string;
  quantity: number;
  grade: string;
  status: string;
}