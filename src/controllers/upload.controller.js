const excelService = require('../services/excel.service');

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan. Upload file .xlsx' });
    }

    const result = await excelService.importFromExcel(req.file.buffer);

    res.status(201).json({
      success: true,
      message: `Berhasil mengimport ${result.success} data jadwal${result.failed > 0 ? `, gagal ${result.failed} data` : ''}`,
      data: { 
        imported_count: result.success,
        failed_count: result.failed,
        errors: result.errors,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Gagal mengimport data', error: error.message });
  }
};

const exportExcel = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter start_date dan end_date wajib diisi',
      });
    }

    const buffer = await excelService.exportToExcel(start_date, end_date);

    const filename = `jadwal_${start_date}_${end_date}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengexport data', error: error.message });
  }
};

module.exports = { uploadExcel, exportExcel };
