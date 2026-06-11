const reportService = require('../services/report.service');

const getRekapJP = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter start_date dan end_date wajib diisi',
      });
    }

    const data = await reportService.getRekapJP(start_date, end_date);

    res.json({
      success: true,
      message: 'Rekap JP guru berhasil diambil',
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil rekap JP', error: error.message });
  }
};

module.exports = { getRekapJP };
