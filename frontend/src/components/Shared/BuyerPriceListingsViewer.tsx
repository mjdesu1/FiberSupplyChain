import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Phone, 
  MapPin, 
  FileText, 
  Calendar,
  Building,
  Mail,
  Filter,
  Search,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity,
  Award,
  Image as ImageIcon
} from 'lucide-react';

interface BuyerListing {
  listing_id: string;
  buyer_id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  location: string;
  municipality: string;
  barangay: string;
  class_a_enabled: boolean;
  class_a_price: number | null;
  class_a_image: string | null;
  class_b_enabled: boolean;
  class_b_price: number | null;
  class_b_image: string | null;
  class_c_enabled: boolean;
  class_c_price: number | null;
  class_c_image: string | null;
  payment_terms: string;
  requirements: string | null;
  availability: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

interface BuyerPriceListingsViewerProps {
  userRole: 'association' | 'cusafa' | 'farmer' | 'mao';
}

const BuyerPriceListingsViewer: React.FC<BuyerPriceListingsViewerProps> = () => {
  const [listings, setListings] = useState<BuyerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMunicipality, setFilterMunicipality] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [selectedPriceType, setSelectedPriceType] = useState<{[key: string]: 'class_a' | 'class_b' | 'class_c'}>({});

  useEffect(() => {
    fetchListings();
  }, [filterType, filterMunicipality, filterAvailability]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterMunicipality !== 'all') params.append('municipality', filterMunicipality);
      if (filterAvailability !== 'all') params.append('availability', filterAvailability);

