import React, { useState } from 'react';
import { Package, FileText, Send } from 'lucide-react';
import { getUserData } from '../../utils/authToken';

interface SalesReportFormProps {
  onSubmit: (report: any) => void;
  onCancel: () => void;
}

export const SalesReportForm: React.FC<SalesReportFormProps> = ({ onSubmit, onCancel }) => {
  const [reportData, setReportData] = useState({
    reportPeriod: '',
    reportMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    
    // Basic Transaction Info
    dateOfSale: new Date().toISOString().slice(0, 10),
    buyerCompanyName: '',
    
    // Product Details
    abacaType: 'Tuxy',
    quantitySold: 0,
    unitPrice: 0,
    totalAmount: 0,
    
    // Payment Details
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    
    // Logistics / Delivery
    deliveryLocation: '',
    shippingFee: 0,
    
    // Remarks / Notes
    qualityNotes: '',
    otherComments: ''
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.quantitySold || !reportData.unitPrice) {
      alert('Please enter quantity sold and unit price');
      return;
    }

    try {
      // Get the actual farmer ID from authenticated user data
      const userData = getUserData();
      console.log('🔍 Form submission - User data:', userData);
      console.log('🔍 Form - User data keys:', userData ? Object.keys(userData) : 'No user data');
      
      // Check multiple possible farmer ID fields
      const farmerId = userData?.farmer_id || userData?.id || userData?.user_id || userData?.farmerId;
      
      // Log all possible ID fields for debugging
      console.log('🔍 Form - Checking ID fields:', {
        farmer_id: userData?.farmer_id,
        id: userData?.id,
        user_id: userData?.user_id,
        farmerId: userData?.farmerId,
        finalFarmerId: farmerId,
        allUserData: userData
      });
      
      if (!userData || !farmerId) {
        console.error('❌ Authentication error - User data:', userData);
        console.error('❌ Available fields:', userData ? Object.keys(userData) : 'No user data');
        alert('Authentication error: Please log in again');
        return;
      }
      
      console.log('✅ Form using farmer ID:', farmerId);
      
      // Validate required fields
      if (!reportData.abacaType || reportData.abacaType.trim() === '') {
        alert('Please select an abaca type');
        return;
      }
      
      if (!reportData.buyerCompanyName || reportData.buyerCompanyName.trim() === '') {
        alert('Please enter buyer company name');
        return;
      }
      
      // Ensure abacaType is one of the valid values
      const validAbacaTypes = ['Tuxy', 'Superior', 'Medium', 'Low Grade'];
      const abacaType = validAbacaTypes.includes(reportData.abacaType) ? reportData.abacaType : 'Tuxy';
      
      // Prepare comprehensive transaction data for the new API format
      const reportPayload = {
        farmer_id: farmerId, // Use actual farmer ID from authentication
        report_month: reportData.reportMonth,
        transactionDetails: {
          // 1. Basic Transaction Info
          dateOfSale: reportData.dateOfSale,
          buyerCompanyName: reportData.buyerCompanyName.trim(),
          // 2. Product Details
          abacaType: abacaType, // Use validated abaca type
          quantitySold: reportData.quantitySold,
          unitPrice: reportData.unitPrice,
          totalAmount: reportData.totalAmount,
          // 3. Payment Details
          paymentMethod: reportData.paymentMethod || 'cash',
          paymentStatus: reportData.paymentStatus || 'paid',
          // 4. Logistics / Delivery
          deliveryLocation: reportData.deliveryLocation || '',
          shippingFee: reportData.shippingFee || 0,
          // 5. Remarks / Notes
          qualityNotes: reportData.qualityNotes || '',
          otherComments: reportData.otherComments || ''
        }
      };
      
      // Log the payload for debugging
      console.log('📦 Report payload:', reportPayload);
      console.log('📦 Abaca type being sent:', abacaType);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/submit-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header
        },
        body: JSON.stringify(reportPayload)
      });

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
        alert('Sales report submitted successfully to MAO!');
        onSubmit(reportPayload); // This will redirect back to dashboard
      } else {
        alert('Failed to submit report: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Monthly Sales Report</h2>
        <p className="text-sm text-gray-600">Submit your abaca fiber sales data to MAO</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Period */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Report Month *
              </label>
              <input
                type="month"
                value={reportData.reportMonth}
                onChange={(e) => setReportData({ ...reportData, reportMonth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* 1. Basic Transaction Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Transaction Info</h3>
              <p className="text-xs text-gray-600">Basic transaction details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Date of Sale</label>
              <input
                type="date"
                value={reportData.dateOfSale}
                onChange={(e) => setReportData({ ...reportData, dateOfSale: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Buyer / Company</label>
              <input
                type="text"
                value={reportData.buyerCompanyName}
                onChange={(e) => setReportData({ ...reportData, buyerCompanyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Buyer name or company"
              />
            </div>
          </div>
        </div>

        {/* 2. Product Details */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Product Details</h3>
              <p className="text-xs text-gray-600">Abaca type, quantity, and pricing</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Abaca Type/Grade</label>
              <input
                type="text"
                value={reportData.abacaType}
                onChange={(e) => setReportData({ ...reportData, abacaType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g., Tuxy, Superior, Medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Quantity (kg)</label>
              <input
                type="number"
                step="0.1"
                value={reportData.quantitySold || ''}
                onChange={(e) => {
                  const quantity = parseFloat(e.target.value) || 0;
                  setReportData({ ...reportData, quantitySold: quantity });
                  if (quantity && reportData.unitPrice) {
                    setReportData(prev => ({ ...prev, quantitySold: quantity, totalAmount: quantity * prev.unitPrice }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Unit Price (₱)</label>
              <input
                type="number"
                step="0.01"
                value={reportData.unitPrice || ''}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  setReportData({ ...reportData, unitPrice: price });
                  if (price && reportData.quantitySold) {
                    setReportData(prev => ({ ...prev, unitPrice: price, totalAmount: prev.quantitySold * price }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Total Amount (₱)</label>
              <input
                type="number"
                step="0.01"
                value={reportData.totalAmount || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-semibold text-green-600"
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        </div>



        {/* 3. Payment & Logistics */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mr-2">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Payment & Logistics</h3>
              <p className="text-xs text-gray-600">Payment and delivery details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Payment Method</label>
              <select
                value={reportData.paymentMethod}
                onChange={(e) => setReportData({ ...reportData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Payment Status</label>
              <select
                value={reportData.paymentStatus}
                onChange={(e) => setReportData({ ...reportData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Delivery Location</label>
              <input
                type="text"
                value={reportData.deliveryLocation}
                onChange={(e) => setReportData({ ...reportData, deliveryLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                placeholder="Delivery address"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Transportation Cost (₱)</label>
              <input
                type="number"
                step="0.01"
                value={reportData.shippingFee || ''}
                onChange={(e) => setReportData({ ...reportData, shippingFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* 4. Additional Notes */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-2">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Additional Notes</h3>
              <p className="text-xs text-gray-600">Quality notes and comments</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Quality Notes</label>
              <textarea
                value={reportData.qualityNotes}
                onChange={(e) => setReportData({ ...reportData, qualityNotes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                rows={2}
                placeholder="Quality observations, grade details, etc."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Other Comments</label>
              <textarea
                value={reportData.otherComments}
                onChange={(e) => setReportData({ ...reportData, otherComments: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                rows={2}
                placeholder="Additional comments or remarks"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesReportForm;
