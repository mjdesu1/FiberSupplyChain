import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import HarvestSubmissionPage from '../../pages/HarvestSubmissionPage';

interface Harvest {
  harvest_id: string;
  harvest_date: string;
  abaca_variety: string;
  area_hectares: number;
  dry_fiber_output_kg: number;
  fiber_grade: string;
  status: string;
  municipality: string;
  barangay: string;
  created_at: string;
}

interface Statistics {
  total_harvests: number;
  pending: number;
  verified: number;
  rejected: number;
  in_inventory: number;
  total_fiber_kg: number;
  total_area_hectares: number;
  avg_yield_per_hectare: number;
}

export default function FarmerHarvestView() {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!showSubmitForm) {
      fetchHarvests();
      fetchStatistics();
    }
  }, [filter, showSubmitForm]);

  // Listen for harvest submission event
  useEffect(() => {
    const handleHarvestSubmitted = () => {
      setShowSubmitForm(false);
      fetchHarvests();
      fetchStatistics();
    };

    window.addEventListener('harvestSubmitted', handleHarvestSubmitted);
    return () => window.removeEventListener('harvestSubmitted', handleHarvestSubmitted);
  }, []);

  const fetchHarvests = async () => {
    try {
      const token = localStorage.getItem('token');
      const statusParam = filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : '';
      
      const response = await fetch(`http://localhost:3001/api/harvests/farmer/harvests${statusParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHarvests(data.harvests);
      }
    } catch (error) {
      console.error('Error fetching harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/harvests/farmer/harvests/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAddToInventory = async (harvest: Harvest) => {
    if (!confirm(`Add this harvest to CUSAFA Fiber Inventory?\n\nVariety: ${harvest.abaca_variety}\nQuantity: ${harvest.dry_fiber_output_kg} kg\nGrade: ${harvest.fiber_grade}`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/cusafa-inventory/add/${harvest.harvest_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: 'CUSAFA Warehouse',
          notes: `Added by farmer - ${harvest.abaca_variety}`
        })
      });

      if (response.ok) {
        alert('✅ Harvest added to CUSAFA Fiber Inventory successfully!');
        fetchHarvests(); // Refresh list
        fetchStatistics(); // Refresh stats
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Failed to add to inventory'}`);
      }
    } catch (error) {
      console.error('Error adding to inventory:', error);
      alert('❌ Failed to add to inventory');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Pending Verification': 'bg-yellow-100 text-yellow-800',
      'Verified': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Inventory': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  // If showing submit form, render that instead
  if (showSubmitForm) {
    return (
      <div>
        <button
          onClick={() => setShowSubmitForm(false)}
          className="mb-4 text-green-600 hover:text-green-800 font-semibold flex items-center gap-2"
        >
          ← Back to Harvest List
        </button>
        <HarvestSubmissionPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">My Harvests</h1>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-semibold"
          >
            + Submit New Harvest
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Harvests</div>
              <div className="text-2xl font-bold text-green-800">{statistics.total_harvests}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Fiber (kg)</div>
              <div className="text-2xl font-bold text-green-800">{statistics.total_fiber_kg?.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Verified</div>
              <div className="text-2xl font-bold text-green-600">{statistics.verified}</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {['all', 'Pending Verification', 'Verified', 'Rejected', 'In Inventory'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  filter === status
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Harvests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading harvests...</div>
          ) : harvests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No harvests found.</p>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Submit Your First Harvest
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area (ha)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiber (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {harvests.map((harvest) => (
                    <tr key={harvest.harvest_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(harvest.harvest_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {harvest.municipality}, {harvest.barangay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.abaca_variety}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.area_hectares}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.dry_fiber_output_kg?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.fiber_grade || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(harvest.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Viewing harvest ${harvest.harvest_id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            View
                          </button>
                          {harvest.status === 'Pending Verification' && (
                            <button
                              onClick={() => alert(`Edit feature coming soon for harvest ${harvest.harvest_id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          )}
                          {harvest.status === 'Verified' && (
                            <button
                              onClick={() => handleAddToInventory(harvest)}
                              className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                              title="Add to CUSAFA Inventory"
                            >
                              <Package className="w-4 h-4" />
                              Add to Inventory
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
