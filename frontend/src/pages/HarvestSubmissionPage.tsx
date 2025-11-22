import { useState, useEffect } from 'react';
import { getAuthToken, getAuthHeader } from '../utils/authToken';

interface FarmerProfile {
  full_name: string;
  contact_number: string;
  municipality: string;
  barangay: string;
  association_name: string;
}

interface HarvestFormData {
  // Farm Location (optional)
  farm_coordinates: string;
  landmark: string;
  farm_name: string;
  farm_code: string;
  area_hectares: string;
  plot_lot_id: string;

  // Planting Info
  abaca_variety: string;
  planting_date: string;
  planting_material_source: string;
  planting_density_hills_per_ha: string;
  planting_spacing: string;

  // Harvest Details
  harvest_date: string;
  harvest_shift: string;
  harvest_crew_name: string;
  harvest_method: string;
  stalks_harvested: string;
  wet_weight_kg: string;
  dry_fiber_output_kg: string;
  yield_per_hectare_kg: string;

  // Quality
  fiber_grade: string;
  fiber_color: string;
  moisture_status: string;
  bales_produced: string;
  weight_per_bale_kg: string;

  // Pest/Disease
  pests_observed: boolean;
  pests_description: string;
  diseases_observed: boolean;
  diseases_description: string;
  remarks: string;
}

