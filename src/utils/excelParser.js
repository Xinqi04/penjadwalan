const XLSX = require('xlsx');

/**
 * Parse buffer file Excel menjadi array of schedule data.
 * Kolom yang diharapkan: class_code, class_name, subject_code,
 * teacher_nik, teacher_name, date, jam_ke, time_start, time_end
 */
const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

  const schedules = rawData.map((row, index) => {
    const requiredFields = [
      'class_code',
      'class_name',
      'subject_code',
      'teacher_nik',
      'teacher_name',
      'date',
      'jam_ke',
      'time_start',
      'time_end',
    ];

    // Validasi field wajib
    for (const field of requiredFields) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        throw new Error(`Baris ${index + 2}: Kolom "${field}" tidak boleh kosong`);
      }
    }

    return {
      class_code: String(row.class_code).trim(),
      class_name: String(row.class_name).trim(),
      subject_code: String(row.subject_code).trim(),
      teacher_nik: String(row.teacher_nik).trim(),
      teacher_name: String(row.teacher_name).trim(),
      date: new Date(row.date),
      jam_ke: parseInt(row.jam_ke, 10),
      time_start: String(row.time_start).trim(),
      time_end: String(row.time_end).trim(),
    };
  });

  return schedules;
};

module.exports = { parseExcelBuffer };
