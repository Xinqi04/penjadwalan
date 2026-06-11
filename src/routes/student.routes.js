const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

/**
 * @swagger
 * /api/schedules/student:
 *   get:
 *     summary: Ambil jadwal siswa berdasarkan kelas dan tanggal
 *     tags: [Student]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: class_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kode kelas (misal "X-A")
 *         example: "X-A"
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal jadwal
 *         example: "2025-06-10"
 *     responses:
 *       200:
 *         description: Daftar jadwal siswa diurutkan berdasarkan jam_ke
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Parameter tidak lengkap
 */
router.get('/student', studentController.getStudentSchedule);

module.exports = router;
