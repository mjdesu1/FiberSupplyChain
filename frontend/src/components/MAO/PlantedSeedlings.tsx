/**
 * Planted Seedlings Component
 * Shows detailed planted records from farmers in table format
 */
import React, { useEffect, useState } from 'react';
import { Sprout, Calendar, MapPin, User, Search, Filter, Camera, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlantedSeedling {
  distribution_id: string;
  variety: string;
  quantity_distributed: number;
  planting_date: string;
  planting_location: string;
  planting_notes: string;
  planting_photo_1: string | null;
  planting_photo_2: string | null;
  planting_photo_3: string | null;
  planted_at: string;
  farmer_name: string;
  farmer_email: string;
  farmer_municipality: string;
  farmer_barangay: string;
  association_name: string;
  date_distributed: string;
}

const PlantedSeedlings: React.FC = () => {
  const [plantedSeedlings, setPlantedSeedlings] = useState<PlantedSeedling[]>([]);
  const [filteredSeedlings, setFilteredSeedlings] = useState<PlantedSeedling[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [varietyFilter, setVarietyFilter] = useState('all');
  const [municipalityFilter, setMunicipalityFilter] = useState('all');
  const [selectedSeedling, setSelectedSeedling] = useState<PlantedSeedling | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchPlantedSeedlings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/association-seedlings/cusafa/all-distributions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const plantedOnly = result.farmer_distributions?.filter((d: any) => d.status === 'planted') || [];
      
      const transformedData = plantedOnly.map((d: any) => ({
        distribution_id: d.distribution_id,
        variety: d.variety,
        quantity_distributed: d.quantity_distributed,
        planting_date: d.planting_date,
        planting_location: d.planting_location,
        planting_notes: d.planting_notes,
        planting_photo_1: d.planting_photo_1,
        planting_photo_2: d.planting_photo_2,
        planting_photo_3: d.planting_photo_3,
        planted_at: d.planted_at,
        farmer_name: d.farmers?.full_name || 'Unknown',
        farmer_email: d.farmers?.email || '',
        farmer_municipality: d.farmers?.municipality || '',
        farmer_barangay: d.farmers?.barangay || '',
        association_name: d.association_officers?.association_name || '',
        date_distributed: d.date_distributed
      }));
      
      setPlantedSeedlings(transformedData);
      setFilteredSeedlings(transformedData);
    } catch (err) {
      console.error('Error fetching planted seedlings:', err);
      setError('Failed to load planted seedlings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantedSeedlings();
  }, []);

  // Filter seedlings
  useEffect(() => {
    let filtered = plantedSeedlings;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.planting_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.association_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (varietyFilter !== 'all') {
      filtered = filtered.filter(s => s.variety === varietyFilter);
    }

    if (municipalityFilter !== 'all') {
      filtered = filtered.filter(s => s.farmer_municipality === municipalityFilter);
    }

    setFilteredSeedlings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, varietyFilter, municipalityFilter, plantedSeedlings]);

  const varieties = Array.from(new Set(plantedSeedlings.map(s => s.variety)));
  const municipalities = Array.from(new Set(plantedSeedlings.map(s => s.farmer_municipality)));

  const totalPlanted = filteredSeedlings.reduce((sum, s) => sum + s.quantity_distributed, 0);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSeedlings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSeedlings.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">Loading planted seedlings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Sprout className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-red-600 font-semibold mb-2">{error}</p>
        <button
          onClick={fetchPlantedSeedlings}
          className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planted Seedlings</h1>
        <p className="text-gray-600">Detailed records of all planted seedlings by farmers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-2">Total Planted</p>
              <p className="text-4xl font-bold">{totalPlanted.toLocaleString()}</p>
              <p className="text-emerald-100 text-xs mt-1">seedlings</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <Sprout className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-2">Total Records</p>
              <p className="text-4xl font-bold">{filteredSeedlings.length}</p>
              <p className="text-blue-100 text-xs mt-1">distributions</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <Calendar className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-2">Total Farmers</p>
              <p className="text-4xl font-bold">{new Set(filteredSeedlings.map(s => s.farmer_name)).size}</p>
              <p className="text-purple-100 text-xs mt-1">unique farmers</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <User className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search farmer, variety, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Variety Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={varietyFilter}
              onChange={(e) => setVarietyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Varieties</option>
              {varieties.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Municipality Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Municipalities</option>
              {municipalities.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSeedlings.length)} of {filteredSeedlings.length} records
        </div>
      </div>

      {/* Table */}
      {filteredSeedlings.length === 0 ? (
        <div className="bg-white rounded-b-2xl shadow-lg p-12 text-center">
          <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No planted seedlings found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variety</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Planting Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Association</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Photos</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((seedling) => (
                  <tr key={seedling.distribution_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{seedling.farmer_name}</p>
                        <p className="text-sm text-gray-600">{seedling.farmer_barangay}, {seedling.farmer_municipality}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        {seedling.variety}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{seedling.quantity_distributed}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(seedling.planting_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {seedling.planting_location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{seedling.association_name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(seedling.planting_photo_1 || seedling.planting_photo_2 || seedling.planting_photo_3) ? (
                        <div className="flex items-center justify-center gap-1">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-emerald-600 font-medium">
                            {[seedling.planting_photo_1, seedling.planting_photo_2, seedling.planting_photo_3].filter(Boolean).length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No photos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedSeedling(seedling)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-b-2xl shadow-lg p-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* View Details Modal */}
      {selectedSeedling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSeedling(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Planting Details</h2>
                <p className="text-emerald-100 text-sm mt-1">{selectedSeedling.variety} - {selectedSeedling.quantity_distributed} seedlings</p>
              </div>
              <button
                onClick={() => setSelectedSeedling(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Farmer Name */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Farmer</p>
                    <p className="text-lg font-bold text-gray-900">{selectedSeedling.farmer_name}</p>
                    <p className="text-sm text-gray-600">{selectedSeedling.farmer_barangay}, {selectedSeedling.farmer_municipality}</p>
                  </div>
                </div>
              </div>

              {/* Seedling Information (matching farmer form) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seedling Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Variety</p>
                      <p className="font-semibold text-gray-900">{selectedSeedling.variety}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="font-semibold text-gray-900">{selectedSeedling.quantity_distributed}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Planting Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedSeedling.planting_date).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Planting Location</p>
                    <p className="font-semibold text-gray-900">{selectedSeedling.planting_location || 'Not specified'}</p>
                  </div>

                  {selectedSeedling.planting_notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="font-semibold text-gray-900">{selectedSeedling.planting_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              {(selectedSeedling.planting_photo_1 || selectedSeedling.planting_photo_2 || selectedSeedling.planting_photo_3) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-gray-600" />
                    Planting Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedSeedling.planting_photo_1 && (
                      <button
                        onClick={() => setSelectedPhoto(selectedSeedling.planting_photo_1)}
                        className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors"
                      >
                        <img
                          src={selectedSeedling.planting_photo_1}
                          alt="Planting Photo 1"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {selectedSeedling.planting_photo_2 && (
                      <button
                        onClick={() => setSelectedPhoto(selectedSeedling.planting_photo_2)}
                        className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors"
                      >
                        <img
                          src={selectedSeedling.planting_photo_2}
                          alt="Planting Photo 2"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {selectedSeedling.planting_photo_3 && (
                      <button
                        onClick={() => setSelectedPhoto(selectedSeedling.planting_photo_3)}
                        className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors"
                      >
                        <img
                          src={selectedSeedling.planting_photo_3}
                          alt="Planting Photo 3"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-6xl max-h-[95vh] relative">
            <img
              src={selectedPhoto}
              alt="Planting Photo"
              className="max-w-full max-h-[95vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantedSeedlings;
