// types/seedling.ts - Seedling types and interfaces

export interface Seedling {
  seedling_id: string;
  variety: string;
  source_supplier?: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_farmer_id?: string;
  recipient_association?: string;
  remarks?: string;
  status: 'distributed_to_farmer' | 'planted' | 'damaged' | 'replanted' | 'lost' | 'other';
  distributed_by?: string;
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
  created_at: string;
  updated_at: string;
}

export interface CreateSeedlingDTO {
  variety: string;
  source_supplier?: string;
  quantity_distributed: number;
  date_distributed: string;
  recipient_farmer_id?: string;
  recipient_association?: string;
  remarks?: string;
  status?: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
}

export interface UpdateSeedlingDTO {
  variety?: string;
  source_supplier?: string;
  quantity_distributed?: number;
  date_distributed?: string;
  recipient_farmer_id?: string;
  recipient_association?: string;
  remarks?: string;
  status?: string;
  seedling_photo?: string;
  packaging_photo?: string;
  quality_photo?: string;
}

export interface SeedlingWithDetails extends Seedling {
  farmer_name?: string;
  farmer_email?: string;
  officer_name?: string;
}

export interface MarkAsPlantedDTO {
  planting_date: string;
  planting_location?: string;
  planting_photo_1?: string;
  planting_photo_2?: string;
  planting_photo_3?: string;
  planting_notes?: string;
}