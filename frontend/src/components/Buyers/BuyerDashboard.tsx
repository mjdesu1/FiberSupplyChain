import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Package
} from 'lucide-react';
import BuyerAnalytics from './BuyerAnalytics';
import FiberPurchaseForm from './FiberPurchaseForm';
import BuyerSalesPage from './BuyerSalesPage';
import BuyerTransactions from './BuyerTransactions';
import BuyerProfile from './BuyerProfile';
import BuyerPriceListingFormWithClasses from './BuyerPriceListingFormWithClasses';
import BuyerPriceListings from './BuyerPriceListings';

interface BuyerDashboardProps {
  onLogout: () => void;
}

type DashboardPage = 'dashboard' | 'purchase' | 'sales' | 'transactions' | 'profile' | 'create-listing' | 'my-listings';

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    company: '',
    contact: ''
  });

  useEffect(() => {
    fetchBuyerProfile();
  }, []);

  const fetchBuyerProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/buyers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setBuyerInfo({
        name: data.buyer?.full_name || 'Buyer',
        email: data.buyer?.email || '',
        company: data.buyer?.company_name || '',
        contact: data.buyer?.contact_number || ''
      });
    } catch (error) {
      console.error('Error fetching buyer profile:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-listing', label: 'Create Price Listing', icon: ShoppingCart },
    { id: 'my-listings', label: 'My Price Listings', icon: FileText },
    { id: 'purchase', label: 'Purchase Fiber', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <BuyerAnalytics />;
      case 'create-listing':
        return <BuyerPriceListingFormWithClasses />;
      case 'my-listings':
        return <BuyerPriceListings />;
      case 'purchase':
        return <FiberPurchaseForm />;
      case 'sales':
        return <BuyerSalesPage />;
      case 'transactions':
        return <BuyerTransactions />;
      case 'profile':
        return <BuyerProfile />;
      default:
        return <BuyerAnalytics />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 ease-in-out shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-blue-500">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <h1 className="text-2xl font-bold">Buyer Portal</h1>
                  <p className="text-blue-200 text-sm mt-1">Fiber Marketplace</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as DashboardPage)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-blue-500">
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
                  <User size={20} />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{buyerInfo.name}</p>
                    <p className="text-blue-200 text-xs">{buyerInfo.company}</p>
                  </div>
                )}
                {sidebarOpen && <ChevronDown size={16} />}
              </button>

              {showProfileDropdown && sidebarOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b">
                    <p className="font-semibold text-gray-900">{buyerInfo.name}</p>
                    <p className="text-sm text-gray-600">{buyerInfo.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{buyerInfo.contact}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default BuyerDashboard;
