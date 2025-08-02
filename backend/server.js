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
    type TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    plan TEXT,
    expires TEXT,
    daysLeft INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    quantity INTEGER
  )`);
};

initDb();

// API endpoints
app.get('/stats', (req, res) => {
  db.all('SELECT * FROM stats', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/attendance', (req, res) => {
  db.all('SELECT * FROM attendance ORDER BY id DESC LIMIT 5', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/subscriptions', (req, res) => {
  db.all('SELECT * FROM subscriptions ORDER BY daysLeft ASC LIMIT 3', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// إضافة مشترك جديد
app.post('/subscriptions', (req, res) => {
  const { name, plan, expires, daysLeft } = req.body;
  db.run(
    'INSERT INTO subscriptions (name, plan, expires, daysLeft) VALUES (?, ?, ?, ?)',
    [name, plan, expires, daysLeft],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, plan, expires, daysLeft });
    }
  );
});

// إضافة حضور جديد
app.post('/attendance', (req, res) => {
  const { name, time, type } = req.body;
  db.run(
    'INSERT INTO attendance (name, time, type) VALUES (?, ?, ?)',
    [name, time, type],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, time, type });
    }
  );
});

// إضافة منتج جديد
app.post('/products', (req, res) => {
  const { name, price, quantity } = req.body;
  db.run(
    'INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)',
    [name, price, quantity],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, quantity });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
