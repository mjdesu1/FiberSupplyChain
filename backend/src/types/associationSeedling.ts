// types/associationSeedling.ts - Association-based seedling distribution types and interfaces

export interface AssociationSeedlingDistribution {
  distribution_id: string;
  variety: string;
  source_supplier?: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_association_id: string;
  recipient_association_name: string;
  remarks?: string;
  status: 'distributed_to_association' | 'partially_distributed_to_farmers' | 'fully_distributed_to_farmers' | 'cancelled';
  distributed_by: string;
  created_at: string;
  updated_at: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
}

export interface FarmerSeedlingDistribution {
  distribution_id: string;
  association_distribution_id: string;
  variety: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_farmer_id: string;
  remarks?: string;
  status: 'distributed_to_farmer' | 'planted' | 'damaged' | 'replanted' | 'lost' | 'other';
  distributed_by_association: string;
  created_at: string;
  updated_at: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
  planting_date?: string;
  planting_location?: string;
  planting_photo_1?: string;
  planting_photo_2?: string;
  planting_photo_3?: string;
  planting_notes?: string;
  planted_by?: string;
  planted_at?: string;
}

export interface CreateAssociationDistributionDTO {
  variety: string;
  source_supplier?: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_association_id: string;
  remarks?: string;
  status?: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
}

export interface CreateFarmerDistributionDTO {
  farmer_id: string;
  quantity_distributed: number;
  remarks?: string;
}

export interface DistributeFarmersDTO {
  association_distribution_id: string;
  farmer_distributions: CreateFarmerDistributionDTO[];
}

export interface AssociationDistributionWithDetails extends AssociationSeedlingDistribution {
  organization?: {
    officer_id: string;
    full_name: string;
  };
  association_officers?: {
    officer_id: string;
    full_name: string;
    association_name: string;
    contact_number?: string;
  };
}

export interface FarmerDistributionWithDetails extends FarmerSeedlingDistribution {
  farmers?: {
    farmer_id: string;
    full_name: string;
    email: string;
    contact_number?: string;
    municipality?: string;
    barangay?: string;
    association_name?: string;
  };
  association_officers?: {
    officer_id: string;
    full_name: string;
    association_name: string;
    contact_number?: string;
  };
  association_seedling_distributions?: {
    distribution_id: string;
    variety: string;
    source_supplier?: string;
    date_distributed: string;
    organization?: {
      officer_id: string;
      full_name: string;
    };
  };
}

export interface DistributionStats {
  association_distributions: {
    total: number;
    this_month: number;
    total_quantity: number;
  };
  farmer_distributions: {
    total: number;
    this_month: number;
    total_quantity: number;
    planted_quantity: number;
  };
  overall: {
    total_distributions: number;
    total_seedlings: number;
    distributed_to_farmers: number;
    planted_seedlings: number;
    planting_rate: string;
  };
}

export interface CUSAFADistributionData {
  association_distributions: AssociationDistributionWithDetails[];
  farmer_distributions: FarmerDistributionWithDetails[];
  summary: {
    total_association_distributions: number;
    total_farmer_distributions: number;
    total_seedlings_to_associations: number;
    total_seedlings_to_farmers: number;
  };
}

export interface PlantingData {
  planting_date: string;
  planting_location: string;
  planting_photo_1?: string;
  planting_photo_2?: string;
  planting_photo_3?: string;
  planting_notes?: string;
}