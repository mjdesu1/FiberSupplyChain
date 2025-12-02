import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { 
  Package, 
  Search, 
  TrendingUp, 
  Archive, 
  Truck, 
  X, 
  Building,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Buyer {
  buyer_id: string;
  business_name: string;
  owner_name: string;
  business_address: string | null;
  contact_number: string | null;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: string;
}

interface InventoryItem {
  harvest_id: string;
  farmer_id: string;
  farmer_name: string;
  abaca_variety: string;
  dry_fiber_output_kg: number;
  harvest_date: string;
  fiber_grade: string;
  status: string;
  municipality: string;
  barangay: string;
  remarks: string;
  created_at: string;
  farmers?: {
    full_name: string;
    municipality: string;
    barangay: string;
  };
}

const CUSAFAInventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [varietyFilter, setVarietyFilter] = useState('all');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState<InventoryItem | null>(null);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [formData, setFormData] = useState({
    buyer_id: '',
    delivery_date: '',
    delivery_method: 'CUSAFA Delivery',
    delivery_location: '',
    farmer_contact: '',
    notes: ''
  });

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('${API_BASE_URL}/api/cusafa-inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchBuyers = async () => {
    setLoadingBuyers(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('🔍 Fetching buyers from API...');
      
      const response = await fetch('${API_BASE_URL}/api/buyers/all', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('❌ Failed to fetch buyers:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Buyers loaded:', data.buyers?.length || 0, 'buyers');
      setBuyers(data.buyers || []);
    } catch (error) {
      console.error('❌ Error fetching buyers:', error);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('${API_BASE_URL}/api/fiber-deliveries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          fiber_inventory_id: selectedHarvest?.harvest_id
        })
      });

      if (response.ok) {
        alert('✅ Delivery created successfully! Fiber moved from inventory to deliveries.');
        setShowDeliveryModal(false);
        setSelectedHarvest(null);
        fetchInventory(); // Refresh inventory
        // Reset form
        setFormData({
          buyer_id: '',
          delivery_date: '',
          delivery_method: 'CUSAFA Delivery',
          delivery_location: '',
          farmer_contact: '',
          notes: ''
        });
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('Error creating delivery');
    }
  };

  const filteredInventory = inventory.filter(item => {
    const farmerName = item.farmers?.full_name || item.farmer_name || '';
    const matchesSearch = farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.abaca_variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVariety = varietyFilter === 'all' || item.abaca_variety === varietyFilter;
    return matchesSearch && matchesVariety;
  });

  const stats = {
    total: inventory.reduce((sum, item) => sum + (parseFloat(item.dry_fiber_output_kg?.toString() || '0')), 0),
    inStock: inventory.reduce((sum, item) => sum + (parseFloat(item.dry_fiber_output_kg?.toString() || '0')), 0),
    items: inventory.length
  };

  const varieties = Array.from(new Set(inventory.map(i => i.abaca_variety)));

  if (loading) {
    return <div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fiber Inventory</h1>
        <p className="text-gray-600">Abaca fiber from verified harvests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-2">Total Stock</p>
              <p className="text-4xl font-bold">{stats.total.toFixed(2)}</p>
              <p className="text-emerald-100 text-xs mt-1">kg</p>
            </div>
            <Package className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-2">In Stock</p>
              <p className="text-4xl font-bold">{stats.inStock.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-1">kg</p>
            </div>
            <Archive className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-2">Total Items</p>
              <p className="text-4xl font-bold">{stats.items}</p>
              <p className="text-purple-100 text-xs mt-1">records</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search farmer or variety..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="sold">Sold</option>
            <option value="processed">Processed</option>
          </select>
          <select
            value={varietyFilter}
            onChange={(e) => setVarietyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Varieties</option>
            {varieties.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Farmer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Variety</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity (kg)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Harvest Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr key={item.harvest_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.farmers?.full_name || item.farmer_name}</p>
                    <p className="text-sm text-gray-600">{item.barangay}, {item.municipality}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {item.abaca_variety}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{parseFloat(item.dry_fiber_output_kg?.toString() || '0').toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {item.fiber_grade || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(item.harvest_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.municipality}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={async () => {
                      setSelectedHarvest(item);
                      setShowDeliveryModal(true);
                      fetchBuyers(); // Fetch buyers when modal opens
                      
                      // Auto-fetch farmer contact from database
                      try {
                        const token = localStorage.getItem('accessToken');
                        const response = await fetch(`${API_BASE_URL}/api/users/farmer/${item.farmer_id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (response.ok) {
                          const data = await response.json();
                          setFormData(prev => ({
                            ...prev,
                            farmer_contact: data.contact_number || data.phone_number || ''
                          }));
                        }
                      } catch (error) {
                        console.error('Error fetching farmer contact:', error);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <Truck size={16} />
                    Create Delivery
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inventory items found</p>
          </div>
        )}
      </div>

      {/* Create Delivery Modal - Enhanced Design */}
      {showDeliveryModal && selectedHarvest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 flex justify-between items-center sticky top-0 z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Truck className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Fiber Delivery</h2>
                  <p className="text-emerald-50 text-sm">Schedule delivery from inventory</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDeliveryModal(false);
                  setSelectedHarvest(null);
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Harvest Details Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-emerald-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Harvest Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Farmer:</span>
                    <span className="font-semibold text-gray-900">{selectedHarvest.farmers?.full_name || selectedHarvest.farmer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Variety:</span>
                    <span className="font-semibold text-emerald-600">{selectedHarvest.abaca_variety}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-900">{selectedHarvest.dry_fiber_output_kg} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-semibold text-blue-600">{selectedHarvest.fiber_grade}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">{selectedHarvest.barangay}, {selectedHarvest.municipality}</span>
                  </div>
                </div>
              </div>

              {/* Buyer Selection Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="text-emerald-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Select Buyer</h3>
                  </div>
                  <button
                    type="button"
                    onClick={fetchBuyers}
                    disabled={loadingBuyers}
                    className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {loadingBuyers ? '⏳' : '🔄'} Reload
                  </button>
                </div>
                <select
                  name="buyer_id"
                  value={formData.buyer_id}
                  onChange={handleInputChange}
                  required
                  disabled={loadingBuyers}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-white disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingBuyers ? '⏳ Loading buyers...' : buyers.length === 0 ? '❌ No buyers available' : 'Choose buyer...'}
                  </option>
                  {buyers.map(buyer => (
                    <option key={buyer.buyer_id} value={buyer.buyer_id}>
                      🏢 {buyer.business_name} ({buyer.owner_name}) {buyer.contact_number ? `📞 ${buyer.contact_number}` : ''}
                    </option>
                  ))}
                </select>
                {!loadingBuyers && buyers.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <XCircle size={12} />
                    No buyers found. Click "Reload" or check console.
                  </p>
                )}
                {!loadingBuyers && buyers.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} />
                    {buyers.length} buyer(s) loaded successfully
                  </p>
                )}
              </div>

              {/* Delivery Information Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-blue-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Delivery Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Truck size={16} className="text-gray-500" />
                      Delivery Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="delivery_method"
                      value={formData.delivery_method}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    >
                      <option value="CUSAFA Delivery">🚚 CUSAFA Delivery</option>
                      <option value="Buyer Pickup">🏢 Buyer Pickup</option>
                      <option value="Third-party">🚛 Third-party Courier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      Farmer Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="farmer_contact"
                      value={formData.farmer_contact}
                      onChange={handleInputChange}
                      placeholder="Auto-filled from farmer profile"
                      required
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="delivery_location"
                    value={formData.delivery_location}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter delivery address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-purple-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any special instructions or notes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setSelectedHarvest(null);
                  }}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center gap-2 shadow-sm"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle size={20} />
                  Create Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CUSAFAInventory;
