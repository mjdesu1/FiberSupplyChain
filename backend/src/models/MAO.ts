// MAO.ts - MAO model interfaces
export interface MAODashboard {
  totalFarmers: number;
  totalBuyers: number;
  totalTransactions: number;
  fiberQuality: string;
  lastUpdated: string;
}

export interface VerifiedBuyer {
  id: string;
  name: string;
  location: string;
}