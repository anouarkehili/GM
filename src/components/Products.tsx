import React, { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, Package, Scan, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from './Modal';
import AddProductModal from './AddProductModal';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  category?: string;
  lowStockThreshold?: number;
}

const Products = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>({});
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const videoRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    fetch('http://localhost:4000/sales')
      .then(res => res.json())
      .then(data => setSales(data));
  }, []);

  const handleAddProduct = async () => {
    await fetch('http://localhost:4000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        barcode: form.barcode || '',
        category: form.category || '',
        lowStockThreshold: Number(form.lowStockThreshold) || 5
      })
    });
    setShowAddModal(false);
    setForm({});
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const completeSale = async () => {
    // تسجيل كل عنصر في السلة كمبيعة جديدة وتحديث الكمية
    for (const item of cart) {
      await fetch('http://localhost:4000/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
          total: item.price * item.quantity,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        })
      });
      await fetch('http://localhost:4000/products/' + item.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: item.quantity * -1 }) // تقليل الكمية
      });
    }
    setCart([]);
    setShowSaleModal(false);
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    fetch('http://localhost:4000/sales')
      .then(res => res.json())
      .then(data => setSales(data));
    alert('تم إتمام البيع بنجاح!');
  };

  // مبيعات اليوم من قاعدة البيانات
  const todaySales = sales.filter(sale => {
    const today = new Date().toISOString().slice(0, 10);
    return sale.date === today;
  });

  const lowStockProducts = products.filter(product => product.quantity <= (product.lowStockThreshold || 5));
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((product.category || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalCart = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

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

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">إدارة المنتجات</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowSaleModal(true)}>
            <ShoppingCart className="w-4 h-4" />
            بيع جديد ({cart.length})
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            منتج جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-24">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{products.length}</h3>
          <p className="stat-label">إجمالي المنتجات</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{lowStockProducts.length}</h3>
          <p className="stat-label">منتجات قليلة المخزون</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <h3 className="stat-value">{todaySales.reduce((sum, sale) => sum + sale.total, 0)} دج</h3>
          <p className="stat-label">مبيعات اليوم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Products List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">قائمة المنتجات</h3>
              <div className="relative">
                <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المنتجات..."
                  className="form-input pr-40 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-content">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>اسم المنتج</th>
                      <th>الفئة</th>
                      <th>السعر</th>
                      <th>المخزون</th>
                      <th>الباركود</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="font-medium text-gray-900">{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.price} دج</td>
                        <td>
                          <span className={product.quantity <= (product.lowStockThreshold || 5) ? 'text-red-600 font-medium' : ''}>
                            {product.quantity}
                          </span>
                          {product.quantity <= (product.lowStockThreshold || 5) && (
                            <AlertTriangle className="inline w-4 h-4 text-red-500 mr-4" />
                          )}
                        </td>
                        <td>
                          {product.barcode ? (
                            <code className="text-sm bg-gray-100 px-8 py-4 rounded">{product.barcode}</code>
                          ) : (
                            <span className="text-gray-400">لا يوجد</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-8">
                            <button
                              onClick={() => addToCart(product)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">مبيعات اليوم</h3>
          </div>
          <div className="card-content">
            <div className="space-y-16">
              {todaySales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between py-8 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{sale.product}</p>
                    <p className="text-sm text-gray-500">الكمية: {sale.quantity}</p>
                    <p className="text-xs text-gray-400">{sale.time}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-green-600">{sale.total} دج</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 pt-16 border-t border-gray-200">
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span className="text-green-600">{todaySales.reduce((sum, sale) => sum + sale.total, 0)} دج</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mt-24 card border-orange-200 bg-orange-50">
          <div className="card-header">
            <h3 className="card-title text-orange-800">تنبيه: منتجات قليلة المخزون</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-12 bg-white rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-orange-600">متبقي: {product.quantity} قطعة</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">بيع جديد</h3>
              <button className="modal-close" onClick={() => setShowSaleModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                {/* Products Selection */}
                <div>
                  <div className="flex gap-12 mb-16">
                    <button className="btn btn-secondary flex-1">
                      <Search className="w-4 h-4" />
                      اختيار يدوي
                    </button>
                    <button className="btn btn-primary flex-1">
                      <Scan className="w-4 h-4" />
                      مسح باركود
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-8">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-12 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.price} دج</p>
                            <p className="text-xs text-gray-400">متوفر: {product.quantity}</p>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="btn btn-primary btn-sm"
                            disabled={product.quantity === 0}
                          >
                            إضافة
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cart */}
                <div>
                  <h4 className="font-semibold mb-16">سلة المشتريات</h4>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-32">السلة فارغة</p>
                  ) : (
                    <>
                      <div className="space-y-12 mb-16 max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-12 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.price} دج × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-8">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="btn btn-secondary btn-sm w-8 h-8 p-0"
                              >
                                -
                              </button>
                              <span className="font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="btn btn-secondary btn-sm w-8 h-8 p-0"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-16">
                        <div className="flex justify-between font-bold text-lg mb-16">
                          <span>الإجمالي:</span>
                          <span className="text-green-600">{getTotalCart()} دج</span>
                        </div>
                        <button
                          onClick={completeSale}
                          className="btn btn-success w-full"
                        >
                          إتمام البيع
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
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
  );
};

export default Products;