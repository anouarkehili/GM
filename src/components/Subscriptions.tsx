import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar, AlertTriangle } from 'lucide-react';

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
  created_at: string;
}

const subscriptionTypes = [
  { id: 1, name: 'اشتراك شهري عادي', price: 2300 },
  { id: 2, name: 'اشتراك شهري مع جهاز المشي', price: 3500 },
  { id: 3, name: 'اشتراك 15 حصة (صلاحية 3 أشهر)', price: 2000 },
  { id: 4, name: 'اشتراك 15 حصة مع جهاز المشي', price: 3000 },
  { id: 5, name: 'اشتراك جهاز المشي فقط (15 حصة)', price: 2000 },
  { id: 6, name: 'اشتراك جهاز المشي فقط (شهري)', price: 2300 },
];

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, filterStatus]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/subscriptions');
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // فلترة بالبحث
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة بالحالة
    if (filterStatus !== 'all') {
      if (filterStatus === 'expiring') {
        filtered = filtered.filter(sub => sub.daysLeft <= 7 && sub.daysLeft > 0);
      } else if (filterStatus === 'expired') {
        filtered = filtered.filter(sub => sub.daysLeft <= 0);
      } else {
        filtered = filtered.filter(sub => sub.status === filterStatus);
      }
    }

    setFilteredSubscriptions(filtered);
  };

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
      fetchSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      const selectedType = subscriptionTypes.find(type => type.name === form.plan);
      const subscriptionData = {
        ...form,
        price: selectedType?.price || form.price
      };

      await fetch(`http://localhost:4000/subscriptions/${selectedSubscription?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });

      setShowModal(null);
      setForm({});
      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDeleteSubscription = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) {
      try {
        await fetch(`http://localhost:4000/subscriptions/${id}`, {
          method: 'DELETE'
        });
        fetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const openEditModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setForm({
      name: subscription.name,
      plan: subscription.plan,
      expires: subscription.expires,
      daysLeft: subscription.daysLeft,
      price: subscription.price,
      phone: subscription.phone,
      email: subscription.email,
      status: subscription.status
    });
    setShowModal('edit');
  };

  const calculateDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExpiryDateChange = (date: string) => {
    const daysLeft = calculateDaysLeft(date);
    setForm({ ...form, expires: date, daysLeft });
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (subscription.daysLeft <= 0) {
      return <span className="status-badge status-expired">منتهي</span>;
    } else if (subscription.daysLeft <= 7) {
      return <span className="status-badge status-expiring">ينتهي قريباً</span>;
    } else {
      return <span className="status-badge status-active">نشط</span>;
    }
  };

  const getTotalRevenue = () => {
    return filteredSubscriptions.reduce((total, sub) => total + sub.price, 0);
  };

  if (loading) {
    return (
      <div className="fade-in flex items-center justify-center min-h-96">
        <div className="loading"></div>
        <span className="mr-12 text-lg">جاري تحميل الاشتراكات...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">إدارة الاشتراكات</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Calendar className="w-4 h-4" />
            تقرير الاشتراكات
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal('add')}>
            <Plus className="w-4 h-4" />
            مشترك جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-24">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Plus className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{subscriptions.length}</h3>
          <p className="stat-label">إجمالي المشتركين</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{subscriptions.filter(sub => sub.status === 'active').length}</h3>
          <p className="stat-label">الاشتراكات النشطة</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{subscriptions.filter(sub => sub.daysLeft <= 7 && sub.daysLeft > 0).length}</h3>
          <p className="stat-label">تنتهي خلال أسبوع</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              <Plus className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{getTotalRevenue().toLocaleString()} دج</h3>
          <p className="stat-label">إجمالي الإيرادات</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="relative">
              <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم، الهاتف أو البريد الإلكتروني..."
                className="form-input pr-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">جميع الاشتراكات</option>
              <option value="active">النشطة</option>
              <option value="expiring">تنتهي قريباً</option>
              <option value="expired">المنتهية</option>
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              عرض {filteredSubscriptions.length} من {subscriptions.length} اشتراك
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">قائمة المشتركين</h3>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم الكامل</th>
                  <th>نوع الاشتراك</th>
                  <th>السعر</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الأيام المتبقية</th>
                  <th>الهاتف</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="font-medium text-gray-900">{subscription.name}</td>
                    <td>{subscription.plan}</td>
                    <td className="font-medium text-green-600">{subscription.price} دج</td>
                    <td>{subscription.expires}</td>
                    <td>
                      <span className={subscription.daysLeft <= 7 ? 'text-red-600 font-medium' : ''}>
                        {subscription.daysLeft} يوم
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-4">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {subscription.phone}
                      </div>
                    </td>
                    <td>{getStatusBadge(subscription)}</td>
                    <td>
                      <div className="flex gap-8">
                        <button
                          onClick={() => openEditModal(subscription)}
                          className="text-blue-600 hover:text-blue-800"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-800"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-32">
              <p className="text-gray-500 text-lg">لا توجد اشتراكات تطابق البحث</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {showModal === 'add' ? 'إضافة مشترك جديد' : 'تعديل الاشتراك'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(null)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={(e) => {
                e.preventDefault();
                showModal === 'add' ? handleAddSubscription() : handleUpdateSubscription();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
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
                      required
                    />
                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="form-group">
                    <label className="form-label">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.expires || ''}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                      required
                    />
                  </div>
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
                </div>

                {showModal === 'edit' && (
                  <div className="form-group">
                    <label className="form-label">حالة الاشتراك</label>
                    <select
                      className="form-select"
                      value={form.status || 'active'}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                      <option value="suspended">معلق</option>
                    </select>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    {showModal === 'add' ? 'إضافة المشترك' : 'حفظ التغييرات'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;