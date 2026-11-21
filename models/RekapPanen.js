const mongoose = require('mongoose');

const biayaBahanSchema = new mongoose.Schema({
  tanggal: { type: String, required: true },
  namaItem: { type: String, required: true },
  kategori: { type: String, required: true },
  jumlah: { type: Number, required: true },
  satuan: { type: String, required: true },
  hargaSatuan: { type: Number, required: true },
  subtotal: { type: Number, default: 0 }
}, { _id: false });

const upahPekerjaSchema = new mongoose.Schema({
  tanggal: { type: String, required: true },
  tahap: { type: String, required: true },
  jumlahPekerja: { type: Number, required: true },
  hariKerja: { type: Number, required: true },
  upahHarian: { type: Number, required: true },
  subtotal: { type: Number, default: 0 }
}, { _id: false });

const penjualanItemSchema = new mongoose.Schema({
  tanggal: { type: String, required: true },
  tujuanJual: { type: String, required: true },
  jumlahKg: { type: Number, required: true },
  hargaPerKg: { type: Number, required: true },
  subtotal: { type: Number, default: 0 }
}, { _id: false });

const rekapPanenSchema = new mongoose.Schema({
  namaPeriode: {
    type: String,
    required: [true, 'Nama musim tanam wajib diisi']
  },
  rentangBulan: {
    type: String,
    required: true
  },
  luasLahanHektar: {
    type: Number,
    required: true,
    default: 2
  },
  status: {
    type: String,
    enum: ['Berjalan', 'Selesai'],
    default: 'Berjalan'
  },
  biayaBahan: [biayaBahanSchema],
  upahPekerja: [upahPekerjaSchema],
  hasilPanen: {
    totalPanenKg: { type: Number, default: 0 },
    totalTerjualKg: { type: Number, default: 0 },
    sisaPanenKg: { type: Number, default: 0 }
  },
  rincianPenjualan: [penjualanItemSchema],
  ringkasan: {
    totalBiayaBahan: { type: Number, default: 0 },
    totalUpahPekerja: { type: Number, default: 0 },
    totalModal: { type: Number, default: 0 },
    totalPendapatan: { type: Number, default: 0 },
    keuntunganBersih: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RekapPanen', rekapPanenSchema);