const reportService = require('../services/report.service');

const getStudentSchedule = async (req, res) => {
  try {
    const { class_code, date } = req.query;

    if (!class_code || !date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter class_code dan date wajib diisi',
      });
    }

    const data = await reportService.getStudentSchedule(class_code, date);

    res.json({
      success: true,
      message: 'Jadwal siswa berhasil diambil',
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil jadwal siswa', error: error.message });
  }
};

module.exports = { getStudentSchedule };
