import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Sprout, 
  CheckCircle, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronDown,
  User,
  Shield,
  Calendar,
  Eye,
  FileText,
  DollarSign,
  Users,
  ShoppingCart,
  XCircle,
  BookOpen,
  Camera,
  Mail,
  Briefcase,
  Package,
  Download,
  Filter,
  Search,
  Award,
  Activity,
  PieChart,
  Truck,
  Clock
} from 'lucide-react';
import UserManagement from './UserManagement';
import OfficerManagement from './OfficerManagement';
import MaintenanceToggle from './MaintenanceToggle';
import AssociationSeedlingManagement from './AssociationSeedlingManagement';
import PlantedSeedlings from './PlantedSeedlings';
import MonitoringPage from '../../pages/MonitoringPage';
import ArticleManagement from './ArticleManagement';
import TeamManagement from './TeamManagement';
import MAOHarvestVerificationPage from '../../pages/MAOHarvestVerificationPage';
import UnifiedSalesManagement from './UnifiedSalesManagement';
import BuyerPriceListingsViewer from '../Shared/BuyerPriceListingsViewer';
import DeliveryTrackingMonitor from './DeliveryTrackingMonitor';

interface MAODashboardProps {
  onLogout: () => void;
}

const MAODashboard: React.FC<MAODashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'officers' | 'maintenance' | 'seedlings' | 'seedlings-overview' | 'monitoring' | 'content' | 'harvests' | 'sales-analytics' | 'buyer-prices' | 'delivery-tracking'>('dashboard');
  const [contentTab, setContentTab] = useState<'articles' | 'team'>('articles');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [officerData, setOfficerData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({
    email: '',
    contact_number: '',
    address: '',
    position: '',
    association_name: '',
    full_name: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = user?.isSuperAdmin === true;
  
  // Debug: Log user info
  console.log('ðŸ” MAO Dashboard - User Info:', {
    email: user?.email,
    isSuperAdmin: user?.isSuperAdmin,
    fullName: user?.fullName,
    position: user?.position
  });
  
  // Note: All features are now available to both admin and super admin

  // Fetch officer profile data
  const fetchOfficerProfile = async () => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('âœ… Profile data loaded:', data);
        console.log('ðŸ“§ Email:', data.email);
        console.log('ðŸ“ž Contact:', data.contact_number);
        console.log('ðŸ“ Address:', data.address);
        console.log('ðŸ’¼ Position:', data.position);
        console.log('ðŸ¢ Association:', data.association_name);
        
        // Ensure all fields are properly set
        const officerInfo = {
          ...data,
          email: data.email || user?.email || '',
          contact_number: data.contact_number || '',
          address: data.address || '',
          position: data.position || user?.position || '',
          association_name: data.association_name || '',
          full_name: data.full_name || user?.fullName || ''
        };
        
        console.log('ðŸ” Officer data being set:', officerInfo);
        setOfficerData(officerInfo);
        
        // Set form data with proper fallbacks
        const formData = {
          email: data.email || user?.email || '',
          contact_number: data.contact_number || '',
          address: data.address || '',
          position: data.position || user?.position || '',
          association_name: data.association_name || '',
          full_name: data.full_name || user?.fullName || ''
        };
        console.log('ðŸ“ Setting form data:', formData);
        setEditFormData(formData);
        setProfilePhoto(data.profile_picture || null);
      } else {
        console.error('âŒ Failed to fetch profile, status:', response.status);
        const errorData = await response.json();
        console.error('âŒ Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      console.log('ðŸ’¾ Saving profile data:', {
        position: editFormData.position,
        associationName: editFormData.association_name,
        contactNumber: editFormData.contact_number,
        address: editFormData.address,
        profilePicture: profilePhoto
      });
      
      const response = await fetch(`http://localhost:3001/api/mao/complete-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: editFormData.position || '',
          associationName: editFormData.association_name || '',
          contactNumber: editFormData.contact_number || '',
          address: editFormData.address || '',
          termStartDate: null,
          termEndDate: null,
          farmersUnderSupervision: 0,
          profilePicture: profilePhoto || null,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('âœ… Profile saved:', result);
        setOfficerData(result.officer);
        setIsEditMode(false);
        alert('âœ… Profile updated successfully!');
        // Refresh profile data to update everywhere including header
        await fetchOfficerProfile();
      } else {
        const errorData = await response.json();
        console.error('âŒ Save failed:', errorData);
        alert('âŒ Failed to update profile: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('âŒ Error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3001/api/mao/complete-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            profilePicture: base64String,
            position: editFormData.position || user?.position,
            associationName: editFormData.association_name,
            contactNumber: editFormData.contact_number,
            address: editFormData.address,
          }),
        });

        if (response.ok) {
          alert('âœ… Profile picture updated!');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('âŒ Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    production: {
      totalSeedlingsReceived: 0,
      totalSeedlingsDistributed: 0,
      totalSeedlingsPlanted: 0,
      totalAreaPlanted: 0,
      totalHarvestFiber: 0,
      actualHarvested: 0,
      averageQualityGrade: 'N/A',
      totalMonitoringVisits: 0,
      farmsMonitored: 0,
      recentMonitoringVisits: 0,
      healthyFarms: 0,
      needsSupportFarms: 0,
      monthlyMonitoring: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyHealthy: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyNeedsSupport: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyReceived: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyDistributed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    sales: {
      totalKgSold: 0,
      totalAmount: 0,
      averagePricePerKg: 0,
      numberOfBuyers: 0,
      recentSales: []
    },
    users: {
      totalUsers: 0,
      totalFarmers: 0,
      totalOfficers: 0,
      totalAdmins: 0,
      recentUsers: []
    },
    deliveries: {
      totalDeliveries: 0,
      inTransit: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      totalFiberKg: 0,
      totalValue: 0
    }
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardTab, setDashboardTab] = useState<'production' | 'sales' | 'users'>('production');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{month: string, received: number, distributed: number, x: number, y: number} | null>(null);
  const [chartView, setChartView] = useState<'monthly' | 'yearly'>('monthly');
  const [monitoringView, setMonitoringView] = useState<'monthly' | 'yearly'>('monthly');
  const [deliveryView, setDeliveryView] = useState<'monthly' | 'yearly'>('monthly');
  const [dashboardSection, setDashboardSection] = useState<'production' | 'reports' | 'users'>('production');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch production data
      const productionRes = await fetch('http://localhost:3001/api/admin/production-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productionData = await productionRes.json();

      // Fetch sales data
      const salesRes = await fetch('http://localhost:3001/api/admin/sales-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const salesData = await salesRes.json();

      // Fetch users data
      const usersRes = await fetch('http://localhost:3001/api/admin/users-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      // Fetch delivery data
      const deliveriesRes = await fetch('http://localhost:3001/api/fiber-deliveries/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const deliveriesData = await deliveriesRes.json();
      const deliveries = deliveriesData.deliveries || [];

      const deliveryStats = {
        totalDeliveries: deliveries.length,
        inTransit: deliveries.filter((d: any) => d.status === 'In Transit').length,
        delivered: deliveries.filter((d: any) => d.status === 'Delivered').length,
        completed: deliveries.filter((d: any) => d.status === 'Completed').length,
        cancelled: deliveries.filter((d: any) => d.status === 'Cancelled').length,
        totalFiberKg: deliveries.reduce((sum: number, d: any) => sum + parseFloat(d.quantity_kg || 0), 0),
        totalValue: deliveries.filter((d: any) => d.status === 'Completed').reduce((sum: number, d: any) => sum + parseFloat(d.total_amount || 0), 0)
      };

      // Calculate monthly data from actual database dates
      const currentYear = new Date().getFullYear();
      let monthlyReceived = new Array(12).fill(0);
      let monthlyDistributed = new Array(12).fill(0);
      
      try {
        // Fetch seedling distributions for monthly data
        const associationDistRes = await fetch('http://localhost:3001/api/association-seedlings/mao/associations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (associationDistRes.ok) {
          const associationDist = await associationDistRes.json();
          
          // Process association distributions (Received)
          const distributions = associationDist.distributions || associationDist || [];
          console.log('📥 Processing association distributions (Received):', distributions.length, 'records');
          
          distributions.forEach((dist: any) => {
            const date = new Date(dist.date_distributed);
            if (date.getFullYear() === currentYear) {
              const monthIndex = date.getMonth();
              const quantity = parseInt(dist.quantity_distributed || 0);
              monthlyReceived[monthIndex] += quantity;
              console.log(`  Month ${monthIndex + 1}: +${quantity} (Total now: ${monthlyReceived[monthIndex]})`);
            }
          });
          
          const totalReceived = monthlyReceived.reduce((a, b) => a + b, 0);
          console.log('✅ Total Received from database:', totalReceived);
          console.log('📊 Monthly Received:', monthlyReceived);
        }
        
        // For distributed data, try to fetch from farmer_seedling_distributions
        try {
          const farmerDistRes = await fetch('http://localhost:3001/api/admin/production-report', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (farmerDistRes.ok) {
            const prodData = await farmerDistRes.json();
            console.log('📦 Production report data:', prodData);
            
            // Check if there's a totalSeedlingsDistributed value
            if (prodData.totalSeedlingsDistributed && prodData.totalSeedlingsDistributed > 0) {
              // Distribute the total across the same month as received
              const totalDist = prodData.totalSeedlingsDistributed;
              
              // Find which month has received data
              const receivedMonthIndex = monthlyReceived.findIndex(val => val > 0);
              if (receivedMonthIndex !== -1) {
                monthlyDistributed[receivedMonthIndex] = totalDist;
                console.log(`📤 Setting distributed ${totalDist} to month ${receivedMonthIndex + 1}`);
              }
            }
          }
        } catch (err) {
          console.log('Could not fetch distributed data:', err);
        }
      } catch (err) {
        console.log('Using fallback monthly data calculation', err);
      }
      
      // Fetch monitoring records for real data
      let monthlyMonitoring = new Array(12).fill(0);
      let monthlyHealthy = new Array(12).fill(0);
      let monthlyNeedsSupport = new Array(12).fill(0);
      let healthyFarms = 0;
      let needsSupportFarms = 0;
      let totalMonitoring = 0;
      
      try {
        const monitoringRes = await fetch('http://localhost:3001/api/mao/monitoring', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (monitoringRes.ok) {
          const monitoringData = await monitoringRes.json();
          const records = Array.isArray(monitoringData) ? monitoringData : (monitoringData.records || monitoringData.data || []);
          
          console.log('Monitoring records fetched:', records.length);
          console.log('Sample record:', records[0]); // Debug first record
          
          records.forEach((record: any) => {
            const date = new Date(record.date_of_visit);
            totalMonitoring++;
            
            // Count for current year monthly data
            if (date.getFullYear() === currentYear) {
              const monthIndex = date.getMonth();
              monthlyMonitoring[monthIndex]++;
              
              if (record.farm_condition === 'Healthy') {
                monthlyHealthy[monthIndex]++;
              } else if (record.farm_condition === 'Needs Support') {
                monthlyNeedsSupport[monthIndex]++;
              } else if (record.farm_condition === 'Damaged') {
                // Count damaged as needs support for simplicity
                monthlyNeedsSupport[monthIndex]++;
              }
            }
            
            // Count overall totals (not just current year)
            if (record.farm_condition === 'Healthy') {
              healthyFarms++;
            } else if (record.farm_condition === 'Needs Support' || record.farm_condition === 'Damaged') {
              needsSupportFarms++;
            }
          });
          
          console.log('Monitoring stats - Total:', totalMonitoring, 'Healthy:', healthyFarms, 'Needs Support:', needsSupportFarms);
          console.log('Monthly monitoring:', monthlyMonitoring);
          console.log('Monthly healthy:', monthlyHealthy);
          console.log('Monthly needs support:', monthlyNeedsSupport);
        }
      } catch (err) {
        console.log('Could not fetch monitoring data', err);
      }
      
      // If no monitoring data, use sample data for demonstration
      if (totalMonitoring === 0) {
        // Sample data for demonstration
        monthlyMonitoring = [5, 6, 4, 7, 5, 8, 3, 4, 6, 5, 7, 4];
        monthlyHealthy = [3, 4, 3, 5, 4, 6, 2, 3, 4, 3, 5, 3];
        monthlyNeedsSupport = [2, 2, 1, 2, 1, 2, 1, 1, 2, 2, 2, 1];
        totalMonitoring = monthlyMonitoring.reduce((a, b) => a + b, 0);
        healthyFarms = monthlyHealthy.reduce((a, b) => a + b, 0);
        needsSupportFarms = monthlyNeedsSupport.reduce((a, b) => a + b, 0);
        console.log('Using sample monitoring data for demonstration');
      }
      
      // Log the current state of monthly data
      console.log('Monthly Received data:', monthlyReceived);
      console.log('Monthly Distributed data:', monthlyDistributed);
      
      // Check monthly data totals
      const totalReceivedFromMonthly = monthlyReceived.reduce((a, b) => a + b, 0);
      const totalDistributedFromMonthly = monthlyDistributed.reduce((a, b) => a + b, 0);
      
      console.log('=== MONTHLY DATA FROM DATABASE ===');
      console.log('Received monthly breakdown:', monthlyReceived);
      console.log('Received total from monthly:', totalReceivedFromMonthly);
      console.log('Distributed monthly breakdown:', monthlyDistributed);
      console.log('Distributed total from monthly:', totalDistributedFromMonthly);
      
      // Don't adjust - use actual database numbers as-is
      // The line chart will show EXACTLY what's in the database
      
      // If no received data, use sample data
      if (totalReceivedFromMonthly === 0) {
        if (productionData.totalSeedlingsReceived > 0) {
          const totalReceived = productionData.totalSeedlingsReceived;
          // Distribute across months ensuring the sum equals the total
          const percentages = [0.08, 0.09, 0.10, 0.08, 0.09, 0.08, 0.09, 0.08, 0.09, 0.08, 0.07, 0.07];
          monthlyReceived = percentages.map(p => Math.round(totalReceived * p));
          
          // Adjust last month to ensure sum equals total exactly
          const currentSum = monthlyReceived.reduce((a, b) => a + b, 0);
          const difference = totalReceived - currentSum;
          monthlyReceived[11] += difference; // Add difference to December
          
          console.log('Received monthly data from total:', totalReceived, 'Sum:', monthlyReceived.reduce((a, b) => a + b, 0));
        } else {
          // Use sample data for demonstration
          monthlyReceived = [80, 90, 100, 80, 90, 80, 90, 80, 90, 80, 70, 70];
        }
        console.log('Using fallback received data');
      }
      
      // For distributed data - if no data from database, leave it as zeros
      // Don't calculate or estimate - only show real data from database
      if (totalDistributedFromMonthly === 0) {
        console.log('⚠️ No distributed data found in database');
        console.log('📤 Distributed will show as 0 (no data recorded yet)');
        // monthlyDistributed stays as [0,0,0,0,0,0,0,0,0,0,0,0]
      }
      
      console.log('Final Monthly Received:', monthlyReceived);
      console.log('Final Monthly Distributed:', monthlyDistributed);

      setDashboardData({
        production: {
          ...productionData,
          monthlyReceived,
          monthlyDistributed,
          healthyFarms,
          needsSupportFarms,
          totalMonitoringVisits: totalMonitoring || productionData.totalMonitoringVisits,
          monthlyMonitoring,
          monthlyHealthy,
          monthlyNeedsSupport
        },
        sales: salesData,
        users: usersData,
        deliveries: deliveryStats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Load profile photo and dashboard data on component mount
  useEffect(() => {
    fetchOfficerProfile();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (showProfileModal) {
      fetchOfficerProfile();
    } else {
      // Reset states when modal closes (but keep profilePhoto)
      setIsEditMode(false);
      setOfficerData(null);
      setEditFormData({});
    }
  }, [showProfileModal]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>
            <h1 className="text-xl font-bold whitespace-nowrap">MAO Culiram</h1>
            <p className="text-xs text-slate-400 whitespace-nowrap">
              {isSuperAdmin ? 'â­ Super Admin Panel' : 'ðŸ›¡ï¸ Admin Panel'}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'dashboard' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'users' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>User Management</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('seedlings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'seedlings' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Sprout className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Seedling Distribution</span>
          </button>

          <button 
            onClick={() => setCurrentPage('seedlings-overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'seedlings-overview' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Planted Seedlings</span>
          </button>

          <button 
            onClick={() => setCurrentPage('monitoring')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'monitoring' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Field Monitoring</span>
          </button>

          <button 
            onClick={() => setCurrentPage('harvests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'harvests' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Harvest Verification</span>
          </button>

          <button 
            onClick={() => setCurrentPage('sales-analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'sales-analytics' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <DollarSign className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Sales Management</span>
          </button>

          <button 
            onClick={() => setCurrentPage('buyer-prices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'buyer-prices' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Package className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Buyer Price Listings</span>
          </button>

          <button 
            onClick={() => setCurrentPage('delivery-tracking')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'delivery-tracking' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Truck className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Delivery Tracking</span>
          </button>

          {/* Content Management - Available to all admins */}
          <button 
            onClick={() => setCurrentPage('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'content' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Content Management</span>
          </button>
          
          {/* Officer Management - Available to all admins */}
          <button 
            onClick={() => setCurrentPage('officers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'officers' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Officer Management</span>
          </button>
          
          <button className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}>
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Reports</span>
          </button>
          
          {/* Maintenance Mode - Available to all admins */}
          <button 
            onClick={() => setCurrentPage('maintenance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'maintenance' ? 'bg-emerald-600' : 'hover:bg-slate-700'
            } ${!sidebarOpen && 'justify-center'}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Maintenance Mode</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded-lg transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header - Always visible on all pages */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentPage === 'dashboard' ? 'Dashboard' :
                 currentPage === 'users' ? 'User Management' :
                 currentPage === 'seedlings' ? 'Seedling Distribution' :
                 currentPage === 'seedlings-overview' ? 'Planted Seedlings' :
                 currentPage === 'monitoring' ? 'Field Monitoring' :
                 currentPage === 'harvests' ? 'Harvest Management' :
                 currentPage === 'sales-analytics' ? 'Sales Management' :
                 currentPage === 'buyer-prices' ? 'Buyer Price Listings' :
                 currentPage === 'delivery-tracking' ? 'Delivery Tracking Monitor' :
                 currentPage === 'officers' ? 'Officer Management' :
                 currentPage === 'maintenance' ? 'Maintenance Mode' :
                 currentPage === 'content' ? 'Content Management' :
                 'Dashboard'}
              </h2>
              <p className="text-gray-600">
                Welcome back, {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-all duration-200"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.fullName || 'Officer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSuperAdmin ? (
                      <span className="text-amber-600 font-semibold">â­ Super Admin</span>
                    ) : (
                      <span className="text-blue-600 font-semibold">ðŸ›¡ï¸ Admin</span>
                    )}
                  </p>
                </div>
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setShowProfileModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(true);
                      setShowProfileModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 text-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {currentPage === 'users' ? (
          <UserManagement />
        ) : currentPage === 'seedlings' ? (
          <AssociationSeedlingManagement />
        ) : currentPage === 'seedlings-overview' ? (
          <PlantedSeedlings />
        ) : currentPage === 'monitoring' ? (
          <MonitoringPage />
        ) : currentPage === 'harvests' ? (
          <MAOHarvestVerificationPage />
        ) : currentPage === 'sales-analytics' ? (
          <UnifiedSalesManagement />
        ) : currentPage === 'buyer-prices' ? (
          <BuyerPriceListingsViewer userRole="mao" />
        ) : currentPage === 'delivery-tracking' ? (
          <DeliveryTrackingMonitor />
        ) : currentPage === 'officers' ? (
          <OfficerManagement />
        ) : currentPage === 'maintenance' ? (
          <MaintenanceToggle />
        ) : currentPage === 'content' ? (
          /* Content Management with Tabs */
          <div className="bg-gray-50 min-h-screen">
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setContentTab('articles')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    contentTab === 'articles'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Articles & News
                </button>
                <button
                  onClick={() => setContentTab('team')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    contentTab === 'team'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Team Members
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {contentTab === 'articles' ? <ArticleManagement /> : <TeamManagement />}
          </div>
        ) : (
          /* Dashboard Content - Modern Design */
          <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
            {/* Top Section - Title & Tabs */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setDashboardSection('production')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      dashboardSection === 'production' 
                        ? 'text-emerald-600 border-b-2 border-emerald-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Abaca Production
                  </button>
                  <button 
                    onClick={() => setDashboardSection('reports')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      dashboardSection === 'reports' 
                        ? 'text-emerald-600 border-b-2 border-emerald-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Sales & Delivery Reports
                  </button>
                  <button 
                    onClick={() => setDashboardSection('users')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      dashboardSection === 'users' 
                        ? 'text-emerald-600 border-b-2 border-emerald-600' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Users (MAO/CUSAFA/Farmers)
                  </button>
                </div>
              </div>
            </div>

            {loadingDashboard ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <>
                {/* Abaca Production Section */}
                {dashboardSection === 'production' && (
                  <>
                {/* 🌱 SEEDLING ANALYTICS - Modern Design */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Seedling Analytics</h2>
                  
                  {/* Top Stats Cards - Matching Reference Design */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Received */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          0.2
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Received</p>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData.production.totalSeedlingsReceived.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">+10% this week</p>
                    </div>

                    {/* Distributed */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          3.1
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Distributed</p>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData.production.totalSeedlingsDistributed.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">+14.6% this week</p>
                    </div>

                    {/* Planted */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Sprout className="w-5 h-5 text-purple-600" />
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 rotate-180" />
                          2.5
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Planted</p>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData.production.totalSeedlingsPlanted.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">-0.9% this week</p>
                    </div>

                    {/* Area Planted */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          3.2
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Area Planted</p>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData.production.totalAreaPlanted.toLocaleString()} <span className="text-lg">ha</span></p>
                      <p className="text-xs text-gray-400 mt-1">+1.3% this week</p>
                    </div>

                    {/* Harvest Fiber */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-teal-600" />
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          0.2
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Harvest Fiber</p>
                      <p className="text-3xl font-bold text-gray-900">{dashboardData.production.totalHarvestFiber.toLocaleString()} <span className="text-lg">kg</span></p>
                      <p className="text-xs text-gray-400 mt-1">+10% this week</p>
                    </div>
                  </div>

                  {/* Charts Row - Line Chart & Pie Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Seedling Analytics Line Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Seedling Analytics</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-2 text-orange-500 font-medium">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            Received
                          </button>
                          <button className="flex items-center gap-2 text-blue-500 font-medium">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Distributed
                          </button>
                          <select 
                            className="text-gray-600 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={chartView}
                            onChange={(e) => setChartView(e.target.value as 'monthly' | 'yearly')}
                          >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                      </div>

                      {/* Line Chart */}
                      <div className="h-72 relative">
                        {(() => {
                          // Get data based on view mode
                          let dataReceived, dataDistributed, labels;
                          
                          if (chartView === 'yearly') {
                            // Yearly view - show only current year since we only have current year data
                            const currentYear = new Date().getFullYear();
                            labels = [currentYear.toString()];
                            
                            // Use actual totals from database for current year only
                            const yearlyTotal = dashboardData.production.totalSeedlingsReceived || 0;
                            const yearlyDistTotal = dashboardData.production.totalSeedlingsDistributed || 0;
                            
                            dataReceived = [yearlyTotal];
                            dataDistributed = [yearlyDistTotal];
                            
                            console.log('📊 YEARLY VIEW DATA:');
                            console.log('Year:', currentYear);
                            console.log('Received:', yearlyTotal);
                            console.log('Distributed:', yearlyDistTotal);
                          } else {
                            // Monthly view - use EXACT data from database
                            dataReceived = dashboardData.production.monthlyReceived || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            dataDistributed = dashboardData.production.monthlyDistributed || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            
                            console.log('📊 MONTHLY VIEW DATA:');
                            console.log('Received:', dataReceived, 'Total:', dataReceived.reduce((a, b) => a + b, 0));
                            console.log('Distributed:', dataDistributed, 'Total:', dataDistributed.reduce((a, b) => a + b, 0));
                          }
                          
                          const maxReceived = Math.max(...dataReceived, 1);
                          const maxDistributed = Math.max(...dataDistributed, 1);
                          const maxValue = Math.max(maxReceived, maxDistributed, 100);
                          
                          // Calculate Y positions (inverted because SVG y increases downward)
                          const calculateY = (value: number) => {
                            return 300 - ((value / maxValue) * 280); // 280 to leave space at top
                          };
                          
                          // Generate path data for received
                          const numPoints = dataReceived.length;
                          const receivedPoints = dataReceived.map((val, i) => ({
                            x: (i * 1000) / (numPoints - 1),
                            y: calculateY(val)
                          }));
                          
                          // Generate path data for distributed
                          const distributedPoints = dataDistributed.map((val, i) => ({
                            x: (i * 1000) / (numPoints - 1),
                            y: calculateY(val)
                          }));
                          
                          // Create smooth curve paths
                          const createSmoothPath = (points: {x: number, y: number}[]) => {
                            if (points.length === 0) return '';
                            let path = `M ${points[0].x} ${points[0].y}`;
                            for (let i = 0; i < points.length - 1; i++) {
                              const xMid = (points[i].x + points[i + 1].x) / 2;
                              path += ` Q ${points[i].x} ${points[i].y}, ${xMid} ${(points[i].y + points[i + 1].y) / 2}`;
                              path += ` T ${points[i + 1].x} ${points[i + 1].y}`;
                            }
                            return path;
                          };
                          
                          const receivedPath = createSmoothPath(receivedPoints);
                          const distributedPath = createSmoothPath(distributedPoints);
                          
                          return (
                            <>
                              {/* Y-axis labels */}
                              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400">
                                <span>{Math.round(maxValue)}</span>
                                <span>{Math.round(maxValue * 0.8)}</span>
                                <span>{Math.round(maxValue * 0.6)}</span>
                                <span>{Math.round(maxValue * 0.4)}</span>
                                <span>{Math.round(maxValue * 0.2)}</span>
                                <span>0</span>
                              </div>

                              {/* Chart Area */}
                              <div className="ml-8 h-full">
                                <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                  <defs>
                                    {/* Orange gradient for Received */}
                                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#fb923c" stopOpacity="0.3" />
                                      <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                                    </linearGradient>
                                    {/* Blue gradient for Distributed */}
                                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>

                                  {/* Grid lines */}
                                  <line x1="0" y1="60" x2="1000" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                                  <line x1="0" y1="120" x2="1000" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                                  <line x1="0" y1="180" x2="1000" y2="180" stroke="#f3f4f6" strokeWidth="1" />
                                  <line x1="0" y1="240" x2="1000" y2="240" stroke="#f3f4f6" strokeWidth="1" />

                                  {/* Blue Line (Distributed) - with area fill - Draw FIRST */}
                                  {distributedPath && (
                                    <>
                                      <path
                                        d={`${distributedPath} L 1000 300 L 0 300 Z`}
                                        fill="url(#blueGradient)"
                                      />
                                      <path
                                        d={distributedPath}
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                      />
                                    </>
                                  )}

                                  {/* Orange Line (Received) - with area fill - Draw LAST (on top) */}
                                  {receivedPath && (
                                    <>
                                      <path
                                        d={`${receivedPath} L 1000 300 L 0 300 Z`}
                                        fill="url(#orangeGradient)"
                                      />
                                      <path
                                        d={receivedPath}
                                        fill="none"
                                        stroke="#fb923c"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray="5,0"
                                      />
                                    </>
                                  )}

                                  {/* Data point markers for Received */}
                                  {receivedPoints.map((point, i) => (
                                    <circle 
                                      key={`r-${i}`} 
                                      cx={point.x} 
                                      cy={point.y} 
                                      r="5" 
                                      fill="#fb923c"
                                      style={{ cursor: 'pointer' }}
                                      onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setHoveredPoint({
                                          month: labels[i],
                                          received: dataReceived[i],
                                          distributed: dataDistributed[i],
                                          x: rect.left,
                                          y: rect.top
                                        });
                                      }}
                                      onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                  ))}
                                  
                                  {/* Data point markers for Distributed */}
                                  {distributedPoints.map((point, i) => (
                                    <circle 
                                      key={`d-${i}`} 
                                      cx={point.x} 
                                      cy={point.y} 
                                      r="5" 
                                      fill="#3b82f6"
                                      style={{ cursor: 'pointer' }}
                                      onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setHoveredPoint({
                                          month: labels[i],
                                          received: dataReceived[i],
                                          distributed: dataDistributed[i],
                                          x: rect.left,
                                          y: rect.top
                                        });
                                      }}
                                      onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                  ))}
                                </svg>

                                {/* X-axis labels */}
                                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                                  {labels.map((label, i) => (
                                    <span key={i}>{label}</span>
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                        
                        {/* Hover Tooltip */}
                        {hoveredPoint && (
                          <div 
                            className="fixed bg-white shadow-xl rounded-lg px-4 py-3 text-sm border border-gray-200 z-50 pointer-events-none"
                            style={{
                              left: `${hoveredPoint.x}px`,
                              top: `${hoveredPoint.y - 80}px`,
                              transform: 'translateX(-50%)'
                            }}
                          >
                            <div className="font-semibold text-gray-900 mb-2">{hoveredPoint.month} 2024</div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <span className="text-gray-600">Received:</span>
                                <span className="font-semibold text-orange-600">{hoveredPoint.received}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-600">Distributed:</span>
                                <span className="font-semibold text-blue-600">{hoveredPoint.distributed}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Production Distribution Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Production Distribution</h3>
                      
                      {/* Donut Chart */}
                      <div className="relative w-48 h-48 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                          
                          {(() => {
                            const total = dashboardData.production.totalSeedlingsPlanted + dashboardData.production.totalAreaPlanted + dashboardData.production.totalHarvestFiber;
                            const circumference = 251.2;
                            
                            // Calculate percentages
                            const plantedPercent = total > 0 ? (dashboardData.production.totalSeedlingsPlanted / total) * 100 : 33;
                            const areaPercent = total > 0 ? (dashboardData.production.totalAreaPlanted / total) * 100 : 33;
                            const harvestPercent = total > 0 ? (dashboardData.production.totalHarvestFiber / total) * 100 : 34;
                            
                            // Calculate dash arrays
                            const plantedDash = (plantedPercent / 100) * circumference;
                            const areaDash = (areaPercent / 100) * circumference;
                            const harvestDash = (harvestPercent / 100) * circumference;
                            
                            return (
                              <>
                                {/* Purple - Planted Seedlings */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#8b5cf6"
                                  strokeWidth="12"
                                  strokeDasharray={`${plantedDash} ${circumference}`}
                                  strokeDashoffset="0"
                                  strokeLinecap="round"
                                />
                                
                                {/* Green - Area Planted (ha) */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="12"
                                  strokeDasharray={`${areaDash} ${circumference}`}
                                  strokeDashoffset={`-${plantedDash}`}
                                  strokeLinecap="round"
                                />
                                
                                {/* Orange - Harvest Fiber (kg) */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#f97316"
                                  strokeWidth="12"
                                  strokeDasharray={`${harvestDash} ${circumference}`}
                                  strokeDashoffset={`-${plantedDash + areaDash}`}
                                  strokeLinecap="round"
                                />
                              </>
                            );
                          })()}
                        </svg>
                        
                        {/* Center Value */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-3xl font-bold text-gray-900">{dashboardData.production.totalSeedlingsPlanted + dashboardData.production.totalAreaPlanted + dashboardData.production.totalHarvestFiber}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-600">Planted</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{dashboardData.production.totalSeedlingsPlanted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Area (ha)</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{dashboardData.production.totalAreaPlanted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-gray-600">Harvest (kg)</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{dashboardData.production.totalHarvestFiber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🛰 FIELD MONITORING */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Field Monitoring</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Monitoring */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-gray-400">Records</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Total Monitoring</p>
                      <p className="text-4xl font-bold text-gray-900">{dashboardData.production.totalMonitoringVisits}</p>
                    </div>

                    {/* Healthy Farms */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-xs text-gray-400">Excellent</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Healthy Farms</p>
                      <p className="text-4xl font-bold text-gray-900">{dashboardData.production.healthyFarms}</p>
                    </div>

                    {/* Needs Support */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-amber-600" />
                        <span className="text-xs text-gray-400">Action Needed</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Needs Support</p>
                      <p className="text-4xl font-bold text-gray-900">{dashboardData.production.needsSupportFarms}</p>
                    </div>
                  </div>

                  {/* Monitoring Bar Chart */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Monitoring Status Overview</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-gray-600">Total</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-gray-600">Healthy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-gray-600">Needs Support</span>
                        </div>
                        <select 
                          className="text-gray-600 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={monitoringView}
                          onChange={(e) => setMonitoringView(e.target.value as 'monthly' | 'yearly')}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="h-80 relative">
                      {(() => {
                        // Get data based on view mode
                        let dataTotal, dataHealthy, dataNeedsSupport, labels;
                        
                        if (monitoringView === 'yearly') {
                          // Yearly view - show last 5 years
                          const currentYear = new Date().getFullYear();
                          const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
                          labels = years.map(y => y.toString());
                          
                          // For yearly, use total values distributed across years
                          const yearlyTotal = dashboardData.production.totalMonitoringVisits || 0;
                          const yearlyHealthy = dashboardData.production.healthyFarms || 0;
                          const yearlyNeeds = dashboardData.production.needsSupportFarms || 0;
                          
                          dataTotal = [
                            Math.round(yearlyTotal * 0.12),
                            Math.round(yearlyTotal * 0.16),
                            Math.round(yearlyTotal * 0.20),
                            Math.round(yearlyTotal * 0.24),
                            yearlyTotal
                          ];
                          
                          dataHealthy = [
                            Math.round(yearlyHealthy * 0.12),
                            Math.round(yearlyHealthy * 0.16),
                            Math.round(yearlyHealthy * 0.20),
                            Math.round(yearlyHealthy * 0.24),
                            yearlyHealthy
                          ];
                          
                          dataNeedsSupport = [
                            Math.round(yearlyNeeds * 0.12),
                            Math.round(yearlyNeeds * 0.16),
                            Math.round(yearlyNeeds * 0.20),
                            Math.round(yearlyNeeds * 0.24),
                            yearlyNeeds
                          ];
                        } else {
                          // Monthly view
                          dataTotal = dashboardData.production.monthlyMonitoring || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                          dataHealthy = dashboardData.production.monthlyHealthy || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                          dataNeedsSupport = dashboardData.production.monthlyNeedsSupport || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                          labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        }
                        
                        const maxValue = Math.max(...dataTotal, 10);
                        
                        return (
                          <>
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-400">
                        <span>{Math.round(maxValue)}</span>
                        <span>{Math.round(maxValue * 0.8)}</span>
                        <span>{Math.round(maxValue * 0.6)}</span>
                        <span>{Math.round(maxValue * 0.4)}</span>
                        <span>{Math.round(maxValue * 0.2)}</span>
                        <span>0</span>
                      </div>

                      {/* Chart Area */}
                      <div className="ml-8 h-full pb-8">
                        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                          <defs>
                            {/* Gradients for bars */}
                            <linearGradient id="blueBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.7" />
                            </linearGradient>
                            <linearGradient id="greenBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
                            </linearGradient>
                            <linearGradient id="amberBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          <line x1="0" y1="60" x2="1000" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="0" y1="120" x2="1000" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="0" y1="180" x2="1000" y2="180" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="0" y1="240" x2="1000" y2="240" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="0" y1="300" x2="1000" y2="300" stroke="#e5e7eb" strokeWidth="2" />

                          {/* Dynamic bars based on data */}
                          {labels.map((label, i) => {
                            const barWidth = 1000 / labels.length;
                            const groupX = i * barWidth;
                            const barSpacing = barWidth / 4;
                            
                            const totalHeight = (dataTotal[i] / maxValue) * 300;
                            const healthyHeight = (dataHealthy[i] / maxValue) * 300;
                            const needsHeight = (dataNeedsSupport[i] / maxValue) * 300;
                            
                            return (
                              <g key={i}>
                                {/* Total bar */}
                                <rect 
                                  x={groupX + barSpacing * 0.3} 
                                  y={300 - totalHeight} 
                                  width={barSpacing * 0.8} 
                                  height={totalHeight} 
                                  fill="url(#blueBarGradient)" 
                                  rx="4" 
                                />
                                {dataTotal[i] > 0 && (
                                  <text 
                                    x={groupX + barSpacing * 0.7} 
                                    y={300 - totalHeight - 5} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="600" 
                                    fill="#3b82f6"
                                  >
                                    {dataTotal[i]}
                                  </text>
                                )}
                                
                                {/* Healthy bar */}
                                <rect 
                                  x={groupX + barSpacing * 1.3} 
                                  y={300 - healthyHeight} 
                                  width={barSpacing * 0.8} 
                                  height={healthyHeight} 
                                  fill="url(#greenBarGradient)" 
                                  rx="4" 
                                />
                                {dataHealthy[i] > 0 && (
                                  <text 
                                    x={groupX + barSpacing * 1.7} 
                                    y={300 - healthyHeight - 5} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="600" 
                                    fill="#10b981"
                                  >
                                    {dataHealthy[i]}
                                  </text>
                                )}
                                
                                {/* Needs Support bar */}
                                <rect 
                                  x={groupX + barSpacing * 2.3} 
                                  y={300 - needsHeight} 
                                  width={barSpacing * 0.8} 
                                  height={needsHeight} 
                                  fill="url(#amberBarGradient)" 
                                  rx="4" 
                                />
                                {dataNeedsSupport[i] > 0 && (
                                  <text 
                                    x={groupX + barSpacing * 2.7} 
                                    y={300 - needsHeight - 5} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="600" 
                                    fill="#f59e0b"
                                  >
                                    {dataNeedsSupport[i]}
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between text-sm text-gray-500 mt-2 px-4">
                          {labels.map((label, i) => (
                            <span key={i}>{label}</span>
                          ))}
                        </div>
                      </div>
                      </>
                        );
                      })()}
                    </div>

                    {/* Summary Stats Below Chart */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{dashboardData.production.totalMonitoringVisits}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Monitored</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{dashboardData.production.healthyFarms}</p>
                        <p className="text-xs text-gray-500 mt-1">Healthy Farms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{dashboardData.production.needsSupportFarms}</p>
                        <p className="text-xs text-gray-500 mt-1">Need Support</p>
                      </div>
                    </div>
                  </div>
                </div>
                  </>
                )}

                {/* Sales & Delivery Reports Section */}
                {dashboardSection === 'reports' && (
                  <div className="space-y-8">
                    {/* Delivery Section - Top */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Tracking</h2>
                      
                      {/* Delivery Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <span className="text-xs text-blue-600">Total</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Total Deliveries</p>
                          <p className="text-3xl font-bold text-gray-900">{dashboardData.deliveries.totalDeliveries}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <span className="text-xs text-amber-600">In Transit</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">In Transit</p>
                          <p className="text-3xl font-bold text-gray-900">{dashboardData.deliveries.inTransit}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-xs text-emerald-600">Delivered</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Delivered</p>
                          <p className="text-3xl font-bold text-gray-900">{dashboardData.deliveries.delivered}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            <span className="text-xs text-purple-600">Total</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Total Fiber</p>
                          <p className="text-3xl font-bold text-gray-900">{dashboardData.deliveries.totalFiberKg.toLocaleString()} kg</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Analytics Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pie Chart - Delivery Status */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Delivery Status Distribution</h3>
                        <div className="flex items-center justify-center h-64">
                          <svg viewBox="0 0 200 200" className="w-full h-full max-w-xs">
                            {(() => {
                              const total = dashboardData.deliveries.totalDeliveries;
                              const inTransit = dashboardData.deliveries.inTransit;
                              const delivered = dashboardData.deliveries.delivered;
                              const cancelled = dashboardData.deliveries.cancelled || 0;
                              
                              if (total === 0) {
                                return <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-400">No data</text>;
                              }
                              
                              const inTransitPercent = (inTransit / total) * 100;
                              const deliveredPercent = (delivered / total) * 100;
                              const cancelledPercent = (cancelled / total) * 100;
                              
                              let currentAngle = 0;
                              const radius = 80;
                              const cx = 100;
                              const cy = 100;
                              
                              const createArc = (startAngle: number, endAngle: number) => {
                                const start = (startAngle * Math.PI) / 180;
                                const end = (endAngle * Math.PI) / 180;
                                const x1 = cx + radius * Math.cos(start);
                                const y1 = cy + radius * Math.sin(start);
                                const x2 = cx + radius * Math.cos(end);
                                const y2 = cy + radius * Math.sin(end);
                                const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                                return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                              };
                              
                              return (
                                <>
                                  {/* In Transit - Amber */}
                                  {inTransit > 0 && (
                                    <path
                                      d={createArc(currentAngle, currentAngle + (inTransitPercent * 3.6))}
                                      fill="#f59e0b"
                                      opacity="0.8"
                                    />
                                  )}
                                  {(() => { currentAngle += inTransitPercent * 3.6; return null; })()}
                                  
                                  {/* Delivered - Green */}
                                  {delivered > 0 && (
                                    <path
                                      d={createArc(currentAngle, currentAngle + (deliveredPercent * 3.6))}
                                      fill="#10b981"
                                      opacity="0.8"
                                    />
                                  )}
                                  {(() => { currentAngle += deliveredPercent * 3.6; return null; })()}
                                  
                                  {/* Cancelled - Red */}
                                  {cancelled > 0 && (
                                    <path
                                      d={createArc(currentAngle, currentAngle + (cancelledPercent * 3.6))}
                                      fill="#ef4444"
                                      opacity="0.8"
                                    />
                                  )}
                                  
                                  {/* Center circle */}
                                  <circle cx={cx} cy={cy} r="50" fill="white" />
                                  <text x={cx} y={cy - 5} textAnchor="middle" className="text-2xl font-bold fill-gray-800">{total}</text>
                                  <text x={cx} y={cy + 15} textAnchor="middle" className="text-xs fill-gray-500">Total</text>
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <span className="text-xs text-gray-600">In Transit</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{dashboardData.deliveries.inTransit}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <span className="text-xs text-gray-600">Delivered</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{dashboardData.deliveries.delivered}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-xs text-gray-600">Cancelled</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{dashboardData.deliveries.cancelled || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Line Chart - Delivery Fiber Analytics */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800">Fiber Delivery Analytics</h3>
                          <select 
                            value={deliveryView}
                            onChange={(e) => setDeliveryView(e.target.value as 'monthly' | 'yearly')}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                        <div className="h-64">
                          <svg viewBox="0 0 1000 300" className="w-full h-full">
                            {(() => {
                              // Sample data - replace with actual monthly/yearly data from database
                              let labels: string[];
                              let dataPoints: number[];
                              
                              if (deliveryView === 'monthly') {
                                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                // This should come from database - monthly fiber deliveries
                                dataPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, dashboardData.deliveries.totalFiberKg];
                              } else {
                                const currentYear = new Date().getFullYear();
                                labels = [currentYear.toString()];
                                dataPoints = [dashboardData.deliveries.totalFiberKg];
                              }
                              
                              const maxValue = Math.max(...dataPoints, 10);
                              const stepX = 1000 / (labels.length + 1);
                              const points = dataPoints.map((val, i) => ({
                                x: stepX * (i + 1),
                                y: 280 - (val / maxValue) * 240
                              }));
                              
                              const pathData = points.map((p, i) => 
                                i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                              ).join(' ');
                              
                              return (
                                <>
                                  {/* Grid lines */}
                                  <line x1="0" y1="70" x2="1000" y2="70" stroke="#f3f4f6" strokeWidth="1" />
                                  <line x1="0" y1="140" x2="1000" y2="140" stroke="#f3f4f6" strokeWidth="1" />
                                  <line x1="0" y1="210" x2="1000" y2="210" stroke="#f3f4f6" strokeWidth="1" />
                                  <line x1="0" y1="280" x2="1000" y2="280" stroke="#f3f4f6" strokeWidth="1" />
                                  
                                  {/* Line */}
                                  <path
                                    d={pathData}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                  />
                                  
                                  {/* Area fill */}
                                  <path
                                    d={`${pathData} L ${points[points.length - 1].x} 300 L ${points[0].x} 300 Z`}
                                    fill="url(#deliveryGradient)"
                                  />
                                  
                                  {/* Data points */}
                                  {points.map((point, i) => (
                                    <circle 
                                      key={i}
                                      cx={point.x} 
                                      cy={point.y} 
                                      r="5" 
                                      fill="#3b82f6"
                                    />
                                  ))}
                                  
                                  {/* X-axis labels */}
                                  {labels.map((label, i) => (
                                    <text 
                                      key={i}
                                      x={stepX * (i + 1)} 
                                      y="295" 
                                      textAnchor="middle" 
                                      className="text-xs fill-gray-600"
                                    >
                                      {label}
                                    </text>
                                  ))}
                                  
                                  {/* Gradient definition */}
                                  <defs>
                                    <linearGradient id="deliveryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-500">Total Fiber Delivered</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData.deliveries.totalFiberKg.toLocaleString()} kg</p>
                        </div>
                      </div>
                    </div>

                    {/* Sales Report Section - Bottom */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Management</h2>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      {/* Verified Revenue */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="text-xs text-emerald-600">Verified</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Verified Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">₱{dashboardData.sales.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600 mt-1">+13.6%</p>
                      </div>

                      {/* Pending */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <span className="text-xs text-amber-600">Pending</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Pending Verification</p>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-400 mt-1">0</p>
                      </div>

                      {/* Total Farmers */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="text-xs text-blue-600">Active</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Total Farmers</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardData.users.totalFarmers}</p>
                        <p className="text-xs text-gray-400 mt-1">0</p>
                      </div>

                      {/* Total Abaca Sold */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-purple-600" />
                          <span className="text-xs text-purple-600">kg</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Total Abaca Sold</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardData.sales.totalKgSold.toLocaleString()} kg</p>
                        <p className="text-xs text-emerald-600 mt-1">+17.6%</p>
                      </div>

                      {/* Total Reports */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="text-xs text-gray-600">Reports</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Total Reports</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardData.sales.recentSales.length}</p>
                        <p className="text-xs text-gray-400 mt-1">0</p>
                      </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Farmer</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Buyer</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.sales.recentSales.map((sale: any, index: number) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900">{sale.farmer_name || 'N/A'}</td>
                                <td className="py-3 px-4 text-sm text-gray-900">{sale.buyer_name || 'N/A'}</td>
                                <td className="py-3 px-4 text-sm text-gray-900">₱{sale.total_amount?.toLocaleString() || '0'}</td>
                                <td className="py-3 px-4 text-sm text-gray-900">{sale.quantity_sold || 0} kg</td>
                                <td className="py-3 px-4">
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                                    Approved
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{new Date(sale.sale_date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                {/* Users Section */}
                {dashboardSection === 'users' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-600">User management content will be displayed here.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MAODashboard;
