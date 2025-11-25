import React, { useState, useEffect } from 'react';
import {
  Truck, Package, CheckCircle, XCircle, AlertCircle, Calendar, MapPin, User,
  Phone, DollarSign, Filter, Download, Search, Eye, Clock, Award, Leaf
} from 'lucide-react';

interface Delivery {
  delivery_id: string;
  farmer_id: string;
  buyer_id: string;
  delivery_date: string;
  delivery_time: string;
  variety: string;
  quantity_kg: number;
  grade: string;
  price_per_kg: number;
  total_amount: number;
  pickup_location: string;
  delivery_location: string;
  delivery_method: string;
  farmer_contact: string;
  buyer_contact: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  status: string;
  created_at: string;
  buyers?: {
    business_name: string;
    contact_number: string;
    business_address: string;
  };
  farmers?: {
    full_name: string;
    contact_number: string;
    municipality: string;
    barangay: string;
  };
}

const DeliveryTrackingMonitor: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`http://localhost:3001/api/fiber-deliveries/all${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'In Transit': <Truck className="text-purple-500" size={20} />,
      'Delivered': <Package className="text-green-500" size={20} />,
      'Completed': <CheckCircle className="text-emerald-500" size={20} />,
      'Cancelled': <XCircle className="text-red-500" size={20} />
    };
    return icons[status] || <AlertCircle className="text-gray-500" size={20} />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'In Transit': 'bg-purple-100 text-purple-800 border-purple-300',
      'Delivered': 'bg-green-100 text-green-800 border-green-300',
      'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'Cancelled': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Partial': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'Unpaid': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusProgress = (status: string) => {
    const progress: { [key: string]: number } = {
      'In Transit': 33, 'Delivered': 66, 'Completed': 100, 'Cancelled': 0
    };
    return progress[status] || 0;
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const farmerName = delivery.farmers 
      ? delivery.farmers.full_name.toLowerCase()
      : '';
    const matchesSearch = 
      delivery.buyers?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.delivery_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerName.includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: deliveries.length,
    in_transit: deliveries.filter(d => d.status === 'In Transit').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
    completed: deliveries.filter(d => d.status === 'Completed').length,
    cancelled: deliveries.filter(d => d.status === 'Cancelled').length,
    total_fiber_kg: deliveries.reduce((sum, d) => sum + parseFloat(d.quantity_kg.toString()), 0),
    total_value: deliveries.filter(d => d.status === 'Completed').reduce((sum, d) => sum + parseFloat(d.total_amount.toString()), 0)
  };

  // Calculate monthly fiber delivered
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyFiberData = Array.from({ length: 12 }, (_, i) => {
    const monthDeliveries = deliveries.filter(d => {
      const deliveryDate = new Date(d.delivery_date);
      return deliveryDate.getMonth() === i && deliveryDate.getFullYear() === currentYear;
    });
    return monthDeliveries.reduce((sum, d) => sum + parseFloat(d.quantity_kg.toString()), 0);
  });

  const thisMonthFiber = monthlyFiberData[currentMonth];
  
  // Calculate yearly fiber delivered
  const yearlyFiberData = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 4 + i;
    const yearDeliveries = deliveries.filter(d => {
      const deliveryDate = new Date(d.delivery_date);
      return deliveryDate.getFullYear() === year;
    });
    return {
      year,
      fiber: yearDeliveries.reduce((sum, d) => sum + parseFloat(d.quantity_kg.toString()), 0)
    };
  });

  const thisYearFiber = yearlyFiberData.find(y => y.year === currentYear)?.fiber || 0;

  // Pie chart data (excluding pending, only active statuses)
  const pieChartData = [
    { label: 'In Transit', value: stats.in_transit, color: '#a855f7' },
    { label: 'Delivered', value: stats.delivered, color: '#22c55e' },
    { label: 'Completed', value: stats.completed, color: '#10b981' },
    { label: 'Cancelled', value: stats.cancelled, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const totalForPie = pieChartData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate pie chart segments
  let currentAngle = -90; // Start from top
  const pieSegments = pieChartData.map(item => {
    const percentage = (item.value / totalForPie) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const downloadCSV = () => {
    const headers = ['Delivery ID', 'Farmer', 'Buyer', 'Variety', 'Quantity (kg)', 'Grade', 'Status', 'Delivery Date', 'Location', 'Payment Status'];
    const rows = filteredDeliveries.map(d => [
      d.delivery_id,
      d.farmers?.full_name || 'N/A',
      d.buyers?.business_name || 'N/A',
      d.variety,
      d.quantity_kg,
      d.grade,
      d.status,
      new Date(d.delivery_date).toLocaleDateString(),
      d.delivery_location,
      d.payment_status
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-tracking-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Deliveries Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Truck className="text-white" size={24} />
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Total Deliveries</p>
          <p className="text-4xl font-bold text-white mb-2">{stats.total}</p>
          <p className="text-white/70 text-xs">All time deliveries</p>
        </div>

        {/* In Transit Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Package className="text-white" size={24} />
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">In Transit</p>
          <p className="text-4xl font-bold text-white mb-2">{stats.in_transit}</p>
          <p className="text-white/70 text-xs">Currently shipping</p>
        </div>

        {/* Delivered Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Delivered</p>
          <p className="text-4xl font-bold text-white mb-2">{stats.delivered}</p>
          <p className="text-white/70 text-xs">Successfully delivered</p>
        </div>

        {/* Total Fiber Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Leaf className="text-white" size={24} />
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Total Fiber</p>
          <p className="text-4xl font-bold text-white mb-2">{stats.total_fiber_kg.toFixed(1)}</p>
          <p className="text-white/70 text-xs">Kilograms delivered</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {['all', 'In Transit', 'Delivered', 'Completed', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Deliveries' : status}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search farmer, buyer, variety, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button onClick={downloadCSV} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.map(delivery => (
          <div key={delivery.delivery_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">{getStatusIcon(delivery.status)}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{delivery.buyers?.business_name || 'Buyer'}</h3>
                    <p className="text-sm text-gray-600">{delivery.variety} - {delivery.grade}</p>
                    {delivery.farmers && (
                      <p className="text-sm text-emerald-600 font-medium mt-1">
                        👨‍🌾 Farmer: {delivery.farmers.full_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {delivery.delivery_id}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>{delivery.status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(delivery.payment_status)}`}>{delivery.payment_status}</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
                  <span className="text-sm font-bold text-emerald-600">{getStatusProgress(delivery.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${getStatusProgress(delivery.status)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-gray-400" size={16} />
                  <div>
                    <p className="text-gray-500 text-xs">Delivery Date</p>
                    <p className="text-gray-700 font-medium">{new Date(delivery.delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Leaf className="text-gray-400" size={16} />
                  <div>
                    <p className="text-gray-500 text-xs">Variety</p>
                    <p className="text-gray-700 font-medium">{delivery.variety}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="text-gray-400" size={16} />
                  <div>
                    <p className="text-gray-500 text-xs">Fiber (kg)</p>
                    <p className="text-gray-700 font-medium">{delivery.quantity_kg} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="text-gray-400" size={16} />
                  <div>
                    <p className="text-gray-500 text-xs">Grade</p>
                    <p className="text-gray-700 font-medium">{delivery.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-gray-400" size={16} />
                  <div>
                    <p className="text-gray-500 text-xs">Method</p>
                    <p className="text-gray-700 font-medium">{delivery.delivery_method}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{delivery.delivery_location}</span>
                  </div>
                  {delivery.total_amount > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} />
                      <span className="font-semibold">₱{delivery.total_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => { setSelectedDelivery(delivery); setShowDetailsModal(true); }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No deliveries found</p>
          <p className="text-sm text-gray-500">{searchQuery ? 'Try adjusting your search criteria' : 'Deliveries will appear here once created'}</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDelivery.status)}`}>{selectedDelivery.status}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedDelivery.payment_status)}`}>{selectedDelivery.payment_status}</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="text-blue-500" size={20} />
                    Buyer Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Business Name</p>
                      <p className="font-semibold">{selectedDelivery.buyers?.business_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-semibold">{selectedDelivery.buyer_contact}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="text-green-500" size={20} />
                    Farmer Information
                  </h3>
                  <div className="space-y-2">
                    {selectedDelivery.farmers && (
                      <div>
                        <p className="text-sm text-gray-600">Farmer Name</p>
                        <p className="font-semibold text-lg text-emerald-600">
                          {selectedDelivery.farmers.full_name}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-semibold">{selectedDelivery.farmer_contact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup Location</p>
                      <p className="font-semibold">{selectedDelivery.pickup_location}</p>
                    </div>
                    {selectedDelivery.farmers && (
                      <div>
                        <p className="text-sm text-gray-600">Farmer Address</p>
                        <p className="font-semibold">{selectedDelivery.farmers.barangay}, {selectedDelivery.farmers.municipality}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Leaf className="text-emerald-500" size={20} />
                  Fiber Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Variety</p>
                    <p className="font-semibold">{selectedDelivery.variety}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity (kg)</p>
                    <p className="font-semibold">{selectedDelivery.quantity_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-semibold">{selectedDelivery.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price/kg</p>
                    <p className="font-semibold">₱{selectedDelivery.price_per_kg}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="text-purple-500" size={20} />
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Delivery Date</p>
                      <p className="font-semibold">{new Date(selectedDelivery.delivery_date).toLocaleDateString()} {selectedDelivery.delivery_time && `at ${selectedDelivery.delivery_time}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Method</p>
                      <p className="font-semibold">{selectedDelivery.delivery_method}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Location</p>
                    <p className="font-semibold">{selectedDelivery.delivery_location}</p>
                  </div>
                </div>
              </div>
              {selectedDelivery.total_amount > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="text-indigo-500" size={20} />
                    Payment Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-lg text-indigo-600">₱{selectedDelivery.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold">{selectedDelivery.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedDelivery.payment_status)}`}>{selectedDelivery.payment_status}</span>
                    </div>
                  </div>
                </div>
              )}
              {selectedDelivery.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedDelivery.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTrackingMonitor;
