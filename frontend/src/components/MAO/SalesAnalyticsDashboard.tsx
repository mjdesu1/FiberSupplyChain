import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  FileText,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Edit,
  Trash2,
  Plus,
  Calendar
} from 'lucide-react';
import { getUserData, getAuthToken } from '../../utils/authToken';

interface FarmerSalesData {
  farmerId: string;
  farmerName: string;
  totalRevenue: number;
  totalQuantity: number;
  transactionCount: number;
  lastReportDate: string;
  averagePrice: number;
  topGrade: string;
}

interface SalesReport {
  id: string;
  farmerId: string;
  farmerName: string;
  reportMonth: string;
  totalRevenue: number;
  totalQuantity: number;
  transactionCount: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  buyerName?: string;
}

interface SalesAnalytics {
  totalFarmers: number;
  totalRevenue: number;
  totalQuantity: number;
  totalTransactions: number;
  averageRevenuePerFarmer: number;
  topPerformingFarmer: string;
  mostPopularGrade: string;
  monthlyGrowth: number;
}

export const SalesAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SalesAnalytics>({
    totalFarmers: 0,
    totalRevenue: 0,
    totalQuantity: 0,
    totalTransactions: 0,
    averageRevenuePerFarmer: 0,
    topPerformingFarmer: '',
    mostPopularGrade: '',
    monthlyGrowth: 0
  });

  const [farmersData, setFarmersData] = useState<FarmerSalesData[]>([]);
  const [recentReports, setRecentReports] = useState<SalesReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [farmerFilter, setFarmerFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        // Load analytics data
        const analyticsResponse = await fetch(`${apiUrl}/api/sales/analytics?period=${selectedPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const analyticsResult = await analyticsResponse.json();
        
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.analytics);
        }
        
        // Load farmers performance data
        const farmersResponse = await fetch(`${apiUrl}/api/sales/farmers-performance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const farmersResult = await farmersResponse.json();
        
        if (farmersResult.success) {
          setFarmersData(farmersResult.farmers.map((farmer: any) => ({
            farmerId: farmer.farmer_id,
            farmerName: farmer.farmer_name,
            totalRevenue: parseFloat(farmer.total_revenue || 0),
            totalQuantity: parseFloat(farmer.total_quantity || 0),
            transactionCount: parseInt(farmer.total_transactions || 0),
            lastReportDate: farmer.last_report_date,
            averagePrice: parseFloat(farmer.average_price || 0),
            topGrade: farmer.top_grade || 'N/A'
          })));
        }
        
        // Load recent reports
        const reportsResponse = await fetch(`${apiUrl}/api/sales/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const reportsResult = await reportsResponse.json();
        
        if (reportsResult.success) {
          setRecentReports(reportsResult.reports.map((report: any) => ({
            id: report.report_id,
            farmerId: report.farmer_id,
            farmerName: report.farmers?.full_name || 'Unknown Farmer',
            reportMonth: report.report_month,
            totalRevenue: parseFloat(report.total_amount || 0),
            totalQuantity: parseFloat(report.quantity_sold || 0),
            transactionCount: 1, // Each report is now one transaction
            submittedAt: report.submitted_at,
            status: report.status as 'pending' | 'approved' | 'rejected',
            buyerName: report.buyer_company_name
          })));
        }
        
      } catch (error) {
        console.error('Error loading sales data:', error);
        // Set empty data on error
        setAnalytics({
          totalFarmers: 0,
          totalRevenue: 0,
          totalQuantity: 0,
          totalTransactions: 0,
          averageRevenuePerFarmer: 0,
          topPerformingFarmer: 'No data',
          mostPopularGrade: 'No data',
          monthlyGrowth: 0
        });
        setFarmersData([]);
        setRecentReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [selectedPeriod]);
  
  // Make loadSalesData available to other functions
  const loadSalesData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      // Load analytics data
      const analyticsResponse = await fetch(`${apiUrl}/api/sales/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const analyticsResult = await analyticsResponse.json();
      
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.analytics);
      }
      
      // Load farmers performance data
      const farmersResponse = await fetch(`${apiUrl}/api/sales/farmers-performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const farmersResult = await farmersResponse.json();
      
      if (farmersResult.success) {
        setFarmersData(farmersResult.farmers.map((farmer: any) => ({
          farmerId: farmer.farmer_id,
          farmerName: farmer.farmer_name,
          totalRevenue: parseFloat(farmer.total_revenue || 0),
          totalQuantity: parseFloat(farmer.total_quantity || 0),
          transactionCount: parseInt(farmer.total_transactions || 0),
          lastReportDate: farmer.last_report_date,
          averagePrice: parseFloat(farmer.average_price || 0),
          topGrade: farmer.top_grade || 'N/A'
        })));
      }
      
      // Load recent reports
      const reportsResponse = await fetch(`${apiUrl}/api/sales/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const reportsResult = await reportsResponse.json();
      
      if (reportsResult.success) {
        setRecentReports(reportsResult.reports.map((report: any) => ({
          id: report.report_id,
          farmerId: report.farmer_id,
          farmerName: report.farmers?.full_name || 'Unknown Farmer',
          reportMonth: report.report_month,
          totalRevenue: parseFloat(report.total_amount || 0),
          totalQuantity: parseFloat(report.quantity_sold || 0),
          transactionCount: 1, // Each report is now one transaction
          submittedAt: report.submitted_at,
          status: report.status as 'pending' | 'approved' | 'rejected',
          buyerName: report.buyer_company_name
        })));
      }
      
    } catch (error) {
      console.error('Error loading sales data:', error);
      // Set empty data on error
      setAnalytics({
        totalFarmers: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        totalTransactions: 0,
        averageRevenuePerFarmer: 0,
        topPerformingFarmer: 'No data',
        mostPopularGrade: 'No data',
        monthlyGrowth: 0
      });
      setFarmersData([]);
      setRecentReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (reportId: string) => {
    try {
      const token = getAuthToken();
      const userData = getUserData();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      if (!token || !userData) {
        alert('Authentication error. Please log in again.');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/sales/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          reviewed_by: userData.officer_id || userData.user_id
        })
      });

      const result = await response.json();

      if (result.success) {
        setRecentReports(reports => 
          reports.map(report => 
            report.id === reportId 
              ? { ...report, status: 'approved' as const }
              : report
          )
        );
        alert('Report approved successfully!');
        // Reload data to refresh analytics
        loadSalesData();
      } else {
        alert('Failed to approve report: ' + result.message);
      }
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Error approving report. Please try again.');
    }
  };

  const handleRejectReport = async (reportId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      const token = getAuthToken();
      const userData = getUserData();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      if (!token || !userData) {
        alert('Authentication error. Please log in again.');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/sales/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          reviewed_by: userData.officer_id || userData.user_id,
          rejection_reason: reason
        })
      });

      const result = await response.json();

      if (result.success) {
        setRecentReports(reports => 
          reports.map(report => 
            report.id === reportId 
              ? { ...report, status: 'rejected' as const }
              : report
          )
        );
        alert('Report rejected successfully!');
        // Reload data to refresh analytics
        loadSalesData();
      } else {
        alert('Failed to reject report: ' + result.message);
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Error rejecting report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor farmer sales performance and revenue analytics</p>
        </div>

        {/* Overview Stats - Only show verified data */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₱{recentReports.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.totalRevenue || 0), 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold text-yellow-600">{recentReports.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                  <p className="text-2xl font-bold text-blue-600">{new Set(recentReports.map(r => r.farmerId)).size}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{recentReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search farmers, buyers, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sales Reports</h3>
                <p className="text-sm text-gray-500 mt-1">Manage and verify farmer sales transactions</p>
              </div>
              <div className="flex gap-2">
                {selectedReports.length > 0 && (
                  <button className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete ({selectedReports.length})
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReports(filteredReports.map(r => r.id));
                        } else {
                          setSelectedReports([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([...selectedReports, report.id]);
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.farmerName}</div>
                          <div className="text-sm text-gray-500">ID: {report.farmerId?.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.buyerName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.status === 'approved' ? `₱${report.totalRevenue?.toLocaleString()}` : 'Pending verification'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.totalQuantity} kg</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                        {report.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {report.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'approved' ? 'bg-green-100 text-green-800' :
                          report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(report.submittedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingReport(report);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit Report"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveReport(report.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                              title="Approve Report"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectReport(report.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                              title="Reject Report"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-2">No sales reports found</div>
              <div className="text-sm text-gray-400">Farmer sales reports will appear here for management and verification</div>
            </div>
          )}
        </div>
  
  // Filter reports based on search and filters
  const filteredReports = recentReports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const reportDate = new Date(report.submittedAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return reportDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return reportDate >= weekAgo;
        case 'month':
          return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Management</h1>
          <p className="text-gray-600">Monitor, verify, and manage farmer sales transactions</p>
        </div>
                      +{analytics.monthlyGrowth}% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Farmers</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalFarmers}</p>
                    <p className="text-sm text-gray-500 mt-1">Submitted reports</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalQuantity.toLocaleString()} kg</p>
                    <p className="text-sm text-gray-500 mt-1">Abaca fiber sold</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Revenue/Farmer</p>
                    <p className="text-2xl font-bold text-gray-900">₱{analytics.averageRevenuePerFarmer.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Per farmer</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Top Performing Farmer</span>
                    <span className="font-medium text-gray-900">{analytics.topPerformingFarmer}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Most Popular Grade</span>
                    <span className="font-medium text-gray-900">{analytics.mostPopularGrade}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <span className="font-medium text-gray-900">{analytics.totalTransactions}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                <div className="space-y-3">
                  {['T1', 'T2', 'T3', 'T4'].map((grade, index) => {
                    const percentage = [45, 30, 20, 5][index];
                    return (
                      <div key={grade} className="flex items-center">
                        <span className="w-8 text-sm font-medium text-gray-600">{grade}</span>
                        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Farmers Performance Tab */}
        {activeTab === 'farmers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Farmers Performance Ranking</h3>
            </div>
            {farmersData.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-2">No farmer sales data available</div>
                <div className="text-sm text-gray-400">Sales reports will appear here once farmers submit their data</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Report</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {farmersData.map((farmer, index) => (
                      <tr key={farmer.farmerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{farmer.farmerName}</div>
                          <div className="text-sm text-gray-500">ID: {farmer.farmerId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₱{farmer.totalRevenue.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{farmer.totalQuantity} kg</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{farmer.transactionCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₱{farmer.averagePrice.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {farmer.topGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(farmer.lastReportDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Recent Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales Reports</h3>
            </div>
            {recentReports.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-2">No sales reports submitted yet</div>
                <div className="text-sm text-gray-400">Farmer reports will appear here for review and approval</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.farmerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.buyerName || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.reportMonth}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₱{report.totalRevenue.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.totalQuantity} kg</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                            {report.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {report.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === 'approved' ? 'bg-green-100 text-green-800' :
                              report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {report.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApproveReport(report.id)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                  title="Approve Report"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectReport(report.id)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                  title="Reject Report"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </>
                            )}
                            {report.status === 'approved' && (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </span>
                            )}
                            {report.status === 'rejected' && (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
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
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            {/* Verification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{recentReports.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                    <p className="text-2xl font-bold text-yellow-600">{recentReports.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{recentReports.filter(r => r.status === 'approved').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{recentReports.filter(r => r.status === 'rejected').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search farmers, buyers, locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Verification Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentReports
                      .filter(report => {
                        const matchesSearch = !searchTerm || 
                          report.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{report.farmerName}</div>
                            <div className="text-sm text-gray-500">{new Date(report.submittedAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.buyerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₱{report.totalRevenue.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.totalQuantity} kg</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                              {report.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {report.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                report.status === 'approved' ? 'bg-green-100 text-green-800' :
                                report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {report.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveReport(report.id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                    title="Approve Report"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleRejectReport(report.id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                    title="Reject Report"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {recentReports.filter(report => {
                const matchesSearch = !searchTerm || 
                  report.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  report.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
                return matchesSearch && matchesStatus;
              }).length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-gray-500 mb-2">No transactions found</div>
                  <div className="text-sm text-gray-400">Farmer sales reports will appear here for verification</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalyticsDashboard;
