const RekapPanen = require('../models/RekapPanen');

const hitungRekapOtomatis = (data) => {
  const biayaBahan = (data.biayaBahan || []).map((item) => {
    const jumlah = Number(item.jumlah) || 0;
    const hargaSatuan = Number(item.hargaSatuan) || 0;
    return {
      tanggal: item.tanggal,
      namaItem: item.namaItem,
      kategori: item.kategori,
      jumlah,
      satuan: item.satuan,
      hargaSatuan,
      subtotal: jumlah * hargaSatuan
    };
  });

  const upahPekerja = (data.upahPekerja || []).map((item) => {
    const jumlahPekerja = Number(item.jumlahPekerja) || 0;
    const hariKerja = Number(item.hariKerja) || 0;
    const upahHarian = Number(item.upahHarian) || 0;
    return {
      tanggal: item.tanggal,
      tahap: item.tahap,
      jumlahPekerja,
      hariKerja,
      upahHarian,
      subtotal: jumlahPekerja * hariKerja * upahHarian
    };
  });

  const rincianPenjualan = (data.rincianPenjualan || []).map((item) => {
    const jumlahKg = Number(item.jumlahKg) || 0;
    const hargaPerKg = Number(item.hargaPerKg) || 0;
    return {
      tanggal: item.tanggal,
      tujuanJual: item.tujuanJual,
      jumlahKg,
      hargaPerKg,
      subtotal: jumlahKg * hargaPerKg
    };
  });

  const totalPanenKg = Number(data.hasilPanen?.totalPanenKg ?? data.totalPanenKg) || 0;
  const totalTerjualKg = rincianPenjualan.reduce((total, item) => total + item.jumlahKg, 0);
  const sisaPanenKg = totalPanenKg - totalTerjualKg;


  const statusOtomatis = data.status || (totalPanenKg > 0 && sisaPanenKg <= 0 ? 'Selesai' : 'Berjalan');

  const totalBiayaBahan = biayaBahan.reduce((total, item) => total + item.subtotal, 0);
  const totalUpahPekerja = upahPekerja.reduce((total, item) => total + item.subtotal, 0);
  const totalModal = totalBiayaBahan + totalUpahPekerja;
  const totalPendapatan = rincianPenjualan.reduce((total, item) => total + item.subtotal, 0);
  const keuntunganBersih = totalPendapatan - totalModal;

  return {
    status: statusOtomatis,
    biayaBahan,
    upahPekerja,
    hasilPanen: {
      totalPanenKg,
      totalTerjualKg,
      sisaPanenKg
    },
    rincianPenjualan,
    ringkasan: {
      totalBiayaBahan,
      totalUpahPekerja,
      totalModal,
      totalPendapatan,
      keuntunganBersih
    }
  };
};

// 1. CREATE (Status 201)
const createRekapPanen = async (req, res) => {
  try {
    const { namaPeriode, rentangBulan, luasLahanHektar } = req.body;
    const hasilHitung = hitungRekapOtomatis(req.body);

    const rekapBaru = await RekapPanen.create({
      namaPeriode,
      rentangBulan,
      luasLahanHektar: luasLahanHektar || 2,
      ...hasilHitung
    });

    res.status(201).json({
      success: true,
      message: 'Data rekap panen berhasil dibuat',
      data: rekapBaru
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat data rekap panen',
      error: error.message
    });
  }
};

