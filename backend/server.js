const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// إنشاء قاعدة البيانات
const db = new sqlite3.Database('./dashboard.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

// إنشاء الجداول إذا لم تكن موجودة
const initDb = () => {
  db.run(`CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    value TEXT,
    change TEXT,
    changeType TEXT,
    icon TEXT,
    color TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    time TEXT,
    type TEXT,
    date TEXT DEFAULT (date('now'))
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    plan TEXT,
    expires TEXT,
    daysLeft INTEGER,
    price REAL,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    quantity INTEGER,
    category TEXT,
    barcode TEXT,
    lowStockThreshold INTEGER DEFAULT 5,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER,
    productName TEXT,
    quantity INTEGER,
    unitPrice REAL,
    total REAL,
    date TEXT DEFAULT (date('now')),
    time TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (productId) REFERENCES products (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    category TEXT,
    date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now'))
  )`);
};

initDb();

// API endpoints

// Stats
app.get('/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // حساب الإحصائيات الديناميكية
  db.get('SELECT COUNT(*) as activeSubscribers FROM subscriptions WHERE status = "active"', [], (err, activeCount) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get('SELECT COUNT(*) as expiringCount FROM subscriptions WHERE daysLeft <= 7 AND status = "active"', [], (err, expiringCount) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get('SELECT COUNT(*) as todayAttendance FROM attendance WHERE date = ?', [today], (err, attendanceCount) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT SUM(total) as todaySales FROM sales WHERE date = ?', [today], (err, salesSum) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const stats = [
            {
              id: 1,
              label: 'المشتركون النشطون',
              value: activeCount.activeSubscribers.toString(),
              change: '+12 هذا الشهر',
              changeType: 'positive',
              icon: 'Users',
              color: 'blue'
            },
            {
              id: 2,
              label: 'الاشتراكات المنتهية',
              value: expiringCount.expiringCount.toString(),
              change: 'تنتهي خلال أسبوع',
              changeType: 'negative',
              icon: 'AlertTriangle',
              color: 'red'
            },
            {
              id: 3,
              label: 'حضور اليوم',
              value: attendanceCount.todayAttendance.toString(),
              change: '+5 من أمس',
              changeType: 'positive',
              icon: 'Calendar',
              color: 'green'
            },
            {
              id: 4,
              label: 'مبيعات اليوم',
              value: `${salesSum.todaySales || 0} دج`,
              change: '+15% من أمس',
              changeType: 'positive',
              icon: 'ShoppingCart',
              color: 'orange'
            }
          ];
          
          res.json(stats);
        });
      });
    });
  });
});

// Attendance
app.get('/attendance', (req, res) => {
  const { date } = req.query;
  const queryDate = date || new Date().toISOString().split('T')[0];
  
  db.all('SELECT * FROM attendance WHERE date = ? ORDER BY id DESC', [queryDate], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/attendance', (req, res) => {
  const { name, time, type } = req.body;
  const date = new Date().toISOString().split('T')[0];
  
  db.run(
    'INSERT INTO attendance (name, time, type, date) VALUES (?, ?, ?, ?)',
    [name, time, type, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, time, type, date });
    }
  );
});

// Subscriptions
app.get('/subscriptions', (req, res) => {
  db.all('SELECT * FROM subscriptions ORDER BY daysLeft ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/subscriptions', (req, res) => {
  const { name, plan, expires, daysLeft, price, phone, email } = req.body;
  
  db.run(
    'INSERT INTO subscriptions (name, plan, expires, daysLeft, price, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, plan, expires, daysLeft, price, phone, email],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, plan, expires, daysLeft, price, phone, email });
    }
  );
});

app.put('/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  const { name, plan, expires, daysLeft, price, phone, email, status } = req.body;
  
  db.run(
    'UPDATE subscriptions SET name = ?, plan = ?, expires = ?, daysLeft = ?, price = ?, phone = ?, email = ?, status = ? WHERE id = ?',
    [name, plan, expires, daysLeft, price, phone, email, status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Subscription updated successfully' });
    }
  );
});

app.delete('/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM subscriptions WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Subscription deleted successfully' });
  });
});

// Products
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/products', (req, res) => {
  const { name, price, quantity, category, barcode, lowStockThreshold } = req.body;
  
  db.run(
    'INSERT INTO products (name, price, quantity, category, barcode, lowStockThreshold) VALUES (?, ?, ?, ?, ?, ?)',
    [name, price, quantity, category, barcode, lowStockThreshold],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, quantity, category, barcode, lowStockThreshold });
    }
  );
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, category, barcode, lowStockThreshold } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, price = ?, quantity = ?, category = ?, barcode = ?, lowStockThreshold = ? WHERE id = ?',
    [name, price, quantity, category, barcode, lowStockThreshold, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product updated successfully' });
    }
  );
});

app.patch('/products/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  db.get('SELECT quantity FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const newQuantity = row.quantity + quantity;
    
    db.run('UPDATE products SET quantity = ? WHERE id = ?', [newQuantity, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product quantity updated successfully' });
    });
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted successfully' });
  });
});

// Sales
app.get('/sales', (req, res) => {
  const { date } = req.query;
  let query = 'SELECT * FROM sales ORDER BY created_at DESC';
  let params = [];
  
  if (date) {
    query = 'SELECT * FROM sales WHERE date = ? ORDER BY created_at DESC';
    params = [date];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/sales', (req, res) => {
  const { productId, quantity, unitPrice, total, time } = req.body;
  const date = new Date().toISOString().split('T')[0];
  
  // الحصول على اسم المنتج
  db.get('SELECT name FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run(
      'INSERT INTO sales (productId, productName, quantity, unitPrice, total, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productId, product.name, quantity, unitPrice, total, date, time],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, productId, productName: product.name, quantity, unitPrice, total, date, time });
      }
    );
  });
});

// Reports
app.get('/reports/monthly', (req, res) => {
  const { month, year } = req.query;
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();
  
  // إحصائيات شهرية
  db.get(`
    SELECT 
      COUNT(*) as newSubscribers,
      SUM(price) as subscriptionRevenue
    FROM subscriptions 
    WHERE strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?
  `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, subStats) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get(`
      SELECT 
        COUNT(*) as totalSales,
        SUM(total) as salesRevenue
      FROM sales 
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, salesStats) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get(`
        SELECT COUNT(*) as totalAttendance
        FROM attendance 
        WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
      `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, attendanceStats) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          newSubscribers: subStats.newSubscribers || 0,
          subscriptionRevenue: subStats.subscriptionRevenue || 0,
          totalSales: salesStats.totalSales || 0,
          salesRevenue: salesStats.salesRevenue || 0,
          totalAttendance: attendanceStats.totalAttendance || 0,
          totalRevenue: (subStats.subscriptionRevenue || 0) + (salesStats.salesRevenue || 0)
        });
      });
    });
  });
});

// Expenses
app.get('/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/expenses', (req, res) => {
  const { description, amount, category, date } = req.body;
  
  db.run(
    'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
    [description, amount, category, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, description, amount, category, date });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});