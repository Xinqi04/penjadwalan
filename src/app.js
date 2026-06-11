require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const apiKeyMiddleware = require('./middleware/apiKey.middleware');

// Import routes
const scheduleRoutes = require('./routes/schedule.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const reportRoutes = require('./routes/report.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Sistem Penjadwalan API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistem Penjadwalan Sekolah API',
    docs: '/api-docs',
  });
});

// API Key middleware 
app.use('/api', apiKeyMiddleware);

// Routes — register specific routes SEBELUM route generic /:id
app.use('/api/schedules', uploadRoutes);
app.use('/api/schedules', studentRoutes);
app.use('/api/schedules', teacherRoutes);
app.use('/api/schedules', reportRoutes);
app.use('/api/schedules', scheduleRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
});

module.exports = app;
