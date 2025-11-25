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
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [user, setUser] = useState<any>(null);

  // Get user info
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (!showSubmitForm) {
      fetchHarvests();
      fetchStatistics();
    }
    // Reset to page 1 when filter changes
    setCurrentPageNum(1);
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

  // Pagination calculations
  const totalPages = Math.ceil(harvests.length / itemsPerPage);
  const paginatedHarvests = harvests.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-50 to-teal-50 -mx-6 px-6 py-4 mb-6 shadow-sm border-b border-emerald-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Harvests</h2>
            <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.full_name || 'Farmer'}!</p>
          </div>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2"
          >
            + Submit New Harvest
          </button>
        </div>
      </div>

      {/* Modern Stats Cards */}
      {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="group relative bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-emerald-100 mb-1">Total Harvests</div>
              <div className="text-3xl font-bold text-white">{statistics.total_harvests}</div>
            </div>
            <div className="group relative bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-blue-100 mb-1">Total Fiber (kg)</div>
              <div className="text-3xl font-bold text-white">{statistics.total_fiber_kg?.toFixed(2)}</div>
            </div>
            <div className="group relative bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-amber-100 mb-1">Pending</div>
              <div className="text-3xl font-bold text-white">{statistics.pending}</div>
            </div>
            <div className="group relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-sm text-green-100 mb-1">Verified</div>
              <div className="text-3xl font-bold text-white">{statistics.verified}</div>
            </div>
          </div>
      )}

      {/* Simplified Filter Dropdown */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
              <option value="In Inventory">In Inventory</option>
            </select>
          </div>
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
                {paginatedHarvests.map((harvest) => (
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

        {/* Pagination Controls */}
        {harvests.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Show entries selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show entries:</span>
                <div className="flex gap-2">
                  {[10, 20, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPageNum(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        itemsPerPage === size
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pagination info and controls */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {((currentPageNum - 1) * itemsPerPage) + 1} to {Math.min(currentPageNum * itemsPerPage, harvests.length)} of {harvests.length} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                    disabled={currentPageNum === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPageNum === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
