const ExcelJS = require('exceljs');

/**
 * Generate file Excel Rekap JP Pengajar.
 * Format tabel dinamis berdasarkan bulan:
 *
 * Row 1: No | NIK | Nama Pengajar | Kelas yg Diajar | Total Jam Pelajaran Per Pekan (merged) | Total JP
 * Row 2: (merged)                                    | Bulan 1 (merged) | Bulan 2 (merged)| (merged)
 * Row 3: (merged)                                    | Pekan 1..N       | Pekan 1..N      | (merged)
 * Row 4+: Data guru
 *
 * @param {Array} teacherData - Data rekap per guru (include monthlyData)
 * @param {Array} months - Daftar bulan {year, month, name, weekCount}
 * @returns {Buffer} Excel file buffer
 */
const generateRekapJPExcel = async (teacherData, months) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistem Penjadwalan';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Rekap JP Pengajar');

  // ===== Hitung total kolom pekan =====
  const totalWeekCols = months.reduce((sum, m) => sum + m.weekCount, 0);
  // Kolom: No(1) + NIK(2) + Nama(3) + Kelas(4) + [pekan cols] + TotalJP
  const FIXED_COLS = 4; // No, NIK, Nama Pengajar, Kelas yg Diajar
  const TOTAL_JP_COL = FIXED_COLS + totalWeekCols + 1;
  const TOTAL_COLS = TOTAL_JP_COL;

  // ===== Style constants =====
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


  // ===== Column widths =====
  sheet.getColumn(1).width = 5;   // No
  sheet.getColumn(2).width = 14;  // NIK
  sheet.getColumn(3).width = 28;  // Nama Pengajar
  sheet.getColumn(4).width = 22;  // Kelas yg Diajar

  // Kolom pekan
  for (let i = 1; i <= totalWeekCols; i++) {
    sheet.getColumn(FIXED_COLS + i).width = 10;
  }

  // Kolom Total JP
  sheet.getColumn(TOTAL_JP_COL).width = 10;

  // ===== Row 1-3: Header utama =====
  // Merge fixed columns (A1:A3, B1:B3, C1:C3, D1:D3)
  sheet.mergeCells(1, 1, 3, 1); // No
  sheet.mergeCells(1, 2, 3, 2); // NIK
  sheet.mergeCells(1, 3, 3, 3); // Nama Pengajar
  sheet.mergeCells(1, 4, 3, 4); // Kelas yg Diajar

  sheet.getCell(1, 1).value = 'No';
  sheet.getCell(1, 2).value = 'NIK';
  sheet.getCell(1, 3).value = 'Nama Pengajar';
  sheet.getCell(1, 4).value = 'Kelas yg Diajar';

  // Super-header "Total Jam Pelajaran Per Pekan" di Row 1
  if (totalWeekCols > 1) {
    sheet.mergeCells(1, FIXED_COLS + 1, 1, FIXED_COLS + totalWeekCols);
  }
  sheet.getCell(1, FIXED_COLS + 1).value = 'Total Jam Pelajaran Per Pekan';

  // Merge bulan headers di Row 2, pekan sub-headers di Row 3
  let colOffset = FIXED_COLS + 1; // mulai dari kolom 5
  months.forEach((m) => {
    const startCol = colOffset;
    const endCol = colOffset + m.weekCount - 1;

    // Merge nama bulan di row 2
    if (m.weekCount > 1) {
      sheet.mergeCells(2, startCol, 2, endCol);
    }
    sheet.getCell(2, startCol).value = m.name;

    // Sub-header pekan di row 3
    for (let w = 1; w <= m.weekCount; w++) {
      sheet.getCell(3, colOffset + w - 1).value = `Pekan ${w}`;
    }

    colOffset += m.weekCount;
  });

  // Merge Total JP (row 1-3)
  sheet.mergeCells(1, TOTAL_JP_COL, 3, TOTAL_JP_COL);
  sheet.getCell(1, TOTAL_JP_COL).value = 'Total JP';

  // ===== Style header rows 1, 2 & 3 =====
  for (let col = 1; col <= TOTAL_COLS; col++) {
    for (let row = 1; row <= 3; row++) {
      const cell = sheet.getCell(row, col);
      cell.font = headerFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
      cell.fill = col <= FIXED_COLS ? softBlueFill : yellowFill;
    }
  }

  // Set row height untuk header
  sheet.getRow(1).height = 22;
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;

  // ===== Data rows =====
  teacherData.forEach((teacher, index) => {
    const rowNum = index + 4; // mulai dari row 4
    const row = sheet.getRow(rowNum);

    // Fixed columns
    sheet.getCell(rowNum, 1).value = index + 1;
    sheet.getCell(rowNum, 2).value = teacher.teacher_nik;
    sheet.getCell(rowNum, 3).value = teacher.teacher_name;
    sheet.getCell(rowNum, 4).value = teacher.classes;

    // Pekan columns per bulan
    let dataColOffset = FIXED_COLS + 1;
    months.forEach((m) => {
      const monthKey = `${m.year}-${m.month}`;
      for (let w = 1; w <= m.weekCount; w++) {
        const jp = (teacher.monthlyData[monthKey] && teacher.monthlyData[monthKey][w]) || 0;
        sheet.getCell(rowNum, dataColOffset + w - 1).value = jp;
      }
      dataColOffset += m.weekCount;
    });

    // Total JP
    sheet.getCell(rowNum, TOTAL_JP_COL).value = teacher.total_jp;

    // Style setiap cell
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

    // Highlight Total JP kolom (kuning)
    sheet.getCell(rowNum, TOTAL_JP_COL).fill = yellowFill;
  });

  // ===== Freeze panes: fixed cols + header rows =====
  sheet.views = [
    { state: 'frozen', xSplit: FIXED_COLS, ySplit: 3, activeCell: 'E4' },
  ];

  return await workbook.xlsx.writeBuffer();
};

module.exports = { generateRekapJPExcel };
