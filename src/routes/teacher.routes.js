const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');

/**
 * @swagger
 * /api/schedules/teacher:
 *   get:
 *     summary: Ambil jadwal guru berdasarkan NIK dan rentang tanggal
 *     tags: [Teacher]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_nik
 *         required: true
 *         schema:
 *           type: string
 *         description: NIK guru
 *         example: "1234567890"
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
 *         example: "2026-06-30"
 *     responses:
 *       200:
 *         description: Data guru, total JP, dan daftar jadwal
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
 *                     teacher_name:
 *                       type: string
 *                     periode:
 *                       type: object
 *                       properties:
 *                         start_date:
 *                           type: string
 *                         end_date:
 *                           type: string
 *                     total_jp:
 *                       type: integer
 *                     jadwal:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           class_name:
 *                             type: string
 *                           subject_code:
 *                             type: string
 *                           jam_ke:
 *                             type: integer
 *                           time_start:
 *                             type: string
 *                           time_end:
 *                             type: string
 *       400:
 *         description: Parameter tidak lengkap
 */
router.get('/teacher', teacherController.getTeacherSchedule);

module.exports = router;