      const response = await fetch(`http://localhost:3001/api/buyer-listings/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📋 Buyer Listings Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Buyer Listings Data:', data);
        console.log('📋 Number of listings:', data.listings?.length || 0);
        setListings(data.listings || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch listings:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
            <CheckCircle size={14} />
            Available
          </span>
        );
      case 'Limited':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
            <Clock size={14} />
            Limited
          </span>
        );
      case 'Not Buying':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            <XCircle size={14} />
            Not Buying
          </span>
        );
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Company Name',
      'Contact Person',
      'Phone',
      'Email',
      'Municipality',
      'Barangay',
      'Class A Price',
      'Class B Price',
      'Class C Price',
      'Payment Terms',
      'Availability',
      'Valid Until'
    ];

    const rows = filteredListings.map(listing => [
      listing.company_name,
      listing.contact_person,
      listing.phone,
      listing.email,
      listing.municipality,
      listing.barangay,
      listing.class_a_enabled ? `₱${listing.class_a_price}` : 'N/A',
      listing.class_b_enabled ? `₱${listing.class_b_price}` : 'N/A',
      listing.class_c_enabled ? `₱${listing.class_c_price}` : 'N/A',
      listing.payment_terms,
      listing.availability,
      new Date(listing.valid_until).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyer-price-listings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.barangay.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const municipalities = Array.from(new Set(listings.map(l => l.municipality))).sort();

  const stats = {
    total: filteredListings.length,
    available: filteredListings.filter(l => l.availability === 'Available').length,
    avgClassAPrice: filteredListings.filter(l => l.class_a_enabled).reduce((sum, l) => sum + (l.class_a_price || 0), 0) / 
                filteredListings.filter(l => l.class_a_enabled).length || 0,
    avgClassBPrice: filteredListings.filter(l => l.class_b_enabled).reduce((sum, l) => sum + (l.class_b_price || 0), 0) / 
                filteredListings.filter(l => l.class_b_enabled).length || 0,
    avgClassCPrice: filteredListings.filter(l => l.class_c_enabled).reduce((sum, l) => sum + (l.class_c_price || 0), 0) / 
                filteredListings.filter(l => l.class_c_enabled).length || 0,
  };

  // Handle price type navigation
  const handlePriceNavigation = (listingId: string, direction: 'next' | 'prev') => {
    const current = selectedPriceType[listingId] || 'class_a';
    const types: ('class_a' | 'class_b' | 'class_c')[] = ['class_a', 'class_b', 'class_c'];
    const currentIndex = types.indexOf(current);
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % types.length;
    } else {
      newIndex = (currentIndex - 1 + types.length) % types.length;
    }
    
    setSelectedPriceType(prev => ({
      ...prev,
      [listingId]: types[newIndex]
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <BarChart3 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Price Listings</h1>
            <p className="text-gray-500 text-sm">Real-time market prices from registered buyers</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Neumorphic Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Listings Card */}
        <div className="bg-gray-50 rounded-3xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-lg">
              <Building className="text-white" size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
          <p className="text-sm text-gray-500 font-medium">Active Listings</p>
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500" style={{width: '100%'}}></div>
          </div>
        </div>

        {/* Available Buyers Card */}
        <div className="bg-gray-50 rounded-3xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-lg">
              <CheckCircle className="text-white" size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +{stats.total > 0 ? Math.round((stats.available/stats.total)*100) : 0}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.available}</p>
          <p className="text-sm text-gray-500 font-medium">Available Now</p>
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{width: `${(stats.available/stats.total)*100}%`}}></div>
          </div>
        </div>

        {/* Avg T1 Price Card */}
        <div className="bg-gray-50 rounded-3xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg">
              <Award className="text-white" size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Premium</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ₱{stats.avgClassAPrice > 0 ? stats.avgClassAPrice.toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-500 font-medium">Avg Class A</p>
          <div className="mt-3 flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 font-semibold">Highest Quality</span>
          </div>
        </div>

        {/* Avg T2 Price Card */}
        <div className="bg-gray-50 rounded-3xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Standard</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ₱{stats.avgClassBPrice > 0 ? stats.avgClassBPrice.toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-500 font-medium">Avg Class B</p>
          <div className="mt-3 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" />
            <span className="text-xs text-blue-600 font-semibold">Standard Quality</span>
          </div>
        </div>
      </div>

      {/* Filters - Neumorphic Design */}
      <div className="bg-gray-50 rounded-3xl p-6 mb-8 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Filter & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search company, municipality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-none rounded-2xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 text-gray-900 font-medium"
          >
            <option value="all">All Types</option>
            <option value="class_a">🏆 Class A</option>
            <option value="class_b">⭐ Class B</option>
            <option value="class_c">📦 Class C</option>
          </select>

          <select
            value={filterMunicipality}
            onChange={(e) => setFilterMunicipality(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-none rounded-2xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 text-gray-900 font-medium"
          >
            <option value="all">All Municipalities</option>
            {municipalities.map(mun => (
              <option key={mun} value={mun}>{mun}</option>
            ))}
          </select>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-none rounded-2xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 text-gray-900 font-medium"
          >
            <option value="all">All Status</option>
            <option value="Available">✅ Available</option>
            <option value="Limited">⚠️ Limited</option>
            <option value="Not Buying">❌ Not Buying</option>
          </select>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredListings.length}</span> of <span className="font-bold text-gray-900">{listings.length}</span> listings
          </p>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-semibold text-gray-900"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] p-12 text-center">
          <Building className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Listings Found</h3>
          <p className="text-gray-600">No buyer price listings match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const currentPriceType = selectedPriceType[listing.listing_id] || 'class_a';
            
            type PriceType = {
              type: 'class_a' | 'class_b' | 'class_c';
              price: number | null;
              image: string | null;
              label: string;
              quality: string;
              color: 'emerald' | 'blue' | 'amber';
              emoji: string;
            };
            
            const availableTypes: PriceType[] = [
              listing.class_a_enabled ? { type: 'class_a', price: listing.class_a_price, image: listing.class_a_image, label: 'Class A', quality: 'Premium Quality', color: 'emerald', emoji: '🏆' } : null,
              listing.class_b_enabled ? { type: 'class_b', price: listing.class_b_price, image: listing.class_b_image, label: 'Class B', quality: 'Standard Quality', color: 'blue', emoji: '⭐' } : null,
              listing.class_c_enabled ? { type: 'class_c', price: listing.class_c_price, image: listing.class_c_image, label: 'Class C', quality: 'Basic Quality', color: 'amber', emoji: '📦' } : null
            ].filter((item): item is PriceType => item !== null);

            const currentPrice = availableTypes.find(t => t.type === currentPriceType) || availableTypes[0];

            return (
              <div key={listing.listing_id} className="bg-gray-50 rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-300 overflow-hidden">
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-br ${
                  currentPrice?.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                  currentPrice?.color === 'blue' ? 'from-blue-400 to-blue-600' :
                  'from-amber-400 to-amber-600'
                } p-6 text-white relative`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building size={20} />
                        <h3 className="text-xl font-bold">{listing.company_name}</h3>
                      </div>
                      <p className="text-white/90 text-sm">{listing.contact_person}</p>
                    </div>
                    {getAvailabilityBadge(listing.availability)}
                  </div>
                  
                  {/* Swipeable Price Display */}
                  {availableTypes.length > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                      <button
                        onClick={() => handlePriceNavigation(listing.listing_id, 'prev')}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <div className="text-center flex-1">
                        <p className="text-sm font-medium mb-1 flex items-center justify-center gap-2">
                          <span className="text-2xl">{currentPrice?.emoji}</span>
                          <span>{currentPrice?.label}</span>
                        </p>
                        <p className="text-xs text-white/80">{currentPrice?.quality}</p>
                      </div>
                      
                      <button
                        onClick={() => handlePriceNavigation(listing.listing_id, 'next')}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Fiber Image - If Available */}
                  {currentPrice?.image && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] bg-gray-100">
                      <img 
                        src={currentPrice.image} 
                        alt={`${currentPrice.label} fiber sample`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23f3f4f6" width="400" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image Available%3C/text%3E%3C/svg%3E';
                          target.onerror = null;
                        }}
                      />
                    </div>
                  )}

                  {/* Price Display - Neumorphic */}
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-medium mb-2">Current Price per KG</p>
                      <p className={`text-5xl font-bold ${
                        currentPrice?.color === 'emerald' ? 'text-emerald-600' :
                        currentPrice?.color === 'blue' ? 'text-blue-600' :
                        'text-amber-600'
                      }`}>
                        ₱{currentPrice?.price ? currentPrice.price.toFixed(2) : '0.00'}
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        {availableTypes.map((type, idx) => (
                          <div
                            key={idx}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                              type?.type === currentPriceType ? 'w-6 bg-gray-900' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                      <div className="p-2 bg-gray-50 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
                        <Phone size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm text-gray-900 font-semibold">{listing.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                      <div className="p-2 bg-gray-50 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
                        <Mail size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm text-gray-900 font-semibold truncate">{listing.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                      <div className="p-2 bg-gray-50 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
                        <MapPin size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm text-gray-900 font-semibold">{listing.barangay}, {listing.municipality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Validity */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-gray-500" />
                        <p className="text-xs text-gray-500 font-medium">Payment</p>
                      </div>
                      <p className="text-sm text-gray-900 font-semibold">{listing.payment_terms}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-gray-500" />
                        <p className="text-xs text-gray-500 font-medium">Valid Until</p>
                      </div>
                      <p className="text-sm text-gray-900 font-semibold">{new Date(listing.valid_until).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {listing.requirements && (
                    <div className="p-4 bg-gray-50 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-gray-600" />
                        <p className="text-sm font-bold text-gray-900">Requirements</p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{listing.requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyerPriceListingsViewer;
