const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');

/**
 * @swagger
 * /api/schedules/upload:
 *   post:
 *     summary: Upload file Excel untuk import jadwal
 *     tags: [Upload]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel (.xlsx / .xls)
 *     responses:
 *       201:
 *         description: Data berhasil diimport
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported_count:
 *                       type: integer
 *       400:
 *         description: File tidak valid atau format salah
 */
router.post('/upload', upload.single('file'), uploadController.uploadExcel);

/**
 * @swagger
 * /api/schedules/export:
 *   get:
 *     summary: Export jadwal ke file Excel
 *     tags: [Upload]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai
 *         example: "2025-06-01"
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai
 *         example: "2025-06-30"
 *     responses:
 *       200:
 *         description: File Excel untuk di-download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parameter tidak lengkap
 */
router.get('/export', uploadController.exportExcel);

module.exports = router;
