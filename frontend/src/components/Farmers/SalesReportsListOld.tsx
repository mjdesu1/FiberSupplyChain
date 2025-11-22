import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Package, Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">My Sales Reports</h2>
          <p className="text-gray-600">View your submitted monthly sales reports and their status</p>
        </div>
        {onAddNewReport && (
          <button
            onClick={onAddNewReport}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Report</span>
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Reports Yet</h3>
          <p className="text-gray-500">You haven't submitted any sales reports. Click "Add New Report" to submit your first report.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.report_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {new Date(report.report_month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })} Sales Report
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(report.submitted_at).toLocaleDateString()}
                    </p>
                    {report.buyer_name && (
                      <p className="text-sm text-blue-600 font-medium">
                        Buyer: {report.buyer_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                    <span className="mr-1">{getStatusIcon(report.status)}</span>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800 mt-1">
                    ₱{report.total_revenue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Quantity</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">
                    {report.total_quantity} kg
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Avg Price/kg</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800 mt-1">
                    ₱{(report.total_revenue / report.total_quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              {report.status === 'rejected' && report.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Report Rejected</h4>
                      <p className="text-sm text-red-700 mt-1">{report.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {report.status === 'approved' && report.reviewed_at && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 text-green-600">✅</div>
                    <span className="text-sm text-green-700">
                      Approved on {new Date(report.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesReportsList;
