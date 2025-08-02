import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import AddSubscriberModal from './AddSubscriberModal';

const subscriptionTypes = [
  { id: 1, name: 'اشتراك شهري عادي', price: 2300 },
  { id: 2, name: 'اشتراك شهري مع جهاز المشي', price: 3500 },
  { id: 3, name: 'اشتراك 15 حصة (صلاحية 3 أشهر)', price: 2000 },
  { id: 4, name: 'اشتراك 15 حصة مع جهاز المشي', price: 3000 },
  { id: 5, name: 'اشتراك جهاز المشي فقط (15 حصة)', price: 2000 },
  { id: 6, name: 'اشتراك جهاز المشي فقط (شهري)', price: 2300 },
];

interface Subscription {
  id: number;
  name: string;
  plan: string;
  expires: string;
  daysLeft: number;
}

const Subscriptions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch('http://localhost:4000/subscriptions')
      .then(res => res.json())
      .then(data => setSubscriptions(data));
  }, []);

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubscription = async () => {
    await fetch('http://localhost:4000/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowAddModal(false);
    setForm({});
    fetch('http://localhost:4000/subscriptions')
      .then(res => res.json())
      .then(data => setSubscriptions(data));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">إدارة الاشتراكات</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            مشترك جديد
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="card mb-24">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث بالاسم..."
                  className="form-input pr-40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Subscribers Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>نوع الاشتراك</th>
              <th>تاريخ الانتهاء</th>
              <th>الأيام المتبقية</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="font-medium text-gray-900">{sub.name}</td>
                <td>{sub.plan}</td>
                <td>{sub.expires}</td>
                <td>{sub.daysLeft}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Subscriber Modal */}
      {showAddModal && (
        <AddSubscriberModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubscription}
          form={form}
          setForm={setForm}
        />
      )}
    </div>
  );
};

export default Subscriptions;