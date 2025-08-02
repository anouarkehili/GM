import React, { useEffect, useState } from 'react';
import { Users, Calendar, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, Plus, DollarSign } from 'lucide-react';

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
  date: string;
}

interface Subscription {
  id: number;
  name: string;
  plan: string;
  expires: string;
  daysLeft: number;
  price: number;
  phone: string;
  email: string;
  status: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  barcode: string;
  lowStockThreshold: number;
}

interface Sale {
  id: number;
  productName: string;
  quantity: number;
  total: number;
  date: string;
  time: string;
}

const iconMap: Record<string, any> = {
  Users,
  Calendar,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  DollarSign,
};

const subscriptionTypes = [
  { id: 1, name: 'اشتراك شهري عادي', price: 2300 },
  { id: 2, name: 'اشتراك شهري مع جهاز المشي', price: 3500 },
  { id: 3, name: 'اشتراك 15 حصة (صلاحية 3 أشهر)', price: 2000 },
  { id: 4, name: 'اشتراك 15 حصة مع جهاز المشي', price: 3000 },
  { id: 5, name: 'اشتراك جهاز المشي فقط (15 حصة)', price: 2000 },
  { id: 6, name: 'اشتراك جهاز المشي فقط (شهري)', price: 2300 },
];

const Dashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<Subscription[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // جلب الإحصائيات
        const statsRes = await fetch('http://localhost:4000/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // جلب الحضور الأخير
        const attendanceRes = await fetch('http://localhost:4000/attendance');
        const attendanceData = await attendanceRes.json();
        setRecentAttendance(attendanceData.slice(0, 5));

        // جلب الاشتراكات المنتهية قريباً
        const subscriptionsRes = await fetch('http://localhost:4000/subscriptions');
        const subscriptionsData = await subscriptionsRes.json();
        setExpiringSubscriptions(subscriptionsData.filter((sub: Subscription) => sub.daysLeft <= 7).slice(0, 3));

        // جلب المنتجات قليلة المخزون
        const productsRes = await fetch('http://localhost:4000/products');
        const productsData = await productsRes.json();
        setLowStockProducts(productsData.filter((product: Product) => product.quantity <= product.lowStockThreshold).slice(0, 5));

        // جلب المبيعات الأخيرة
        const salesRes = await fetch('http://localhost:4000/sales');
        const salesData = await salesRes.json();
        setRecentSales(salesData.slice(0, 5));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // إضافة مشترك جديد
  const handleAddSubscription = async () => {
    try {
      const selectedType = subscriptionTypes.find(type => type.name === form.plan);
      const subscriptionData = {
        ...form,
        price: selectedType?.price || 0
      };

      await fetch('http://localhost:4000/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });

      setShowModal(null);
      setForm({});
      
      // إعادة تحميل البيانات
      window.location.reload();
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  // إضافة منتج جديد
  const handleAddProduct = async () => {
    try {
      await fetch('http://localhost:4000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      setShowModal(null);
      setForm({});
      
      // إعادة تحميل البيانات
      window.location.reload();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // تعبئة تاريخ اليوم
  const fillTodayDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...form, expires: today });
  };

  // حساب الأيام المتبقية
  const calculateDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // تحديث الأيام المتبقية عند تغيير تاريخ الانتهاء
  const handleExpiryDateChange = (date: string) => {
    const daysLeft = calculateDaysLeft(date);
    setForm({ ...form, expires: date, daysLeft });
  };

  if (loading) {
    return (
      <div className="fade-in flex items-center justify-center min-h-96">
        <div className="loading"></div>
        <span className="mr-12 text-lg">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">لوحة التحكم</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowModal('product')}>
            <ShoppingCart className="w-4 h-4" />
            منتج جديد
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal('subscription')}>
            <Plus className="w-4 h-4" />
            مشترك جديد
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
        {/* Recent Attendance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">آخر حركات الحضور</h3>
          </div>
          <div className="card-content">
            {recentAttendance.length > 0 ? (
              <div className="space-y-16">
                {recentAttendance.map((attendance, index) => (
                  <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{attendance.name}</p>
                      <p className="text-sm text-gray-500">{attendance.time} - {attendance.date}</p>
                    </div>
                    <span className={`status-badge ${attendance.type === 'دخول' ? 'status-active' : 'status-expiring'}`}>
                      {attendance.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-32">لا توجد حركات حضور اليوم</p>
            )}
          </div>
        </div>

        {/* Expiring Subscriptions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">الاشتراكات المنتهية قريباً</h3>
          </div>
          <div className="card-content">
            {expiringSubscriptions.length > 0 ? (
              <div className="space-y-16">
                {expiringSubscriptions.map((subscription, index) => (
                  <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{subscription.name}</p>
                      <p className="text-sm text-gray-500">{subscription.plan}</p>
                      <p className="text-xs text-gray-400">{subscription.phone}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-600">{subscription.daysLeft} أيام متبقية</p>
                      <p className="text-xs text-gray-500">{subscription.expires}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-32">لا توجد اشتراكات منتهية قريباً</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
        {/* Low Stock Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">منتجات قليلة المخزون</h3>
          </div>
          <div className="card-content">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-16">
                {lowStockProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-600">متبقي: {product.quantity}</p>
                      <p className="text-xs text-gray-500">{product.price} دج</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-32">جميع المنتجات متوفرة بكمية كافية</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">آخر المبيعات</h3>
          </div>
          <div className="card-content">
            {recentSales.length > 0 ? (
              <div className="space-y-16">
                {recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{sale.productName}</p>
                      <p className="text-sm text-gray-500">الكمية: {sale.quantity}</p>
                      <p className="text-xs text-gray-400">{sale.time} - {sale.date}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-green-600">{sale.total} دج</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-32">لا توجد مبيعات اليوم</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">الإجراءات السريعة</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            <button 
              className="flex flex-col items-center p-20 rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-blue-300"
              onClick={() => setShowModal('subscription')}
            >
              <Users className="w-8 h-8 mb-8 text-blue-600" />
              <p className="font-medium text-gray-700">إضافة مشترك</p>
            </button>
            <button className="flex flex-col items-center p-20 rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-green-300">
              <Calendar className="w-8 h-8 mb-8 text-green-600" />
              <p className="font-medium text-gray-700">تسجيل حضور</p>
            </button>
            <button 
              className="flex flex-col items-center p-20 rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-orange-300"
              onClick={() => setShowModal('product')}
            >
              <ShoppingCart className="w-8 h-8 mb-8 text-orange-600" />
              <p className="font-medium text-gray-700">إضافة منتج</p>
            </button>
            <button className="flex flex-col items-center p-20 rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-purple-300">
              <TrendingUp className="w-8 h-8 mb-8 text-purple-600" />
              <p className="font-medium text-gray-700">تقرير يومي</p>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {showModal === 'subscription' ? 'إضافة مشترك جديد' : 'إضافة منتج جديد'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(null)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              {showModal === 'subscription' && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddSubscription(); }}>
                  <div className="form-group">
                    <label className="form-label">الاسم الكامل</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="أدخل الاسم الكامل"
                      value={form.name || ''}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="05xxxxxxxx"
                      value={form.phone || ''}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني (اختياري)</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="example@email.com"
                      value={form.email || ''}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">نوع الاشتراك</label>
                    <select 
                      className="form-select"
                      value={form.plan || ''}
                      onChange={(e) => setForm({ ...form, plan: e.target.value })}
                      required
                    >
                      <option value="">اختر نوع الاشتراك</option>
                      {subscriptionTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name} - {type.price} دج
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">تاريخ الانتهاء</label>
                    <div className="flex gap-12">
                      <input 
                        type="date" 
                        className="form-input flex-1"
                        value={form.expires || ''}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={fillTodayDate}
                      >
                        اليوم
                      </button>
                    </div>
                  </div>
                  {form.expires && (
                    <div className="form-group">
                      <label className="form-label">الأيام المتبقية</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={form.daysLeft || ''}
                        onChange={(e) => setForm({ ...form, daysLeft: Number(e.target.value) })}
                        required
                      />
                    </div>
                  )}
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      <Plus className="w-4 h-4" />
                      إضافة المشترك
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>
                      إلغاء
                    </button>
                  </div>
                </form>
              )}

              {showModal === 'product' && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
                  <div className="form-group">
                    <label className="form-label">اسم المنتج</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="أدخل اسم المنتج"
                      value={form.name || ''}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الفئة</label>
                    <select 
                      className="form-select"
                      value={form.category || ''}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      <option value="">اختر الفئة</option>
                      <option value="مكملات غذائية">مكملات غذائية</option>
                      <option value="مشروبات">مشروبات</option>
                      <option value="وجبات خفيفة">وجبات خفيفة</option>
                      <option value="إكسسوارات">إكسسوارات</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-16">
                    <div className="form-group">
                      <label className="form-label">السعر (دج)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="0"
                        value={form.price || ''}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">الكمية المتوفرة</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="0"
                        value={form.quantity || ''}
                        onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">الباركود (اختياري)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="أدخل رقم الباركود"
                      value={form.barcode || ''}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">حد التنبيه للمخزون المنخفض</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="5"
                      value={form.lowStockThreshold || 5}
                      onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      <Plus className="w-4 h-4" />
                      إضافة المنتج
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;