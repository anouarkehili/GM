import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Users, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/subscriptions')
      .then(res => res.json())
      .then(data => setSubscribers(data));
    fetch('http://localhost:4000/attendance')
      .then(res => res.json())
      .then(data => setAttendance(data));
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // إحصائيات شهرية ديناميكية
  const monthlyStats = {
    totalRevenue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    subscriptionRevenue: subscribers.length * 2300, // مثال: كل اشتراك 2300 دج
    productRevenue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    newSubscribers: subscribers.length,
    totalAttendance: attendance.length,
    averageDailyAttendance: Math.round(attendance.length / 30)
  };

  // المنتجات الأكثر مبيعاً (مثال ديناميكي)
  const topProducts = products
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(p => ({ name: p.name, sold: p.quantity, revenue: p.price * p.quantity }));

  // أنواع الاشتراكات (مثال ديناميكي)
  const subscriptionStats = [
    { type: 'اشتراك شهري عادي', count: subscribers.filter(s => s.plan === 'اشتراك شهري عادي').length, revenue: subscribers.filter(s => s.plan === 'اشتراك شهري عادي').length * 2300 },
    { type: 'اشتراك شهري مع جهاز المشي', count: subscribers.filter(s => s.plan === 'اشتراك شهري مع جهاز المشي').length, revenue: subscribers.filter(s => s.plan === 'اشتراك شهري مع جهاز المشي').length * 3500 },
    { type: 'اشتراك 15 حصة', count: subscribers.filter(s => s.plan === 'اشتراك 15 حصة').length, revenue: subscribers.filter(s => s.plan === 'اشتراك 15 حصة').length * 2000 },
    { type: 'اشتراك 15 حصة مع جهاز المشي', count: subscribers.filter(s => s.plan === 'اشتراك 15 حصة مع جهاز المشي').length, revenue: subscribers.filter(s => s.plan === 'اشتراك 15 حصة مع جهاز المشي').length * 3000 }
  ];

  const handleExport = (reportType: string, format: 'pdf' | 'excel') => {
    // Handle export logic here
    alert(`تصدير ${reportType} بصيغة ${format}`);
  };

  const generateReport = (reportType: string) => {
    // Handle report generation logic here
    alert(`إنشاء تقرير ${reportType}`);
  };

  // تعريف أنواع التقارير
  const reportTypes = [
    {
      id: 'monthly',
      title: 'تقرير شهري',
      description: 'عرض ملخص شهري للإيرادات، الاشتراكات، الحضور والمبيعات.',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'subscribers',
      title: 'تقرير المشتركين',
      description: 'تفاصيل حول المشتركين الجدد والحاليين وخطط الاشتراك.',
      icon: Users,
      color: 'green'
    },
    {
      id: 'attendance',
      title: 'تقرير الحضور',
      description: 'سجل الحضور اليومي وتحليل متوسط الحضور.',
      icon: BarChart3,
      color: 'orange'
    },
    {
      id: 'products',
      title: 'تقرير المبيعات',
      description: 'تفاصيل المنتجات الأكثر مبيعاً وإيراداتها.',
      icon: ShoppingCart,
      color: 'purple'
    }
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">التقارير والإحصائيات</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Calendar className="w-4 h-4" />
            تقرير شهري
          </button>
          <button className="btn btn-primary">
            <FileText className="w-4 h-4" />
            تقرير مخصص
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-24">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-16 items-end">
            <div className="form-group flex-1">
              <label className="form-label">من تاريخ</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">إلى تاريخ</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <button className="btn btn-primary">
              <BarChart3 className="w-4 h-4" />
              تطبيق الفلتر
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="stats-grid mb-32">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{monthlyStats.totalRevenue.toLocaleString()} دج</h3>
          <p className="stat-label">إجمالي الإيرادات الشهرية</p>
          <p className="stat-change positive">+12% من الشهر الماضي</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{monthlyStats.newSubscribers}</h3>
          <p className="stat-label">مشتركون جدد هذا الشهر</p>
          <p className="stat-change positive">+8 من الشهر الماضي</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{monthlyStats.totalAttendance}</h3>
          <p className="stat-label">إجمالي الحضور الشهري</p>
          <p className="stat-change positive">متوسط {monthlyStats.averageDailyAttendance} يومياً</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{monthlyStats.productRevenue.toLocaleString()} دج</h3>
          <p className="stat-label">إيرادات المنتجات</p>
          <p className="stat-change positive">26% من إجمالي الإيرادات</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-32">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="card">
              <div className="card-content">
                <div className="flex items-start gap-16">
                  <div className={`stat-icon ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-8">{report.title}</h3>
                    <p className="text-gray-600 mb-16">{report.description}</p>
                    <div className="flex gap-8">
                      <button
                        onClick={() => generateReport(report.id)}
                        className="btn btn-primary btn-sm"
                      >
                        إنشاء التقرير
                      </button>
                      <button
                        onClick={() => handleExport(report.id, 'pdf')}
                        className="btn btn-secondary btn-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport(report.id, 'excel')}
                        className="btn btn-secondary btn-sm"
                      >
                        <Download className="w-4 h-4" />
                        Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Top Selling Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">أكثر المنتجات مبيعاً</h3>
          </div>
          <div className="card-content">
            <div className="space-y-16">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-12">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">تم بيع {product.sold} قطعة</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-green-600">{product.revenue.toLocaleString()} دج</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Types Performance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">أداء أنواع الاشتراكات</h3>
          </div>
          <div className="card-content">
            <div className="space-y-16">
              {subscriptionStats.map((subscription, index) => (
                <div key={index} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{subscription.type}</p>
                      <p className="text-sm text-gray-500">{subscription.count} مشترك</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-blue-600">{subscription.revenue.toLocaleString()} دج</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(subscription.revenue / Math.max(...subscriptionStats.map(s => s.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-32 card">
        <div className="card-header">
          <h3 className="card-title">تصدير البيانات</h3>
        </div>
        <div className="card-content">
          <p className="text-gray-600 mb-16">
            يمكنك تصدير جميع البيانات للفترة المحددة بصيغ مختلفة
          </p>
          <div className="flex flex-wrap gap-12">
            <button className="btn btn-primary">
              <Download className="w-4 h-4" />
              تصدير تقرير شامل (PDF)
            </button>
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              تصدير بيانات المشتركين (Excel)
            </button>
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              تصدير سجل الحضور (Excel)
            </button>
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              تصدير المبيعات (Excel)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;