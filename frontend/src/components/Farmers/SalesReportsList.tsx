import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Banknote, Package, Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
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
    loadFarmerReports();
  }, []);

  const loadFarmerReports = async () => {
    try {
      setLoading(true);
      
      // Get the actual farmer ID from authenticated user data
      const userData = getUserData();
      console.log('🔍 User data from localStorage:', userData);
      console.log('🔍 User data keys:', userData ? Object.keys(userData) : 'No user data');
      
      // Check multiple possible farmer ID fields
      const farmerId = userData?.farmer_id || userData?.id || userData?.user_id || userData?.farmerId;
      
      // Log all possible ID fields for debugging
      console.log('🔍 Checking ID fields:', {
        farmer_id: userData?.farmer_id,
        id: userData?.id,
        user_id: userData?.user_id,
        farmerId: userData?.farmerId,
        finalFarmerId: farmerId,
        allUserData: userData
      });
      
      if (!userData || !farmerId) {
        console.error('❌ No authenticated farmer found. User data:', userData);
        console.error('❌ Available fields:', userData ? Object.keys(userData) : 'No user data');
        setReports([]);
        return;
      }
      
      console.log('✅ Using farmer ID:', farmerId);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/sales/farmer-reports/${farmerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON response');
      }

      const result = await response.json();
      
      if (result.success) {
        setReports(result.reports || []);
      }
    } catch (error) {
      console.error('❌ Error loading farmer reports:', error);
      console.error('❌ Error details:', {
        message: error.message,
        userData: getUserData(),
        apiUrl: import.meta.env.VITE_API_URL
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.buyer_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.abaca_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setSelectedReport(null);
    setViewMode('add');
    setShowForm(true);
  };

  const handleEdit = (report: SalesReport) => {
    setSelectedReport(report);
    setViewMode('edit');
    setShowForm(true);
  };

  const handleView = (report: SalesReport) => {
    setSelectedReport(report);
    setViewMode('view');
    setShowForm(true);
  };

  const handleDelete = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      // TODO: Implement delete API call
      console.log('Delete report:', reportId);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedReport(null);
    setViewMode(null);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    closeForm();
    loadFarmerReports(); // Reload data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
              <p className="text-gray-600">Manage your monthly sales submissions</p>
            </div>
            
            {/* Search and Add Button */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                />
              </div>
              <button
                onClick={handleAddNew}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Sales Report
              </button>
            </div>
          </div>
        </div>

        {/* Sales Summary Dashboard */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  TOTAL REVENUE
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-green-800">
                  ₱{filteredReports.reduce((sum, report) => sum + (report.total_amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  From {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Total Quantity Sold */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  TOTAL SOLD
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-blue-800">
                  {filteredReports.reduce((sum, report) => sum + (report.quantity_sold || 0), 0).toLocaleString()}kg
                </p>
                <p className="text-sm text-blue-600">
                  Abaca fiber sold
                </p>
              </div>
            </div>

            {/* Transportation Costs */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  TRANSPORT COST
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-orange-800">
                  ₱{filteredReports.reduce((sum, report) => sum + (report.shipping_fee || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-orange-600">
                  Total expenses
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">
                    {filteredReports.filter(r => r.status === 'approved').length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Approved Reports</p>
                  <p className="text-xs text-gray-500">Ready for payment</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">
                    {filteredReports.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Review</p>
                  <p className="text-xs text-gray-500">Awaiting approval</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {new Set(filteredReports.map(r => r.buyer_company_name)).size}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Active Buyers</p>
                  <p className="text-xs text-gray-500">Companies purchasing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Table Design */}
        <div className="p-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No sales reports found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm ? 'No reports match your search criteria. Try adjusting your search terms.' : 'Start tracking your sales by creating your first report.'}
              </p>
              <button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Create Your First Report
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                {filteredReports.map((report, index) => (
                  <div 
                    key={report.report_id} 
                    className={`px-6 py-5 hover:bg-gray-50 transition-colors duration-150 ${
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          report.status === 'approved' ? 'bg-green-100 text-green-800' :
                          report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                        </span>
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
                            onClick={() => handleView(report)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(report)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
                            title="Edit Report"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.report_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete Report"
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
      </div>

      {/* Floating Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {viewMode === 'add' ? 'Add New Sales Report' :
                 viewMode === 'edit' ? 'Edit Sales Report' :
                 'View Sales Report'}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              {viewMode === 'view' ? (
                <div className="space-y-6">
                  {/* Report Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Report Period</h3>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">{selectedReport?.report_month}</p>
                      <p className="text-sm text-blue-600">Sale Date: {selectedReport?.sale_date ? new Date(selectedReport.sale_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Product</h3>
                      </div>
                      <p className="text-xl font-bold text-green-800">{selectedReport?.abaca_type}</p>
                      <p className="text-sm text-green-600">{selectedReport?.quantity_sold}kg @ ₱{selectedReport?.unit_price}/kg</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-900">Total Amount</h3>
                      </div>
                      <p className="text-2xl font-bold text-yellow-800">₱{selectedReport?.total_amount?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-yellow-600">Transport: ₱{selectedReport?.shipping_fee || 0}</p>
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transaction Details */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Buyer/Company</label>
                          <p className="text-gray-900 font-medium">{selectedReport?.buyer_company_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Method</label>
                          <p className="text-gray-900">{selectedReport?.payment_method || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Status</label>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            selectedReport?.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            selectedReport?.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedReport?.payment_status?.charAt(0).toUpperCase() + selectedReport?.payment_status?.slice(1) || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Delivery Location</label>
                          <p className="text-gray-900">{selectedReport?.delivery_location || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Notes */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Notes</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Report Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              selectedReport?.status === 'approved' ? 'bg-green-100 text-green-800' :
                              selectedReport?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedReport?.status?.charAt(0).toUpperCase() + selectedReport?.status?.slice(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Quality Notes</label>
                          <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                            {selectedReport?.quality_notes || 'No quality notes provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Other Comments</label>
                          <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                            {selectedReport?.other_comments || 'No additional comments'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Submitted</label>
                          <p className="text-gray-900 text-sm">
                            {selectedReport?.submitted_at ? new Date(selectedReport.submitted_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={closeForm}
                      className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('edit');
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Report
                    </button>
                  </div>
                </div>
              ) : (
                <SalesReportForm
                  onSubmit={handleFormSubmit}
                  onCancel={closeForm}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesReportsList;
