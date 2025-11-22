import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  XCircle,
  AlertCircle,
  Leaf,
  Award
} from 'lucide-react';

interface Delivery {
  delivery_id: string;
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
  status: string;
  payment_status: string;
  payment_method: string;
  notes: string;
  created_at: string;
  buyers?: {
    business_name: string;
    contact_number: string;
  };
}

const FarmerDeliveryTracking: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`http://localhost:3001/api/fiber-deliveries/farmer/my-deliveries${statusParam}`, {
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
      'Confirmed': <CheckCircle className="text-blue-500" size={24} />,
      'In Transit': <Truck className="text-purple-500" size={24} />,
      'Delivered': <Package className="text-green-500" size={24} />,
      'Completed': <CheckCircle className="text-emerald-500" size={24} />,
      'Cancelled': <XCircle className="text-red-500" size={24} />
    };
    return icons[status] || <AlertCircle className="text-gray-500" size={24} />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-300',
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
      'Confirmed': 25,
      'In Transit': 50,
      'Delivered': 75,
      'Completed': 100,
      'Cancelled': 0
    };
    return progress[status] || 0;
  };

  const stats = {
    total: deliveries.length,
    in_transit: deliveries.filter(d => d.status === 'In Transit').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
    completed: deliveries.filter(d => d.status === 'Completed').length,
    total_fiber_kg: deliveries.reduce((sum, d) => sum + parseFloat(d.quantity_kg.toString()), 0)
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track My Fiber Deliveries</h1>
        <p className="text-gray-600">Monitor your fiber delivery status in real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">In Transit</p>
          <p className="text-2xl font-bold text-gray-900">{stats.in_transit}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <p className="text-sm text-gray-600 mb-1">Total Fiber (kg)</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.total_fiber_kg.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'In Transit', 'Delivered', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List - Shopee-style tracking */}
      <div className="space-y-4">
        {deliveries.map(delivery => (
          <div key={delivery.delivery_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            {/* Delivery Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    {getStatusIcon(delivery.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{delivery.buyers?.business_name || 'Buyer'}</h3>
                    <p className="text-sm text-gray-600">{delivery.variety} - {delivery.grade}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar - Shopee Style */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
                  <span className="text-sm font-bold text-emerald-600">{getStatusProgress(delivery.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getStatusProgress(delivery.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="flex justify-between items-center text-xs text-gray-600 mb-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    getStatusProgress(delivery.status) >= 25 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <CheckCircle size={16} />
                  </div>
                  <span>Confirmed</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className={`h-full ${getStatusProgress(delivery.status) >= 50 ? 'bg-emerald-500' : ''}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    getStatusProgress(delivery.status) >= 50 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Truck size={16} />
                  </div>
                  <span>In Transit</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className={`h-full ${getStatusProgress(delivery.status) >= 75 ? 'bg-emerald-500' : ''}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    getStatusProgress(delivery.status) >= 75 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Package size={16} />
                  </div>
                  <span>Delivered</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className={`h-full ${getStatusProgress(delivery.status) >= 100 ? 'bg-emerald-500' : ''}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    getStatusProgress(delivery.status) >= 100 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <CheckCircle size={16} />
                  </div>
                  <span>Completed</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{delivery.delivery_method}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDelivery(delivery);
                    setShowDetailsModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No deliveries found</p>
          <p className="text-sm text-gray-500">Your fiber deliveries will appear here once CUSAFA creates them from your inventory</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Delivery Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDelivery.status)}`}>
                  {selectedDelivery.status}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3">Fiber Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Variety</p>
                    <p className="font-semibold">{selectedDelivery.variety}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fiber (kg)</p>
                    <p className="font-semibold">{selectedDelivery.quantity_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-semibold">{selectedDelivery.grade}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3">Delivery Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Delivery Date & Time</p>
                    <p className="font-semibold">
                      {new Date(selectedDelivery.delivery_date).toLocaleDateString()} 
                      {selectedDelivery.delivery_time && ` at ${selectedDelivery.delivery_time}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Method</p>
                    <p className="font-semibold">{selectedDelivery.delivery_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-semibold">{selectedDelivery.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Location</p>
                    <p className="font-semibold">{selectedDelivery.delivery_location}</p>
                  </div>
                </div>
              </div>


              {selectedDelivery.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700">{selectedDelivery.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDeliveryTracking;
