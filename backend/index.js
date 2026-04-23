require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const guruRoutes = require('./routes/guru');
const waliRoutes = require('./routes/wali');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/wali', waliRoutes);

app.get('/', (req, res) => {
  res.send('API Absensi Pesantren is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
