import React, { useEffect, useState, useRef } from 'react';
import { Users, Calendar, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
// @ts-ignore
import { Html5Qrcode } from 'html5-qrcode';
import AddProductModal from './AddProductModal';

// تعريف الأنواع للبيانات المسترجعة من API
interface Stat {
  id: number;
  label: string;
  value: string;
  change: string;
  changeType: string;
  icon: string;
  color: string;
}

interface Attendance {
  id: number;
  name: string;
  time: string;
  type: string;
}

interface Subscription {
  id: number;
  name: string;
  plan: string;
  expires: string;
  daysLeft: number;
}

const iconMap: Record<string, any> = {
  Users,
  Calendar,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
};

const subscriptionTypes = [
  'اشتراك شهري عادي',
  'اشتراك 15 حصة',
  'اشتراك شهري مع جهاز المشي',
  'اشتراك سنوي',
];

const Dashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<Subscription[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:4000/stats')
      .then(res => res.json())
      .then(data => setStats(data));
    fetch('http://localhost:4000/attendance')
      .then(res => res.json())
      .then(data => setRecentAttendance(data));
    fetch('http://localhost:4000/subscriptions')
      .then(res => res.json())
      .then(data => setExpiringSubscriptions(data));
  }, []);

  // جلب المنتجات
  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // إضافة مشترك جديد
  const handleAddSubscription = async () => {
    await fetch('http://localhost:4000/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(null);
    // تحديث البيانات
    fetch('http://localhost:4000/subscriptions')
      .then(res => res.json())
      .then(data => setExpiringSubscriptions(data));
  };

  // إضافة منتج جديد
  const handleAddProduct = async () => {
    await fetch('http://localhost:4000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(null);
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  // مسح الباركود بالكاميرا
  const startBarcodeScan = () => {
    setScanning(true);
    if (videoRef.current) {
      // @ts-ignore
      const html5QrCode = new Html5Qrcode(videoRef.current.id);
      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: any) => {
          setBarcode(decodedText);
          setForm({ ...form, barcode: decodedText });
          html5QrCode.stop();
          setScanning(false);
        },
        (error: any) => {}
      );
    }
  };

  // تعبئة تاريخ اليوم
  const fillTodayDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...form, expires: today });
  };

  // دالة لإغلاق اللوحة عند الضغط على الخلفية
  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowModal(null);
      setScanning(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Modal Styles */}
      <style>{`
        .modern-modal {
          animation: modalFadeIn 0.3s;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modern-modal-content {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(60, 60, 120, 0.18);
          padding: 40px 32px;
          width: 100%;
          max-width: 420px;
          position: relative;
        }
        .modern-modal-content h3 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #3b3b5c;
          margin-bottom: 24px;
        }
        .modern-modal-content .input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          margin-bottom: 16px;
          font-size: 1rem;
          background: #fff;
          transition: border 0.2s;
        }
        .modern-modal-content .input:focus {
          border-color: #6366f1;
          outline: none;
        }
        .modern-modal-content select.input {
          background: #fff;
        }
        .modern-modal-content .btn {
          padding: 12px 0;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }
        .modern-modal-content .btn-primary {
          background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
          color: #fff;
          border: none;
        }
        .modern-modal-content .btn-primary:hover {
          background: linear-gradient(90deg, #4338ca 0%, #2563eb 100%);
        }
        .modern-modal-content .btn-secondary {
          background: #e0e7ff;
          color: #6366f1;
          border: none;
        }
        .modern-modal-content .btn-secondary:hover {
          background: #c7d2fe;
        }
        .modern-modal-content .btn {
          margin-top: 0;
        }
        .modern-modal-content .flex {
          gap: 12px;
        }
      `}</style>
      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 modern-modal"
          onClick={handleCloseModal}
        >
          <div className="modern-modal-content" onClick={e => e.stopPropagation()}>
            {showModal === 'subscription' && (
              <>
                <h3>إضافة مشترك جديد</h3>
                <input type="text" className="input" placeholder="الاسم الكامل" onChange={e => setForm({ ...form, name: e.target.value })} />
                <select className="input" onChange={e => setForm({ ...form, plan: e.target.value })} defaultValue="">
                  <option value="" disabled>اختر نوع الاشتراك</option>
                  {subscriptionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="flex items-center mb-4">
                  <input type="date" className="input" placeholder="تاريخ الاشتراك" value={form.expires || ''} onChange={e => setForm({ ...form, expires: e.target.value })} />
                  <button className="btn btn-secondary ml-4" onClick={fillTodayDate}>تاريخ اليوم</button>
                </div>
                <input type="number" className="input" placeholder="الأيام المتبقية" onChange={e => setForm({ ...form, daysLeft: Number(e.target.value) })} />
                <div className="flex mt-8">
                  <button className="btn btn-primary flex-1" onClick={handleAddSubscription}>إضافة</button>
                  <button className="btn flex-1" onClick={() => { setShowModal(null); setScanning(false); }}>إلغاء</button>
                </div>
              </>
            )}
            {/* لوحة إضافة منتج جديد */}
            {showModal === 'addProduct' && (
              <AddProductModal
                show={showModal === 'addProduct'}
                onClose={() => setShowModal(null)}
                onSubmit={handleAddProduct}
                form={form}
                setForm={setForm}
                barcode={barcode}
                setBarcode={setBarcode}
                scanning={scanning}
                startBarcodeScan={startBarcodeScan}
                videoRef={videoRef}
              />
            )}
          </div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">لوحة التحكم</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal('subscription')}>
            <Plus className="w-4 h-4" />
            مشترك جديد
          </button>
          <button className="btn btn-primary ml-8" onClick={() => setShowModal('addProduct')}>
            <ShoppingCart className="w-4 h-4" />
            منتج جديد
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon] || Users;
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
              <p className={`stat-change ${stat.changeType}`}>{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Recent Attendance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">آخر حركات الحضور</h3>
          </div>
          <div className="card-content">
            <div className="space-y-16">
              {recentAttendance.map((attendance, index) => (
                <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{attendance.name}</p>
                    <p className="text-sm text-gray-500">{attendance.time}</p>
                  </div>
                  <span className={`status-badge ${attendance.type === 'دخول' ? 'status-active' : 'status-expiring'}`}>{attendance.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expiring Subscriptions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">الاشتراكات المنتهية قريباً</h3>
          </div>
          <div className="card-content">
            <div className="space-y-16">
              {expiringSubscriptions.map((subscription, index) => (
                <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{subscription.name}</p>
                    <p className="text-sm text-gray-500">{subscription.plan}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-600">{subscription.daysLeft} أيام متبقية</p>
                    <p className="text-xs text-gray-500">{subscription.expires}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16">
              <button className="btn btn-secondary w-full">عرض جميع الاشتراكات المنتهية</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-32">
        <h3 className="text-lg font-semibold text-gray-900 mb-16">الإجراءات السريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
          <button className="card p-20 text-center hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 mx-auto mb-8 text-blue-600" />
            <p className="font-medium">إضافة مشترك</p>
          </button>
          <button className="card p-20 text-center hover:shadow-md transition-shadow">
            <Calendar className="w-8 h-8 mx-auto mb-8 text-green-600" />
            <p className="font-medium">تسجيل حضور</p>
          </button>
          <button className="card p-20 text-center hover:shadow-md transition-shadow">
            <ShoppingCart className="w-8 h-8 mx-auto mb-8 text-orange-600" />
            <p className="font-medium">بيع منتج</p>
          </button>
          <button className="card p-20 text-center hover:shadow-md transition-shadow">
            <TrendingUp className="w-8 h-8 mx-auto mb-8 text-purple-600" />
            <p className="font-medium">تقرير يومي</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;