const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         class_code:
 *           type: string
 *           example: "X-A"
 *         class_name:
 *           type: string
 *           example: "X-A"
 *         subject_code:
 *           type: string
 *           example: "MTK"
 *         teacher_nik:
 *           type: string
 *           example: "1234567890"
 *         teacher_name:
 *           type: string
 *           example: "Budi Santoso"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-06-10"
 *         jam_ke:
 *           type: integer
 *           example: 1
 *         time_start:
 *           type: string
 *           example: "07:00"
 *         time_end:
 *           type: string
 *           example: "07:45"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ScheduleInput:
 *       type: object
 *       required:
 *         - class_code
 *         - class_name
 *         - subject_code
 *         - teacher_nik
 *         - teacher_name
 *         - date
 *         - jam_ke
 *         - time_start
 *         - time_end
 *       properties:
 *         class_code:
 *           type: string
 *           example: "X-A"
 *         class_name:
 *           type: string
 *           example: "X-A"
 *         subject_code:
 *           type: string
 *           example: "MTK"
 *         teacher_nik:
 *           type: string
 *           example: "1234567890"
 *         teacher_name:
 *           type: string
 *           example: "Budi Santoso"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-06-10"
 *         jam_ke:
 *           type: integer
 *           example: 1
 *         time_start:
 *           type: string
 *           example: "07:00"
 *         time_end:
 *           type: string
 *           example: "07:45"
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 */

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Ambil semua jadwal
 *     tags: [Schedules]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Daftar seluruh jadwal
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
 */
router.get('/', scheduleController.getAll);

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: Ambil jadwal berdasarkan ID
 *     tags: [Schedules]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID jadwal
 *     responses:
 *       200:
 *         description: Detail jadwal
 *       404:
 *         description: Jadwal tidak ditemukan
 */
router.get('/:id', scheduleController.getById);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Buat jadwal baru
 *     tags: [Schedules]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       201:
 *         description: Jadwal berhasil dibuat
 *       409:
 *         description: Jadwal bentrok (conflict)
 */
router.post('/', scheduleController.create);

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Update jadwal
 *     tags: [Schedules]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       200:
 *         description: Jadwal berhasil diperbarui
 *       404:
 *         description: Jadwal tidak ditemukan
 *       409:
 *         description: Jadwal bentrok (conflict)
 */
router.put('/:id', scheduleController.update);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Hapus jadwal
 *     tags: [Schedules]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Jadwal berhasil dihapus
 *       404:
 *         description: Jadwal tidak ditemukan
 */
router.delete('/:id', scheduleController.remove);

module.exports = router;
