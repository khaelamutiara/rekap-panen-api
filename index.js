const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const rekapPanenRoutes = require('./routes/rekapPanenRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route utama
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API RekapPanen aktif dan siap digunakan!' });
});

// Route CRUD RekapPanen
app.use('/api/rekap-panen', rekapPanenRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});