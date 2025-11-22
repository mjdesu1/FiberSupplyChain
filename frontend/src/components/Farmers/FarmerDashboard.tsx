import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Calendar,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  FileText,
  Leaf,
  Eye,
  CheckCircle,
  Camera,
  Mail,
  Users as UsersIcon,
  Search,
  Filter,
  Truck
} from 'lucide-react';
import FarmerMonitoringView from './FarmerMonitoringView';
import FarmerHarvestView from './FarmerHarvestView';
import SalesReportForm from './SalesReportForm';
import SalesReportsList from './SalesReportsList';
import FarmerDeliveryTracking from './FarmerDeliveryTracking';

interface FarmerDashboardProps {
  onLogout: () => void;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'seedlings' | 'harvest' | 'harvest-submit' | 'monitoring' | 'sales-report' | 'track-deliveries' | 'profile'>('dashboard');
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [seedlings, setSeedlings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPlantingModal, setShowPlantingModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSeedling, setSelectedSeedling] = useState<any>(null);
  const [plantingData, setPlantingData] = useState({
    planting_date: new Date().toISOString().split('T')[0],
    planting_location: '',
    planting_notes: '',
    planting_photo_1: '',
    planting_photo_2: '',
    planting_photo_3: ''
  });

  // Profile states
  const [isEditMode, setIsEditMode] = useState(false);
  const [farmerData, setFarmerData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Seedlings filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'distributed' | 'planted' | 'damaged'>('all');
  const [filteredSeedlings, setFilteredSeedlings] = useState<any[]>([]);

  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (currentPage === 'seedlings') {
      fetchMySeedlings();
    } else if (currentPage === 'profile') {
      fetchFarmerProfile();
    }
  }, [currentPage]);

  // Load profile photo on mount
  useEffect(() => {
    fetchFarmerProfile();
  }, []);

  // Filter seedlings based on search and status
  useEffect(() => {
    let filtered = seedlings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(seedling =>
        seedling.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (seedling.source_supplier && seedling.source_supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seedling.remarks && seedling.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(seedling => seedling.status === statusFilter);
    }

    setFilteredSeedlings(filtered);
  }, [seedlings, searchTerm, statusFilter]);

  const fetchMySeedlings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Use the new association seedlings endpoint
      const response = await fetch('http://localhost:3001/api/association-seedlings/farmer/received', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📦 Fetched seedlings:', data);
      setSeedlings(data);
    } catch (error) {
      console.error('Error fetching seedlings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerProfile = async () => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Farmer profile loaded:', data);
        setFarmerData(data);
        setEditFormData({
          full_name: data.full_name || '',
          contact_number: data.contact_number || '',
          address: data.address || '',
          sex: data.sex || '',
          age: data.age || '',
          barangay: data.barangay || '',
          municipality: data.municipality || '',
          association_name: data.association_name || ''
        });
        setProfilePhoto(data.profile_photo || null);
      }
    } catch (error) {
      console.error('Error fetching farmer profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveFarmerProfile = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3001/api/farmers/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editFormData,
          profilePhoto: profilePhoto
        })
      });
      
      if (response.ok) {
        alert('✅ Profile updated successfully!');
        setIsEditMode(false);
        await fetchFarmerProfile();
      } else {
        const errorData = await response.json();
        console.error('❌ Update failed:', errorData);
        alert('❌ Failed to update profile: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('❌ Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoNum: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPlantingData({
        ...plantingData,
        [`planting_photo_${photoNum}`]: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMarkAsPlanted = async () => {
    if (!selectedSeedling) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/association-seedlings/farmer/${selectedSeedling.distribution_id}/mark-planted`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plantingData)
      });

      if (response.ok) {
        alert('Seedling marked as planted successfully! MAO has been notified.');
        setShowPlantingModal(false);
        setPlantingData({
          planting_date: new Date().toISOString().split('T')[0],
          planting_location: '',
          planting_notes: '',
          planting_photo_1: '',
          planting_photo_2: '',
          planting_photo_3: ''
        });
        fetchMySeedlings();
      } else {
        alert('Failed to mark as planted');
      }
    } catch (error) {
      console.error('Error marking as planted:', error);
      alert('Failed to mark as planted');
    }
  };

  // Mock stats - replace with real API data
  const stats = {
    totalSeedlings: Array.isArray(seedlings) ? seedlings.reduce((sum, s) => sum + s.quantity_distributed, 0) : 0,
    activePlantings: Array.isArray(seedlings) ? seedlings.filter(s => s.status === 'planted').length : 0,
    farmArea: user?.farmAreaHectares || 0,
    nextHarvest: '2 weeks'
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">🌾 Farmer Portal</h1>
              <p className="text-xs text-blue-300">Abaca Management</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentPage('seedlings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'seedlings' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <Sprout className="w-5 h-5" />
            {sidebarOpen && <span>My Seedlings</span>}
          </button>

          <button
            onClick={() => setCurrentPage('harvest')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'harvest' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <Package className="w-5 h-5" />
            {sidebarOpen && <span>Harvest Records</span>}
          </button>

          <button
            onClick={() => setCurrentPage('monitoring')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'monitoring' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            {sidebarOpen && <span>Farm Monitoring</span>}
          </button>

          <button
            onClick={() => {
              setCurrentPage('sales-report');
              setShowSalesForm(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'sales-report' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>Sales Reports</span>}
          </button>

          <button
            onClick={() => setCurrentPage('track-deliveries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'track-deliveries' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <Truck className="w-5 h-5" />
            {sidebarOpen && <span>Track Deliveries</span>}
          </button>

          <button
            onClick={() => setCurrentPage('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === 'profile' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'hover:bg-slate-700'
            }`}
          >
            <User className="w-5 h-5" />
            {sidebarOpen && <span>My Profile</span>}
          </button>

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentPage === 'dashboard' ? 'Dashboard' :
                 currentPage === 'seedlings' ? 'My Seedlings' :
                 currentPage === 'harvest' ? 'Harvest Records' :
                 currentPage === 'monitoring' ? 'Farm Monitoring' :
                 currentPage === 'sales-report' ? (showSalesForm ? 'Submit Sales Report' : 'Sales Reports') :
                 currentPage === 'track-deliveries' ? 'Track My Deliveries' :
                 'My Profile'}
              </h2>
              <p className="text-gray-600">Welcome back, {user?.fullName || 'Farmer'}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.fullName || 'Farmer'}</p>
                  <p className="text-xs text-gray-500">{user?.associationName || 'Independent Farmer'}</p>
                </div>
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-500 shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.fullName?.charAt(0) || 'F'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {currentPage === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Seedlings</p>
                      <p className="text-3xl font-bold mt-1">{stats.totalSeedlings.toLocaleString()}</p>
                    </div>
                    <Sprout className="w-12 h-12 text-green-200 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Active Plantings</p>
                      <p className="text-3xl font-bold mt-1">{stats.activePlantings}</p>
                    </div>
                    <Leaf className="w-12 h-12 text-blue-200 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Farm Area</p>
                      <p className="text-3xl font-bold mt-1">{stats.farmArea} ha</p>
                    </div>
                    <MapPin className="w-12 h-12 text-purple-200 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Next Harvest</p>
                      <p className="text-2xl font-bold mt-1">{stats.nextHarvest}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-orange-200 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Recent Seedlings */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    Recent Seedling Distributions
                  </h3>
                  {!Array.isArray(seedlings) || seedlings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No seedlings received yet</p>
                  ) : (
                    <div className="space-y-3">
                      {seedlings.slice(0, 3).map((seedling) => (
                        <div key={seedling.distribution_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{seedling.variety}</p>
                            <p className="text-sm text-gray-500">{new Date(seedling.date_distributed).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{seedling.quantity_distributed}</p>
                            <p className="text-xs text-gray-500">seedlings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setCurrentPage('seedlings')}
                    className="w-full mt-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition font-medium"
                  >
                    View All Seedlings
                  </button>
                </div>

                {/* Farm Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Farm Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Association</p>
                      <p className="font-medium text-gray-900">{user?.associationName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Municipality</p>
                      <p className="font-medium text-gray-900">{user?.municipality || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Farm Location</p>
                      <p className="font-medium text-gray-900">{user?.farmLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Farm Area</p>
                      <p className="font-medium text-gray-900">{user?.farmAreaHectares || 0} hectares</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  Announcements & Updates
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="font-medium text-blue-900">New Seedling Distribution</p>
                    <p className="text-sm text-blue-700 mt-1">Musa Textilis seedlings available for distribution next week.</p>
                    <p className="text-xs text-blue-600 mt-2">2 days ago</p>
                  </div>
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                    <p className="font-medium text-green-900">Training Schedule</p>
                    <p className="text-sm text-green-700 mt-1">Abaca farming best practices training on November 15, 2025.</p>
                    <p className="text-xs text-green-600 mt-2">5 days ago</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentPage === 'seedlings' && (
            <>
              {/* Clean Modern Header */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                      <Sprout className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My Seedling Records</h2>
                      <p className="text-gray-600 text-sm">Track your abaca seedlings from MAO Culiram</p>
                    </div>
                  </div>
                </div>

                {/* Clean Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 mb-1">{Array.isArray(seedlings) ? seedlings.reduce((sum, s) => sum + s.quantity_distributed, 0).toLocaleString() : '0'}</p>
                    <p className="text-blue-600 text-sm font-medium">Seedlings Received</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Batches</p>
                    </div>
                    <p className="text-3xl font-bold text-indigo-900 mb-1">{Array.isArray(seedlings) ? seedlings.length : 0}</p>
                    <p className="text-indigo-600 text-sm font-medium">Distribution Records</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Planted</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900 mb-1">{seedlings.filter(s => s.status === 'planted').length}</p>
                    <p className="text-purple-600 text-sm font-medium">Successfully Planted</p>
                  </div>
                </div>
              </div>

              {/* Clean Search and Filter Bar */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search variety, source, or remarks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="md:w-64">
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full pl-12 pr-10 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer text-gray-900"
                      >
                        <option value="all">All Status</option>
                        <option value="distributed">Distributed</option>
                        <option value="planted">Planted</option>
                        <option value="damaged">Damaged</option>
                      </select>
                      <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex items-center">
                    <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
                      <p className="text-white/90 text-xs font-semibold uppercase mb-0.5">Results</p>
                      <p className="text-xl font-bold text-white">{filteredSeedlings.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Loading your seedlings...</p>
                </div>
              ) : filteredSeedlings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-gray-200">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Sprout className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Records Found</h3>
                  <p className="text-gray-600 mb-4">
                    {seedlings.length === 0 
                      ? "You haven't received any seedlings from MAO Culiram yet" 
                      : "No seedlings match your search criteria"}
                  </p>
                  {seedlings.length === 0 && (
                    <p className="text-sm text-gray-500">Contact MAO Culiram for seedling distribution</p>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center px-6 py-4 gap-8">
                      {/* Image Column */}
                      <div className="w-12 flex-shrink-0">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Photo</p>
                      </div>

                      {/* Variety Column */}
                      <div className="w-48">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Variety & Date</p>
                      </div>

                      {/* Quantity Column */}
                      <div className="w-32">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Quantity</p>
                      </div>

                      {/* Source Column */}
                      <div className="w-40">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Source</p>
                      </div>

                      {/* Batch ID Column */}
                      <div className="w-32">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Batch ID</p>
                      </div>

                      {/* Remarks Column */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Remarks</p>
                      </div>

                      {/* Status Column */}
                      <div className="w-24">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Status</p>
                      </div>

                      {/* Actions Column */}
                      <div className="w-20">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Actions</p>
                      </div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-gray-200">
                    {filteredSeedlings.map((seedling, index) => (
                      <div key={seedling.distribution_id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="flex items-center px-6 py-4 gap-8">
                        {/* Image/Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex-shrink-0">
                          {seedling.seedling_photo || seedling.packaging_photo || seedling.quality_photo ? (
                            <img 
                              src={seedling.seedling_photo || seedling.packaging_photo || seedling.quality_photo} 
                              alt="Seedling" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sprout className="w-6 h-6 text-indigo-500" />
                            </div>
                          )}
                        </div>

                        {/* Variety Name */}
                        <div className="w-48">
                          <p className="font-semibold text-gray-900 text-sm">{seedling.variety}</p>
                          <p className="text-xs text-gray-500">{new Date(seedling.date_distributed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>

                        {/* Quantity */}
                        <div className="w-32">
                          <p className="text-sm text-gray-700">{seedling.quantity_distributed} seedlings</p>
                        </div>

                        {/* Source */}
                        <div className="w-40">
                          <p className="text-sm text-gray-700 truncate">{seedling.source_supplier || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Source</p>
                        </div>

                        {/* Batch ID */}
                        <div className="w-32">
                          <p className="text-sm font-mono text-gray-700">#{seedling.distribution_id?.slice(0, 8) || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Batch ID</p>
                        </div>

                        {/* Remarks */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{seedling.remarks || 'NONE'}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="w-24">
                          <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                            seedling.status === 'planted' ? 'bg-green-100 text-green-700' :
                            seedling.status === 'distributed' ? 'bg-blue-100 text-blue-700' :
                            seedling.status === 'damaged' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {seedling.status === 'planted' ? 'Complete' : seedling.status}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSeedling(seedling);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {seedling.status === 'planted' ? (
                            <div className="p-2 text-green-600" title="Already Planted">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSeedling(seedling);
                                setShowPlantingModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Mark as Planted"
                            >
                              <Sprout className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {currentPage === 'harvest' && (
            <FarmerHarvestView />
          )}

          {currentPage === 'monitoring' && (
            <FarmerMonitoringView />
          )}

          {/* Sales Report Page */}
          {currentPage === 'sales-report' && (
            <>
              {showSalesForm ? (
                <SalesReportForm
                  onSubmit={(report) => {
                    console.log('Sales report submitted:', report);
                    alert('Sales report submitted successfully!');
                    setShowSalesForm(false); // Go back to list view after submit
                  }}
                  onCancel={() => setShowSalesForm(false)} // Go back to list view
                />
              ) : (
                <SalesReportsList 
                  onAddNewReport={() => setShowSalesForm(true)}
                />
              )}
            </>
          )}

          {/* Track Deliveries Page */}
          {currentPage === 'track-deliveries' && (
            <FarmerDeliveryTracking />
          )}

          {currentPage === 'profile' && (
            <div className="bg-white rounded-xl shadow-lg">
              {/* Profile Header */}
              <div className="p-6 bg-gradient-to-r from-green-800 via-green-700 to-green-800 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-4">
                  <User className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Profile' : 'My Profile'}</h2>
                    <p className="text-green-100 text-sm">{isEditMode ? 'Update your information' : 'View your details'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-white font-medium border border-white/30"
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Edit Mode
                    </>
                  )}
                </button>
              </div>

              {loadingProfile ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Profile Photo Section */}
                  <div className="bg-gradient-to-br from-green-50 via-gray-50 to-green-50 rounded-2xl p-8 mb-6 relative overflow-hidden border-2 border-gray-200">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        {profilePhoto ? (
                          <img 
                            src={profilePhoto} 
                            alt="Profile" 
                            className="w-28 h-28 rounded-full object-cover border-4 border-green-500 shadow-xl"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-xl text-white">
                            {farmerData?.full_name?.charAt(0) || 'F'}
                          </div>
                        )}
                        {isEditMode && (
                          <label className="absolute bottom-0 right-0 p-2.5 bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition cursor-pointer group-hover:scale-110">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleProfilePhotoUpload}
                              className="hidden"
                              disabled={uploadingPhoto}
                            />
                            {uploadingPhoto ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Camera className="w-4 h-4 text-white" />
                            )}
                          </label>
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-800">{farmerData?.full_name || user?.fullName}</h3>
                        <p className="text-gray-600 font-semibold text-lg mt-1">{farmerData?.association_name || 'Independent Farmer'}</p>
                        <p className="text-green-600 font-medium mt-2">{farmerData?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                      <h4 className="font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Personal Information</span>
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Full Name</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editFormData?.full_name || ''}
                              onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.full_name || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Sex</label>
                          {isEditMode ? (
                            <select
                              value={editFormData?.sex || ''}
                              onChange={(e) => setEditFormData({...editFormData, sex: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                            >
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.sex || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Age</label>
                          {isEditMode ? (
                            <input
                              type="number"
                              value={editFormData?.age || ''}
                              onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.age || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                      <h4 className="font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Contact Information</span>
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Email</label>
                          <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Contact Number</label>
                          {isEditMode ? (
                            <input
                              type="tel"
                              value={editFormData?.contact_number || ''}
                              onChange={(e) => setEditFormData({...editFormData, contact_number: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                              placeholder="09171234567"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.contact_number || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Address</label>
                          {isEditMode ? (
                            <textarea
                              value={editFormData?.address || ''}
                              onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800 resize-none"
                              rows={2}
                              placeholder="Complete address"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.address || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                      <h4 className="font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Location</span>
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Barangay</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editFormData?.barangay || ''}
                              onChange={(e) => setEditFormData({...editFormData, barangay: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.barangay || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Municipality</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editFormData?.municipality || ''}
                              onChange={(e) => setEditFormData({...editFormData, municipality: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.municipality || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Association Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                      <h4 className="font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                          <UsersIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Association</span>
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide">Association Name</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editFormData?.association_name || ''}
                              onChange={(e) => setEditFormData({...editFormData, association_name: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-800"
                            />
                          ) : (
                            <p className="font-semibold text-gray-800 px-4 py-3 bg-gray-50 rounded-xl">{farmerData?.association_name || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end items-center gap-3">
                    {isEditMode && (
                      <>
                        <button
                          onClick={() => {
                            setEditFormData(farmerData);
                            setIsEditMode(false);
                          }}
                          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveFarmerProfile}
                          disabled={savingProfile}
                          className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {savingProfile ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Planting Modal */}
      {showPlantingModal && selectedSeedling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Mark Seedlings as Planted</h2>
              <button
                onClick={() => {
                  setShowPlantingModal(false);
                  setPlantingData({
                    planting_date: new Date().toISOString().split('T')[0],
                    planting_location: '',
                    planting_notes: '',
                    planting_photo_1: '',
                    planting_photo_2: '',
                    planting_photo_3: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Seedling Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">Seedling Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-700">Variety:</span>
                    <span className="ml-2 font-medium text-green-900">{selectedSeedling.variety}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Quantity:</span>
                    <span className="ml-2 font-medium text-green-900">{selectedSeedling.quantity_distributed}</span>
                  </div>
                </div>
              </div>

              {/* Planting Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleMarkAsPlanted(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date *</label>
                    <input
                      type="date"
                      required
                      value={plantingData.planting_date}
                      onChange={(e) => setPlantingData({ ...plantingData, planting_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Location</label>
                    <input
                      type="text"
                      value={plantingData.planting_location}
                      onChange={(e) => setPlantingData({ ...plantingData, planting_location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Farm Section A, Near river"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      value={plantingData.planting_notes}
                      onChange={(e) => setPlantingData({ ...plantingData, planting_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add any notes about the planting..."
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">📸 Planting Photos (Optional)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num}>
                          <label className="block text-sm text-gray-600 mb-2">Photo {num}</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-green-500 transition">
                            {plantingData[`planting_photo_${num}` as keyof typeof plantingData] ? (
                              <div className="relative">
                                <img 
                                  src={plantingData[`planting_photo_${num}` as keyof typeof plantingData] as string} 
                                  alt={`Planting ${num}`} 
                                  className="w-full h-24 object-cover rounded" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setPlantingData({ ...plantingData, [`planting_photo_${num}`]: '' })}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer">
                                <Sprout className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-600">Upload</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, num)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Max 5MB per photo</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlantingModal(false);
                      setPlantingData({
                        planting_date: new Date().toISOString().split('T')[0],
                        planting_location: '',
                        planting_notes: '',
                        planting_photo_1: '',
                        planting_photo_2: '',
                        planting_photo_3: ''
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Mark as Planted
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSeedling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Seedling Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Distribution Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-green-600" />
                  Distribution Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Variety</p>
                    <p className="font-medium text-gray-900">{selectedSeedling.variety}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium text-gray-900">{selectedSeedling.quantity_distributed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date Distributed</p>
                    <p className="font-medium text-gray-900">{new Date(selectedSeedling.date_distributed).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Source/Supplier</p>
                    <p className="font-medium text-gray-900">{selectedSeedling.source_supplier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedSeedling.status === 'planted' ? 'bg-green-100 text-green-700' :
                      selectedSeedling.status === 'distributed' ? 'bg-blue-100 text-blue-700' :
                      selectedSeedling.status === 'damaged' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedSeedling.status}
                    </span>
                  </div>
                  {selectedSeedling.organization && (
                    <div>
                      <p className="text-sm text-gray-600">Distributed By</p>
                      <p className="font-medium text-gray-900">{selectedSeedling.organization.full_name}</p>
                    </div>
                  )}
                  {selectedSeedling.remarks && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Remarks</p>
                      <p className="font-medium text-gray-900">{selectedSeedling.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Distribution Photos */}
              {(selectedSeedling.seedling_photo || selectedSeedling.packaging_photo || selectedSeedling.quality_photo) && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">📸 Distribution Photos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedSeedling.seedling_photo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Seedling Photo</p>
                        <img 
                          src={selectedSeedling.seedling_photo} 
                          alt="Seedling" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.packaging_photo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Packaging Photo</p>
                        <img 
                          src={selectedSeedling.packaging_photo} 
                          alt="Packaging" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.quality_photo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Quality Photo</p>
                        <img 
                          src={selectedSeedling.quality_photo} 
                          alt="Quality" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Planting Information (if planted) */}
              {selectedSeedling.status === 'planted' && selectedSeedling.planting_date && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Planting Information
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700">Planting Date</p>
                        <p className="font-medium text-green-900">{new Date(selectedSeedling.planting_date).toLocaleDateString()}</p>
                      </div>
                      {selectedSeedling.planting_location && (
                        <div>
                          <p className="text-sm text-green-700">Location</p>
                          <p className="font-medium text-green-900">{selectedSeedling.planting_location}</p>
                        </div>
                      )}
                      {selectedSeedling.planted_at && (
                        <div>
                          <p className="text-sm text-green-700">Marked as Planted</p>
                          <p className="font-medium text-green-900">{new Date(selectedSeedling.planted_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedSeedling.planting_notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-green-700">Your Notes</p>
                          <p className="font-medium text-green-900">{selectedSeedling.planting_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Planting Photos (if planted) */}
              {(selectedSeedling.planting_photo_1 || selectedSeedling.planting_photo_2 || selectedSeedling.planting_photo_3) && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">🌱 Your Planting Photos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedSeedling.planting_photo_1 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Photo 1</p>
                        <img 
                          src={selectedSeedling.planting_photo_1} 
                          alt="Planting 1" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.planting_photo_2 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Photo 2</p>
                        <img 
                          src={selectedSeedling.planting_photo_2} 
                          alt="Planting 2" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                        />
                      </div>
                    )}
                    {selectedSeedling.planting_photo_3 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Photo 3</p>
                        <img 
                          src={selectedSeedling.planting_photo_3} 
                          alt="Planting 3" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
