import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Scan, Search, Plus, Minus } from 'lucide-react';

interface Attendance {
  id: number;
  name: string;
  time: string;
  type: string;
}
interface Subscriber {
  id: number;
  name: string;
  subscriptionType: string;
  sessionsLeft: number | null;
}

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/attendance')
      .then(res => res.json())
      .then(data => setTodayAttendance(data));
    fetch('http://localhost:4000/subscriptions')
      .then(res => res.json())
      .then(data => setSubscribers(data));
  }, []);

  const getStatusBadge = (type: string) => {
    if (type === 'دخول') return <span className="status-badge status-active">في النادي</span>;
    if (type === 'خروج') return <span className="status-badge status-expiring">مغادر</span>;
    return <span className="status-badge status-active">في النادي</span>;
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تسجيل حضور أو خروج
  const handleManualAttendance = async (subscriberName: string, action: 'checkin' | 'checkout') => {
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    await fetch('http://localhost:4000/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: subscriberName, time, type: action === 'checkin' ? 'دخول' : 'خروج' })
    });
    fetch('http://localhost:4000/attendance')
      .then(res => res.json())
      .then(data => setTodayAttendance(data));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">تتبع الحضور</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Calendar className="w-4 h-4" />
            تقرير شهري
          </button>
          <button className="btn btn-primary" onClick={() => setShowScanModal(true)}>
            <Scan className="w-4 h-4" />
            مسح الباركود
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid mb-24">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{todayAttendance.length}</h3>
          <p className="stat-label">إجمالي الحضور اليوم</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{todayAttendance.filter(a => a.type === 'دخول').length}</h3>
          <p className="stat-label">متواجدون حالياً</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{todayAttendance.length}</h3>
          <p className="stat-label">متوسط الحضور الأسبوعي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Today's Attendance */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">حضور اليوم - {selectedDate}</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input w-auto"
              />
            </div>
            <div className="card-content">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>الوقت</th>
                      <th>النوع</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.map((attendance) => (
                      <tr key={attendance.id}>
                        <td className="font-medium text-gray-900">{attendance.name}</td>
                        <td>{attendance.time}</td>
                        <td>{attendance.type}</td>
                        <td>{getStatusBadge(attendance.type)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Check-in */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">تسجيل حضور سريع</h3>
          </div>
          <div className="card-content">
            <div className="form-group">
              <div className="relative">
                <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث عن مشترك..."
                  className="form-input pr-40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-8 max-h-96 overflow-y-auto">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-12 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{subscriber.name}</p>
                    <p className="text-sm text-gray-500">{subscriber.subscriptionType}</p>
                    {subscriber.sessionsLeft && (
                      <p className="text-xs text-orange-600">{subscriber.sessionsLeft} حصة متبقية</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleManualAttendance(subscriber.name, 'checkin')}
                    className="btn btn-primary btn-sm"
                  >
                    دخول
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scan Modal */}
      {showScanModal && (
        <div className="modal-overlay" onClick={() => setShowScanModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">مسح الباركود</h3>
              <button className="modal-close" onClick={() => setShowScanModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="text-center py-32">
                <Scan className="w-16 h-16 mx-auto mb-16 text-gray-400" />
                <p className="text-gray-600 mb-16">
                  وجه الكاميرا نحو الباركود أو أدخل الرقم يدوياً
                </p>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="أدخل رقم الباركود..."
                    className="form-input text-center text-lg"
                  />
                </div>
                <div className="mt-16">
                  <button className="btn btn-primary mr-8">
                    تأكيد الحضور
                  </button>
                  <button className="btn btn-secondary">
                    فتح الكاميرا
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;