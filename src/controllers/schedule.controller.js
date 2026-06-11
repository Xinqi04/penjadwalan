const scheduleService = require('../services/schedule.service');

const getAll = async (req, res) => {
  try {
    const data = await scheduleService.getAllSchedules();
    res.json({ success: true, message: 'Data jadwal berhasil diambil', data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data jadwal', error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await scheduleService.getScheduleById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }
    res.json({ success: true, message: 'Detail jadwal berhasil diambil', data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail jadwal', error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const result = await scheduleService.createSchedule(req.body);

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: result.conflict.message,
        error: result.conflict,
      });
    }

    res.status(201).json({ success: true, message: 'Jadwal berhasil dibuat', data: result.schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat jadwal', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const result = await scheduleService.updateSchedule(req.params.id, req.body);

    if (result.notFound) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: result.conflict.message,
        error: result.conflict,
      });
    }

    res.json({ success: true, message: 'Jadwal berhasil diperbarui', data: result.schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal', error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await scheduleService.deleteSchedule(req.params.id);

    if (result.notFound) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }

    res.json({ success: true, message: 'Jadwal berhasil dihapus', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal', error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