export default function HarvestSubmissionPage() {
  const [loading, setLoading] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [formData, setFormData] = useState<HarvestFormData>({
    farm_coordinates: '',
    landmark: '',
    farm_name: '',
    farm_code: '',
    area_hectares: '',
    plot_lot_id: '',
    abaca_variety: '',
    planting_date: '',
    planting_material_source: 'Tissue Culture',
    planting_density_hills_per_ha: '',
    planting_spacing: '',
    harvest_date: new Date().toISOString().split('T')[0],
    harvest_shift: 'Morning',
    harvest_crew_name: '',
    harvest_method: 'Manual Tuxying + Hand Stripping',
    stalks_harvested: '',
    wet_weight_kg: '',
    dry_fiber_output_kg: '',
    yield_per_hectare_kg: '',
    fiber_grade: 'Grade A',
    fiber_color: 'White',
    moisture_status: 'Sun-dried',
    bales_produced: '',
    weight_per_bale_kg: '',
    pests_observed: false,
    pests_description: '',
    diseases_observed: false,
    diseases_description: '',
    remarks: ''
  });

  useEffect(() => {
    fetchFarmerProfile();
  }, []);

  const fetchFarmerProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token found');
        return;
      }

      const response = await fetch('http://localhost:3001/api/farmers/profile', {
        headers: getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setFarmerProfile(data.farmer);
      } else {
        console.warn('Failed to fetch farmer profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching farmer profile (backend may be offline):', error);
      // Continue anyway - user can still fill the form
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('Token exists:', !!token);
      
      // Convert string numbers to actual numbers
      const payload = {
        ...formData,
        area_hectares: parseFloat(formData.area_hectares),
        planting_density_hills_per_ha: formData.planting_density_hills_per_ha ? parseInt(formData.planting_density_hills_per_ha) : null,
        stalks_harvested: formData.stalks_harvested ? parseInt(formData.stalks_harvested) : null,
        wet_weight_kg: formData.wet_weight_kg ? parseFloat(formData.wet_weight_kg) : null,
        dry_fiber_output_kg: formData.dry_fiber_output_kg ? parseFloat(formData.dry_fiber_output_kg) : null,
        yield_per_hectare_kg: formData.yield_per_hectare_kg ? parseFloat(formData.yield_per_hectare_kg) : null,
        bales_produced: formData.bales_produced ? parseInt(formData.bales_produced) : null,
        weight_per_bale_kg: formData.weight_per_bale_kg ? parseFloat(formData.weight_per_bale_kg) : null
      };

      console.log('Submitting payload:', payload);
      
      const response = await fetch('http://localhost:3001/api/harvests/farmer/harvests', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        alert('Harvest submitted successfully! Redirecting to harvest list...');
        // Trigger a custom event to notify parent component
        window.dispatchEvent(new CustomEvent('harvestSubmitted'));
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        console.error('Backend error:', error);
        
        if (response.status === 401) {
          alert('Authentication failed. Your session may have expired. Please logout and login again.');
        } else {
          alert(`Error: ${error.error || error.message || 'Failed to submit harvest'}`);
        }
      }
    } catch (error) {
      console.error('Error submitting harvest:', error);
      alert('Failed to submit harvest. Please make sure the backend server is running (npm run dev in backend folder).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Submit Harvest Record</h1>

          {/* Auto-filled Farmer Info */}
          {farmerProfile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-green-900 mb-2">Farmer Information (Auto-filled)</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{farmerProfile.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Contact:</span>
                  <span className="ml-2 font-medium">{farmerProfile.contact_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Municipality:</span>
                  <span className="ml-2 font-medium">{farmerProfile.municipality}</span>
                </div>
                <div>
                  <span className="text-gray-600">Barangay:</span>
                  <span className="ml-2 font-medium">{farmerProfile.barangay}</span>
                </div>
                {farmerProfile.association_name && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Association:</span>
                    <span className="ml-2 font-medium">{farmerProfile.association_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farm Location */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Farm Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (Hectares) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="area_hectares"
                    step="0.01"
                    required
                    value={formData.area_hectares}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Coordinates (GPS or Description)
                  </label>
                  <input
                    type="text"
                    name="farm_coordinates"
                    placeholder="e.g., 7.6298, 125.4737"
                    value={formData.farm_coordinates}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    name="farm_name"
                    value={formData.farm_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </section>

            {/* Planting Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Planting Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abaca Variety <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="abaca_variety"
                    required
                    placeholder="e.g., Maguindanao, Abuab, Tangongon, Laylay, etc."
                    value={formData.abaca_variety}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Common varieties: Maguindanao, Abuab, Tangongon, Laylay, Inosa, Linawaan</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="planting_date"
                    required
                    value={formData.planting_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planting Material Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="planting_material_source"
                    required
                    value={formData.planting_material_source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Tissue Culture">Tissue Culture</option>
                    <option value="Sucker">Sucker</option>
                    <option value="Corm">Corm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planting Spacing</label>
                  <input
                    type="text"
                    name="planting_spacing"
                    placeholder="e.g., 2m x 2m"
                    value={formData.planting_spacing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </section>

            {/* Harvest Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Harvest Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="harvest_date"
                    required
                    value={formData.harvest_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="harvest_method"
                    required
                    value={formData.harvest_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Manual Tuxying + Hand Stripping">Manual Tuxying + Hand Stripping</option>
                    <option value="Mechanical Stripping">Mechanical Stripping</option>
                    <option value="MSSM">MSSM</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stalks Harvested</label>
                  <input
                    type="number"
                    name="stalks_harvested"
                    value={formData.stalks_harvested}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dry Fiber Output (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="dry_fiber_output_kg"
                    step="0.01"
                    required
                    value={formData.dry_fiber_output_kg}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wet Weight (kg)</label>
                  <input
                    type="number"
                    name="wet_weight_kg"
                    step="0.01"
                    value={formData.wet_weight_kg}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yield per Hectare (kg/ha)</label>
                  <input
                    type="number"
                    name="yield_per_hectare_kg"
                    step="0.01"
                    value={formData.yield_per_hectare_kg}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </section>

            {/* Quality/Grading */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quality & Grading</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiber Grade</label>
                  <select
                    name="fiber_grade"
                    value={formData.fiber_grade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moisture Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="moisture_status"
                    required
                    value={formData.moisture_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Sun-dried">Sun-dried</option>
                    <option value="Semi-dried">Semi-dried</option>
                    <option value="Wet">Wet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiber Color</label>
                  <input
                    type="text"
                    name="fiber_color"
                    value={formData.fiber_color}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bales Produced</label>
                  <input
                    type="number"
                    name="bales_produced"
                    value={formData.bales_produced}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </section>

            {/* Pest/Disease */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pest & Disease Observations</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pests_observed"
                    checked={formData.pests_observed}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Pests Observed</label>
                </div>
                {formData.pests_observed && (
                  <textarea
                    name="pests_description"
                    placeholder="Describe the pests observed..."
                    value={formData.pests_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="diseases_observed"
                    checked={formData.diseases_observed}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Diseases Observed</label>
                </div>
                {formData.diseases_observed && (
                  <textarea
                    name="diseases_description"
                    placeholder="Describe the diseases observed..."
                    value={formData.diseases_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                )}
              </div>
            </section>

            {/* Remarks */}
            <section>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Any additional notes or observations..."
              />
            </section>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Harvest'}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
