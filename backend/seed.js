const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dashboard.db');

// بيانات افتراضية
const stats = [
  ['المشتركون النشطون', '142', '+12 هذا الشهر', 'positive', 'Users', 'blue'],
  ['الاشتراكات المنتهية', '8', 'تنتهي خلال أسبوع', 'negative', 'AlertTriangle', 'red'],
  ['حضور اليوم', '47', '+5 من أمس', 'positive', 'Calendar', 'green'],
  ['مبيعات اليوم', '4,250 دج', '+15% من أمس', 'positive', 'ShoppingCart', 'orange'],
];

const attendance = [
  ['أحمد محمد', '08:30', 'دخول'],
  ['فاطمة علي', '09:15', 'دخول'],
  ['خالد حسن', '10:00', 'خروج'],
  ['مريم سعيد', '10:30', 'دخول'],
  ['يوسف عمر', '11:00', 'دخول'],
];

const subscriptions = [
  ['سارة أحمد', 'اشتراك شهري عادي', '2024-01-15', 3],
  ['محمد علي', 'اشتراك 15 حصة', '2024-01-18', 6],
  ['نور الدين', 'اشتراك شهري مع جهاز المشي', '2024-01-20', 8],
];

db.serialize(() => {
  db.run('DELETE FROM stats');
  db.run('DELETE FROM attendance');
  db.run('DELETE FROM subscriptions');

  stats.forEach(s => {
    db.run('INSERT INTO stats (label, value, change, changeType, icon, color) VALUES (?, ?, ?, ?, ?, ?)', s);
  });
  attendance.forEach(a => {
    db.run('INSERT INTO attendance (name, time, type) VALUES (?, ?, ?)', a);
  });
  subscriptions.forEach(sub => {
    db.run('INSERT INTO subscriptions (name, plan, expires, daysLeft) VALUES (?, ?, ?, ?)', sub);
  });
});

db.close();
