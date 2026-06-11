const prisma = require('../config/prisma');

/**
 * Ambil jadwal siswa berdasarkan kode kelas dan tanggal.
 * Diurutkan berdasarkan jam_ke.
 */
const getStudentSchedule = async (classCode, date) => {
  const schedules = await prisma.schedule.findMany({
    where: {
      class_code: classCode,
      date: new Date(date),
    },
    orderBy: { jam_ke: 'asc' },
  });

  return {
    class_name: schedules.length > 0 ? schedules[0].class_name : classCode,
    date: date,
    jadwal: schedules.map((s) => ({
      jam_ke: s.jam_ke,
      subject_code: s.subject_code,
      teacher_name: s.teacher_name,
      time_start: s.time_start,
      time_end: s.time_end,
    })),
  };
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

  return {
    teacher_name: schedules.length > 0 ? schedules[0].teacher_name : '-',
    periode: {
      start_date: startDate,
      end_date: endDate,
    },
    total_jp: schedules.length,
    jadwal: schedules.map((s) => {
      const d = new Date(s.date);
      const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        date: formattedDate,
        class_name: s.class_name,
        subject_code: s.subject_code,
        jam_ke: s.jam_ke,
        time_start: s.time_start,
        time_end: s.time_end,
      };
    }),
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

  // Kelompokkan per guru dan kelas
  const teacherMap = {};
  schedules.forEach((s) => {
    if (!teacherMap[s.teacher_nik]) {
      teacherMap[s.teacher_nik] = {
        teacher_nik: s.teacher_nik,
        teacher_name: s.teacher_name,
        total_jp: 0,
        classMap: {},
      };
    }

    const teacher = teacherMap[s.teacher_nik];
    teacher.total_jp += 1;

    if (!teacher.classMap[s.class_name]) {
      teacher.classMap[s.class_name] = 0;
    }
    teacher.classMap[s.class_name] += 1;
  });

  const rekap = Object.values(teacherMap).map((t) => {
    const detail = Object.entries(t.classMap).map(([className, count]) => ({
      class_name: className,
      jumlah_jp: count,
    })).sort((a, b) => a.class_name.localeCompare(b.class_name));

    return {
      teacher_nik: t.teacher_nik,
      teacher_name: t.teacher_name,
      total_jp: t.total_jp,
      total_kelas: detail.length,
      detail,
    };
  }).sort((a, b) => a.teacher_name.localeCompare(b.teacher_name));

  return {
    periode: {
      start_date: startDate,
      end_date: endDate,
    },
    total_pengajar: rekap.length,
    rekap,
  };
};

module.exports = { getStudentSchedule, getTeacherReport, getRekapJP };
