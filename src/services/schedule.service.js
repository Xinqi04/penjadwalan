const prisma = require('../config/prisma');

/**
 * Cek bentrok jadwal guru dan kelas.
 * Overlap = (start1 < end2) AND (start2 < end1)
 * @param {Object} data - Data jadwal yang akan dicek
 * @param {string|null} excludeId - ID jadwal yang dikecualikan (untuk update)
 * @returns {Object|null} - Info conflict atau null jika tidak bentrok
 */
const checkConflict = async (data, excludeId = null) => {
  const dateValue = new Date(data.date);
  const baseWhere = {
    date: dateValue,
    time_start: { lt: data.time_end },
    time_end: { gt: data.time_start },
    ...(excludeId && { id: { not: excludeId } }),
  };

  // Cek bentrok guru
  const teacherConflict = await prisma.schedule.findFirst({
    where: {
      ...baseWhere,
      teacher_nik: data.teacher_nik,
    },
  });

  if (teacherConflict) {
    return {
      type: 'teacher',
      message: `Guru dengan NIK ${data.teacher_nik} sudah memiliki jadwal pada tanggal dan jam yang sama`,
      conflicting_schedule: teacherConflict,
    };
  }

  // Cek bentrok kelas
  const classConflict = await prisma.schedule.findFirst({
    where: {
      ...baseWhere,
      class_code: data.class_code,
    },
  });

  if (classConflict) {
    return {
      type: 'class',
      message: `Kelas ${data.class_code} sudah memiliki jadwal pada tanggal dan jam yang sama`,
      conflicting_schedule: classConflict,
    };
  }

  return null;
};

/**
 * Ambil semua jadwal
 */
const getAllSchedules = async () => {
  return prisma.schedule.findMany({
    orderBy: [{ date: 'asc' }, { jam_ke: 'asc' }],
  });
};

/**
 * Ambil jadwal berdasarkan ID
 */
const getScheduleById = async (id) => {
  return prisma.schedule.findUnique({ where: { id } });
};

/**
 * Buat jadwal baru dengan pengecekan bentrok
 */
const createSchedule = async (data) => {
  const conflict = await checkConflict(data);
  if (conflict) {
    return { conflict };
  }

  const schedule = await prisma.schedule.create({
    data: {
      class_code: data.class_code,
      class_name: data.class_name,
      subject_code: data.subject_code,
      teacher_nik: data.teacher_nik,
      teacher_name: data.teacher_name,
      date: new Date(data.date),
      jam_ke: parseInt(data.jam_ke, 10),
      time_start: data.time_start,
      time_end: data.time_end,
    },
  });

  return { schedule };
};

/**
 * Update jadwal dengan pengecekan bentrok
 */
const updateSchedule = async (id, data) => {
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing) {
    return { notFound: true };
  }

  const conflict = await checkConflict(data, id);
  if (conflict) {
    return { conflict };
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data: {
      class_code: data.class_code,
      class_name: data.class_name,
      subject_code: data.subject_code,
      teacher_nik: data.teacher_nik,
      teacher_name: data.teacher_name,
      date: new Date(data.date),
      jam_ke: parseInt(data.jam_ke, 10),
      time_start: data.time_start,
      time_end: data.time_end,
    },
  });

  return { schedule };
};

/**
 * Hapus jadwal berdasarkan ID
 */
const deleteSchedule = async (id) => {
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing) {
    return { notFound: true };
  }

  await prisma.schedule.delete({ where: { id } });
  return { deleted: true };
};

module.exports = {
  checkConflict,
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
