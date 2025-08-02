import React from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';

interface AddProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: any;
  setForm: (form: any) => void;
  barcode: string;
  setBarcode: (barcode: string) => void;
  scanning: boolean;
  startBarcodeScan: () => void;
  videoRef: React.RefObject<HTMLDivElement>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  barcode,
  setBarcode,
  scanning,
  startBarcodeScan,
  videoRef
}) => (
  <Modal show={show} onClose={onClose} title="إضافة منتج جديد">
    <form>
      <div className="form-group">
        <label className="form-label">اسم المنتج</label>
        <input type="text" className="form-input" placeholder="أدخل اسم المنتج" onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">الفئة</label>
        <select className="form-select" onChange={e => setForm({ ...form, category: e.target.value })}>
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
          <input type="number" className="form-input" placeholder="0" onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">الكمية المتوفرة</label>
          <input type="number" className="form-input" placeholder="0" onChange={e => setForm({ ...form, quantity: e.target.value })} />
        </div>
      </div>
      <div className="form-group flex items-center gap-8">
        <label className="form-label">الباركود (اختياري)</label>
        <input type="text" className="form-input" placeholder="أدخل رقم الباركود" value={barcode} onChange={e => { setBarcode(e.target.value); setForm({ ...form, barcode: e.target.value }); }} />
        <button className="btn btn-secondary" type="button" onClick={startBarcodeScan}>مسح الباركود بالكاميرا</button>
      </div>
      {scanning && <div ref={videoRef} id="barcode-scanner" style={{ width: 300, height: 300 }} />}
      <div className="form-group">
        <label className="form-label">حد التنبيه للمخزون المنخفض</label>
        <input type="number" className="form-input" placeholder="5" onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
      </div>
    </form>
    <div className="modal-footer">
      <button className="btn btn-primary" type="button" onClick={onSubmit}>
        <Plus className="w-4 h-4" />
        إضافة المنتج
      </button>
      <button className="btn btn-secondary" type="button" onClick={onClose}>
        إلغاء
      </button>
    </div>
  </Modal>
);

export default AddProductModal;
