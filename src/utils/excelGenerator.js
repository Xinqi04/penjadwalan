const ExcelJS = require('exceljs');

/**
 * Generate file Excel Rekap JP Pengajar.
 * @param {Array} teacherData - Data rekap per guru (include monthlyData)
 * @param {Array} months - Daftar bulan {year, month, name, weekCount}
 * @returns {Buffer} Excel file buffer
 */
const generateRekapJPExcel = async (teacherData, months) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistem Penjadwalan';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Rekap JP Pengajar');

  // Total kolom pekan di sesuaikan dengan ada berapa bulan yang ada di range
  const totalWeekCols = months.reduce((sum, m) => sum + m.weekCount, 0);
  const FIXED_COLS = 4;
  const TOTAL_JP_COL = FIXED_COLS + totalWeekCols + 1;
  const TOTAL_COLS = TOTAL_JP_COL;

  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  const headerFont = { bold: true, size: 11, name: 'Calibri' };
  const dataFont = { size: 11, name: 'Calibri' };
  const centerAlign = { horizontal: 'center', vertical: 'middle', wrapText: true };
  const leftAlign = { vertical: 'middle', wrapText: true };

  const yellowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' },
  };

  const softBlueFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' },
  };


  // set lebar
  sheet.getColumn(1).width = 5;
  sheet.getColumn(2).width = 14;
  sheet.getColumn(3).width = 28;
  sheet.getColumn(4).width = 22;

  for (let i = 1; i <= totalWeekCols; i++) {
    sheet.getColumn(FIXED_COLS + i).width = 10;
  }

  sheet.getColumn(TOTAL_JP_COL).width = 10;

  // Header utama
  sheet.mergeCells(1, 1, 3, 1);
  sheet.mergeCells(1, 2, 3, 2);
  sheet.mergeCells(1, 3, 3, 3);
  sheet.mergeCells(1, 4, 3, 4);

  sheet.getCell(1, 1).value = 'No';
  sheet.getCell(1, 2).value = 'NIK';
  sheet.getCell(1, 3).value = 'Nama Pengajar';
  sheet.getCell(1, 4).value = 'Kelas yg Diajar';

  // header Total Jam Pelajaran Per Pekan 
  if (totalWeekCols > 1) {
    sheet.mergeCells(1, FIXED_COLS + 1, 1, FIXED_COLS + totalWeekCols);
  }
  sheet.getCell(1, FIXED_COLS + 1).value = 'Total Jam Pelajaran Per Pekan';

  // Merge bulan headers 
  let colOffset = FIXED_COLS + 1;
  months.forEach((m) => {
    const startCol = colOffset;
    const endCol = colOffset + m.weekCount - 1;

    // Merge nama bulan 
    if (m.weekCount > 1) {
      sheet.mergeCells(2, startCol, 2, endCol);
    }
    sheet.getCell(2, startCol).value = m.name;

    // Sub-header pekan 
    for (let w = 1; w <= m.weekCount; w++) {
      sheet.getCell(3, colOffset + w - 1).value = `Pekan ${w}`;
    }

    colOffset += m.weekCount;
  });

  sheet.mergeCells(1, TOTAL_JP_COL, 3, TOTAL_JP_COL);
  sheet.getCell(1, TOTAL_JP_COL).value = 'Total JP';

  for (let col = 1; col <= TOTAL_COLS; col++) {
    for (let row = 1; row <= 3; row++) {
      const cell = sheet.getCell(row, col);
      cell.font = headerFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
      cell.fill = col <= FIXED_COLS ? softBlueFill : yellowFill;
    }
  }

  // Set tinggi 
  sheet.getRow(1).height = 22;
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;

  // data
  teacherData.forEach((teacher, index) => {
    const rowNum = index + 4;
    const row = sheet.getRow(rowNum);

    sheet.getCell(rowNum, 1).value = index + 1;
    sheet.getCell(rowNum, 2).value = teacher.teacher_nik;
    sheet.getCell(rowNum, 3).value = teacher.teacher_name;
    sheet.getCell(rowNum, 4).value = teacher.classes;

    let dataColOffset = FIXED_COLS + 1;
    months.forEach((m) => {
      const monthKey = `${m.year}-${m.month}`;
      for (let w = 1; w <= m.weekCount; w++) {
        const jp = (teacher.monthlyData[monthKey] && teacher.monthlyData[monthKey][w]) || 0;
        sheet.getCell(rowNum, dataColOffset + w - 1).value = jp;
      }
      dataColOffset += m.weekCount;
    });

    sheet.getCell(rowNum, TOTAL_JP_COL).value = teacher.total_jp;

    for (let col = 1; col <= TOTAL_COLS; col++) {
      const cell = sheet.getCell(rowNum, col);
      cell.border = thinBorder;
      cell.font = dataFont;

      // Center alignment untuk No dan kolom angka (pekan + total)
      if (col === 1 || col >= FIXED_COLS + 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = leftAlign;
      }
    }

    sheet.getCell(rowNum, TOTAL_JP_COL).fill = yellowFill;
  });

  sheet.views = [
    { state: 'frozen', xSplit: FIXED_COLS, ySplit: 3, activeCell: 'E4' },
  ];

  return await workbook.xlsx.writeBuffer();
};

module.exports = { generateRekapJPExcel };
