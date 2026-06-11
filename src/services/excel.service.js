const prisma = require('../config/prisma');
const { parseExcelBuffer } = require('../utils/excelParser');
const { generateRekapJPExcel } = require('../utils/excelGenerator');
const scheduleService = require('./schedule.service');

/**
 * Import data jadwal dari buffer file Excel.
 * @param {Buffer} buffer - Buffer file Excel
 * @returns {Object} Hasil import (success count, failed count, errors list)
 */
const importFromExcel = async (buffer) => {
  const schedules = parseExcelBuffer(buffer);

  if (schedules.length === 0) {
    throw new Error('File Excel tidak berisi data');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i];
    const rowNum = i + 2; // +2 karena baris 1 adalah header

    // Cek bentrok (conflict)
    const conflict = await scheduleService.checkConflict(s);
    if (conflict) {
      results.failed++;
      results.errors.push(`Baris ${rowNum}: ${conflict.message}`);
      continue;
    }

    try {
      await prisma.schedule.create({
        data: {
          class_code: s.class_code,
          class_name: s.class_name,
          subject_code: s.subject_code,
          teacher_nik: s.teacher_nik,
          teacher_name: s.teacher_name,
          date: new Date(s.date),
          jam_ke: s.jam_ke,
          time_start: s.time_start,
          time_end: s.time_end,
        },
      });
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Baris ${rowNum}: ${error.message}`);
    }
  }

  if (results.failed > 0 && results.success === 0) {
    throw new Error(`Semua data gagal diimport:\n${results.errors.join('\n')}`);
  }

  return results;
};

/**
 * Nama bulan dalam Bahasa Indonesia.
 */
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/**
 * Hitung nomor pekan dalam bulan dari tanggal.
 * Pekan 1 = tanggal 1-7, Pekan 2 = 8-14, Pekan 3 = 15-21, Pekan 4 = 22-28, Pekan 5 = 29-31.
 */
const getWeekInMonth = (date) => {
  const day = new Date(date).getDate();
  return Math.min(Math.ceil(day / 7), 5);
};

/**
 * Buat daftar bulan yang tercakup dalam rentang tanggal.
 * Setiap bulan mencatat jumlah pekan (4 atau 5).
 * @returns {Array<{year, month, monthIndex, name, weekCount}>}
 */
const getMonthsInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = [];

  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const year = current.getFullYear();
    const monthIndex = current.getMonth();
    // Hitung jumlah hari di bulan ini
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    // Pekan 5 ada jika bulan punya lebih dari 28 hari
    const weekCount = daysInMonth > 28 ? 5 : 4;

    months.push({
      year,
      month: monthIndex + 1, // 1-12
      monthIndex,
      name: MONTH_NAMES[monthIndex],
      weekCount,
    });

    // Pindah ke bulan berikutnya
    current = new Date(year, monthIndex + 1, 1);
  }

  return months;
};

/**
 * Export data jadwal ke buffer file Excel.
 * Format: Rekap JP per guru dengan breakdown per bulan dan pekan.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Buffer} Excel buffer
 */
const exportToExcel = async (startDate, endDate) => {
  const schedules = await prisma.schedule.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: [{ date: 'asc' }, { jam_ke: 'asc' }],
  });

  // Tentukan bulan-bulan dalam rentang
  const months = getMonthsInRange(startDate, endDate);

  // Kelompokkan per guru, hitung JP per bulan per pekan, kumpulkan kelas
  const teacherMap = {};
  schedules.forEach((s) => {
    if (!teacherMap[s.teacher_nik]) {
      teacherMap[s.teacher_nik] = {
        teacher_nik: s.teacher_nik,
        teacher_name: s.teacher_name,
        classSet: new Set(),
        // Inisialisasi data per bulan per pekan
        monthlyData: {},
        total_jp: 0,
      };

      // Inisialisasi setiap bulan x pekan = 0
      months.forEach((m) => {
        const key = `${m.year}-${m.month}`;
        teacherMap[s.teacher_nik].monthlyData[key] = {};
        for (let w = 1; w <= m.weekCount; w++) {
          teacherMap[s.teacher_nik].monthlyData[key][w] = 0;
        }
      });
    }

    const teacher = teacherMap[s.teacher_nik];
    teacher.classSet.add(s.class_code);

    const schedDate = new Date(s.date);
    const monthKey = `${schedDate.getFullYear()}-${schedDate.getMonth() + 1}`;
    const weekNum = getWeekInMonth(s.date);

    if (teacher.monthlyData[monthKey] && weekNum >= 1 && weekNum <= 5) {
      teacher.monthlyData[monthKey][weekNum] = (teacher.monthlyData[monthKey][weekNum] || 0) + 1;
    }
    teacher.total_jp += 1;
  });

  // Format data untuk Excel generator
  const teacherData = Object.values(teacherMap).map((t) => ({
    teacher_nik: t.teacher_nik,
    teacher_name: t.teacher_name,
    classes: Array.from(t.classSet).sort().join(', '),
    monthlyData: t.monthlyData,
    total_jp: t.total_jp,
  }));

  // Urutkan berdasarkan nama
  teacherData.sort((a, b) => a.teacher_name.localeCompare(b.teacher_name));

  return generateRekapJPExcel(teacherData, months);
};

module.exports = { importFromExcel, exportToExcel };
