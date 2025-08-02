import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Settings,
  FileText,
  Bell,
  Search,
  Plus,
  BarChart3
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Subscriptions from './components/Subscriptions';
import Attendance from './components/Attendance';
import Products from './components/Products';
import Sales from './components/Sales';
import Reports from './components/Reports';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'الاشتراكات', icon: Users },
    { id: 'attendance', label: 'الحضور', icon: Calendar },
    { id: 'products', label: 'المنتجات', icon: ShoppingCart },
    { id: 'sales', label: 'المبيعات', icon: Plus },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'subscriptions':
        return <Subscriptions />;
      case 'attendance':
        return <Attendance />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="gym-app" dir="rtl">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-right">
            <div className="logo">
              <BarChart3 className="logo-icon" />
              <span className="logo-text">GYM DADA</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="search-container">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="البحث..." 
                className="search-input"
              />
            </div>
          </div>

          <div className="header-left">
            <button className="notification-btn">
              <Bell className="notification-icon" />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
            <div className="user-info">
              <span className="user-name">مدير النادي</span>
              <div className="user-avatar">م</div>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;