// 2. READ ALL + RINGKASAN TOTAL KESELURUHAN MUSIM (Status 200)
const getAllRekapPanen = async (req, res) => {
  try {
    const semuaData = await RekapPanen.find().sort({ createdAt: 1 });

    // Hitung akumulasi total dari seluruh musim tanam
    const ringkasanKeseluruhan = semuaData.reduce(
      (acc, musim) => {
        acc.totalPanenKgSemuaMusim += musim.hasilPanen.totalPanenKg;
        acc.totalTerjualKgSemuaMusim += musim.hasilPanen.totalTerjualKg;
        acc.totalBiayaBahanSemuaMusim += musim.ringkasan.totalBiayaBahan;
        acc.totalUpahPekerjaSemuaMusim += musim.ringkasan.totalUpahPekerja;
        acc.totalModalSemuaMusim += musim.ringkasan.totalModal;
        acc.totalPendapatanSemuaMusim += musim.ringkasan.totalPendapatan;
        acc.keuntunganBersihSemuaMusim += musim.ringkasan.keuntunganBersih;
        return acc;
      },
      {
        totalPanenKgSemuaMusim: 0,
        totalTerjualKgSemuaMusim: 0,
        totalBiayaBahanSemuaMusim: 0,
        totalUpahPekerjaSemuaMusim: 0,
        totalModalSemuaMusim: 0,
        totalPendapatanSemuaMusim: 0,
        keuntunganBersihSemuaMusim: 0
      }
    );

    res.status(200).json({
      success: true,
      jumlahMusim: semuaData.length,
      ringkasanKeseluruhan,
      dataPerMusim: semuaData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rekap panen',
      error: error.message
    });
  }
};

// 3. READ BY ID - Detail 1 Musim Spesifik (Status 200 / 404)
const getRekapPanenById = async (req, res) => {
  try {
    const data = await RekapPanen.findById(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Data rekap panen tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Format ID tidak valid / data tidak ditemukan'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// 4. UPDATE - Hanya bisa untuk musim yang masih "Berjalan" (Status 200 / 400 / 404)
const updateRekapPanen = async (req, res) => {
  try {
    const dataLama = await RekapPanen.findById(req.params.id);
    if (!dataLama) {
      return res.status(404).json({
        success: false,
        message: 'Data rekap panen tidak ditemukan'
      });
    }

    // jika musim panen sudah berstatus "Selesai"
    if (dataLama.status === 'Selesai') {
      return res.status(400).json({
        success: false,
        message: `Data "${dataLama.namaPeriode}" sudah berstatus Selesai (hasil panen sudah terjual semua) dan tidak dapat diubah lagi.`
      });
    }

    const dataGabungan = {
      namaPeriode: req.body.namaPeriode ?? dataLama.namaPeriode,
      rentangBulan: req.body.rentangBulan ?? dataLama.rentangBulan,
      luasLahanHektar: req.body.luasLahanHektar ?? dataLama.luasLahanHektar,
      status: req.body.status,
      biayaBahan: req.body.biayaBahan ?? dataLama.biayaBahan,
      upahPekerja: req.body.upahPekerja ?? dataLama.upahPekerja,
      totalPanenKg: req.body.hasilPanen?.totalPanenKg ?? req.body.totalPanenKg ?? dataLama.hasilPanen.totalPanenKg,
      rincianPenjualan: req.body.rincianPenjualan ?? dataLama.rincianPenjualan
    };

    const hasilHitungUlang = hitungRekapOtomatis(dataGabungan);

    const dataTerbaru = await RekapPanen.findByIdAndUpdate(
      req.params.id,
      {
        namaPeriode: dataGabungan.namaPeriode,
        rentangBulan: dataGabungan.rentangBulan,
        luasLahanHektar: dataGabungan.luasLahanHektar,
        ...hasilHitungUlang
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Data rekap panen berhasil diperbarui dan dihitung ulang',
      data: dataTerbaru
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Format ID tidak valid / data tidak ditemukan'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data rekap panen',
      error: error.message
    });
  }
};

// 5. DELETE (Status 200 / 404)
const deleteRekapPanen = async (req, res) => {
  try {
    const dataTerhapus = await RekapPanen.findByIdAndDelete(req.params.id);
    if (!dataTerhapus) {
      return res.status(404).json({
        success: false,
        message: 'Data rekap panen tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Data rekap panen berhasil dihapus',
      data: dataTerhapus
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Format ID tidak valid / data tidak ditemukan'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data rekap panen',
      error: error.message
    });
  }
};

module.exports = {
  createRekapPanen,
  getAllRekapPanen,
  getRekapPanenById,
  updateRekapPanen,
  deleteRekapPanen
};