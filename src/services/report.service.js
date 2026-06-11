const prisma = require('../config/prisma');

/**
 * Ambil jadwal siswa berdasarkan kode kelas dan tanggal.
 * Diurutkan berdasarkan jam_ke.
 */
const getStudentSchedule = async (classCode, date) => {
  return prisma.schedule.findMany({
    where: {
      class_code: classCode,
      date: new Date(date),
    },
    orderBy: { jam_ke: 'asc' },
  });
};

/**
 * Ambil jadwal guru berdasarkan NIK dan rentang tanggal.
 * Return data guru, total JP, dan daftar jadwal.
 */
const getTeacherReport = async (teacherNik, startDate, endDate) => {
  const schedules = await prisma.schedule.findMany({
    where: {
      teacher_nik: teacherNik,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: [{ date: 'asc' }, { jam_ke: 'asc' }],
  });

  if (schedules.length === 0) {
    return {
      teacher_nik: teacherNik,
      teacher_name: '-',
      total_jp: 0,
      schedules: [],
    };
  }

  return {
    teacher_nik: teacherNik,
    teacher_name: schedules[0].teacher_name,
    total_jp: schedules.length,
    schedules,
  };
};

/**
 * Rekap JP seluruh guru dalam rentang tanggal.
 * Mengembalikan daftar guru beserta total JP masing-masing.
 */
const getRekapJP = async (startDate, endDate) => {
  const schedules = await prisma.schedule.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  // Kelompokkan per guru dan hitung JP
  const teacherMap = {};
  schedules.forEach((s) => {
    if (!teacherMap[s.teacher_nik]) {
      teacherMap[s.teacher_nik] = {
        teacher_nik: s.teacher_nik,
        teacher_name: s.teacher_name,
        total_jp: 0,
      };
    }
    teacherMap[s.teacher_nik].total_jp += 1;
  });

  return Object.values(teacherMap).sort((a, b) =>
    a.teacher_name.localeCompare(b.teacher_name)
  );
};

module.exports = { getStudentSchedule, getTeacherReport, getRekapJP };
