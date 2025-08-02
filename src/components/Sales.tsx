import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Scan, Trash2 } from 'lucide-react';

interface Sale {
  id: number;
  product: string;
  quantity: number;
  total: number;
  date: string;
  time: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  category?: string;
}

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/sales')
      .then(res => res.json())
      .then(data => setSales(data));
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

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

  const completeSale = async () => {
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
        body: JSON.stringify({ quantity: item.quantity * -1 })
      });
    }
    setCart([]);
    setShowSaleModal(false);
    fetch('http://localhost:4000/sales')
      .then(res => res.json())
      .then(data => setSales(data));
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    alert('تم إتمام البيع بنجاح!');
  };

  const filteredSales = sales.filter(sale =>
    sale.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">سجل المبيعات</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowSaleModal(true)}>
            <ShoppingCart className="w-4 h-4" />
            بيع جديد ({cart.length})
          </button>
        </div>
      </div>
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">جدول المبيعات</h3>
          <div className="relative">
            <Search className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المبيعات..."
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
                  <th>الكمية</th>
                  <th>السعر الإجمالي</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.product}</td>
                    <td>{sale.quantity}</td>
                    <td>{sale.total} دج</td>
                    <td>{sale.date}</td>
                    <td>{sale.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default Sales;
