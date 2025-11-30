import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Package, Plus, Search, Edit, Trash2, Eye, X, Banknote, TrendingUp, CheckCircle, Clock, Users } from 'lucide-react';
import SalesReportForm from './SalesReportForm';
import { getUserData } from '../../utils/authToken';

interface SalesReport {
  report_id: string;
  report_month: string;
  abaca_type: string;
  quantity_sold: number;
  unit_price: number;
  total_amount: number;
  buyer_company_name: string;
  payment_status: string;
  status: string;
  submitted_at: string;
  sale_date: string;
  delivery_location: string;
  shipping_fee: number;
  quality_notes: string;
  other_comments: string;
}

interface SalesReportsListProps {
  onAddNewReport?: () => void;
}

export const SalesReportsList: React.FC<SalesReportsListProps> = ({ onAddNewReport }) => {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SalesReport | null>(null);
  const [viewMode, setViewMode] = useState<'add' | 'edit' | 'view' | null>(null);

  useEffect(() => {
    const loadFarmerReports = async () => {
      try {
        setLoading(true);
        
        // Get the actual farmer ID from authenticated user data
        const userData = getUserData();
        if (!userData || !userData.farmer_id) {
          console.error('No authenticated farmer found');
          setReports([]);
          return;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/farmer-reports/${userData.farmer_id}`);
        
        // Check if response is ok first
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON response');
        }

        const result = await response.json();
        
        if (result.success) {
          setReports(result.reports);
        }
      } catch (error) {
        console.error('Error loading farmer reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFarmerReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      default:
        return '⏳';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Reports</h1>
        <p className="text-gray-600">Welcome back, {getUserData()?.full_name || 'Farmer'}!</p>
      </div>

      {/* Stats Cards - Matching Sales Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue Card - Green */}
        <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Banknote className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">TOTAL REVENUE</p>
            <p className="text-3xl font-bold text-white">
              ₱{reports.reduce((sum, report) => sum + (report.total_amount || 0), 0).toLocaleString()}
            </p>
            <p className="text-white/70 text-xs mt-2">
              From {reports.length} report{reports.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Total Sold Card - Blue */}
        <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">TOTAL SOLD</p>
            <p className="text-3xl font-bold text-white">
              {reports.reduce((sum, report) => sum + (report.quantity_sold || 0), 0).toLocaleString()}kg
            </p>
            <p className="text-white/70 text-xs mt-2">Abaca fiber sold</p>
          </div>
        </div>

        {/* Transport Cost Card - Orange */}
        <div className="group relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium mb-1">TRANSPORT COST</p>
            <p className="text-3xl font-bold text-white">
              ₱{reports.reduce((sum, report) => sum + (report.shipping_fee || 0), 0).toLocaleString()}
            </p>
            <p className="text-white/70 text-xs mt-2">Total expenses</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-green-200 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">
                {reports.filter(r => r.status === 'approved').length}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Approved Reports</p>
              <p className="text-xs text-gray-500">Ready for payment</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-yellow-200 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-yellow-600 font-bold text-lg">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pending Review</p>
              <p className="text-xs text-gray-500">Awaiting approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-blue-200 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {new Set(reports.map(r => r.buyer_company_name)).size}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Active Buyers</p>
              <p className="text-xs text-gray-500">Companies purchasing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Button Section */}
      <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-200 rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder:text-gray-500 text-gray-800 font-medium shadow-md"
              />
            </div>
          </div>
          
          {/* Add Button */}
          {onAddNewReport && (
            <button
              onClick={onAddNewReport}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold border-2 border-green-400"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Sales Report
            </button>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-200 rounded-3xl p-12 text-center shadow-lg">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
            <FileText className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No sales reports found</h3>
          <p className="text-gray-600">Start tracking your sales by creating your first report.</p>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-100 via-emerald-100 to-purple-100 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="col-span-2">Report Period</div>
              <div className="col-span-2">Product Details</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Buyer</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {reports.map((report, index) => (
              <div 
                key={report.report_id} 
                className={`px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Report Period */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{report.report_month}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sale: {new Date(report.sale_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-900">{report.abaca_type}</span>
                    </div>
                    <div className="text-sm text-gray-600">{report.quantity_sold}kg @ ₱{report.unit_price}/kg</div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-green-600 text-lg">₱{report.total_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Transport: ₱{report.shipping_fee || 0}
                    </div>
                  </div>

                  {/* Buyer */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900 truncate">{report.buyer_company_name}</div>
                    <div className="text-sm text-gray-500 truncate">{report.delivery_location || 'No location'}</div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                      {report.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {report.status === 'rejected' && <X className="w-4 h-4 text-red-500" />}
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-md ${
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Submitted Date */}
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(report.submitted_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(report.submitted_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 hover:shadow-md transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 hover:shadow-md transition-all duration-200"
                        title="Edit Report"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 hover:shadow-md transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReportsList;
