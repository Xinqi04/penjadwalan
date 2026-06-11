const reportService = require('../services/report.service');

const getTeacherSchedule = async (req, res) => {
  try {
    const { teacher_nik, start_date, end_date } = req.query;

    if (!teacher_nik || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter teacher_nik, start_date, dan end_date wajib diisi',
      });
    }

    const data = await reportService.getTeacherReport(teacher_nik, start_date, end_date);

    res.json({
      success: true,
      message: 'Data jadwal guru berhasil diambil',
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil jadwal guru', error: error.message });
  }
};

module.exports = { getTeacherSchedule };
