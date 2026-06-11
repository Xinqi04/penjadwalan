const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

/**
 * @swagger
 * /api/schedules/report/rekap-jp:
 *   get:
 *     summary: Rekap JP seluruh guru (untuk yayasan)
 *     tags: [Report]
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
 *         example: "2026-06-01"
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai
 *         example: "2026-06-30"
 *     responses:
 *       200:
 *         description: Rekap total JP seluruh guru
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
 *                     periode:
 *                       type: object
 *                       properties:
 *                         start_date:
 *                           type: string
 *                         end_date:
 *                           type: string
 *                     total_pengajar:
 *                       type: integer
 *                     rekap:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           teacher_nik:
 *                             type: string
 *                           teacher_name:
 *                             type: string
 *                           total_jp:
 *                             type: integer
 *                           total_kelas:
 *                             type: integer
 *                           detail:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 class_name:
 *                                   type: string
 *                                 jumlah_jp:
 *                                   type: integer
 *       400:
 *         description: Parameter tidak lengkap
 */
router.get('/report/rekap-jp', reportController.getRekapJP);

module.exports = router;
