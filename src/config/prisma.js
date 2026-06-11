const { PrismaClient } = require('@prisma/client');

// Singleton pattern untuk Prisma Client
const prisma = new PrismaClient();

module.exports = prisma;
