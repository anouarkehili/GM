import React from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';
import { subscriptionTypes } from './subscriptionTypes';

interface AddSubscriberModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: any;
  setForm: (form: any) => void;
}

const AddSubscriberModal: React.FC<AddSubscriberModalProps> = ({
  show,
  onClose,
  onSubmit,
  form,
  setForm
}) => (
  <Modal show={show} onClose={onClose} title="إضافة مشترك جديد">
    <form>
      <div className="form-group">
        <label className="form-label">الاسم الكامل</label>
        <input type="text" className="form-input" placeholder="أدخل الاسم الكامل" onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">نوع الاشتراك</label>
        <select className="form-select" onChange={e => setForm({ ...form, plan: e.target.value })}>
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
        <input type="date" className="form-input" onChange={e => setForm({ ...form, expires: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">الأيام المتبقية</label>
        <input type="number" className="form-input" onChange={e => setForm({ ...form, daysLeft: Number(e.target.value) })} />
      </div>
    </form>
    <div className="modal-footer">
      <button className="btn btn-primary" type="button" onClick={onSubmit}>
        <Plus className="w-4 h-4" />
        إضافة المشترك
      </button>
      <button className="btn btn-secondary" type="button" onClick={onClose}>
        إلغاء
      </button>
    </div>
  </Modal>
);

export default AddSubscriberModal;
