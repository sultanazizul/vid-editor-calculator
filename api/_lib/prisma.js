import { PrismaClient } from '@prisma/client';

let prisma;

export function getPrisma() {
    console.log('⚡️ getPrisma called');

    if (prisma) {
        console.log('📦 Reusing cached Prisma instance');
        return prisma;
    }

    console.log('🔌 Initializing NEW Vanilla Prisma instance...');

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('❌ DATABASE_URL is missing in environment variables');
            throw new Error('DATABASE_URL is missing');
        }

        // Log masked URL check
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
        console.log(`🔗 Connecting with URL: ${maskedUrl}`);

        // Standard initialization - Prisma reads DATABASE_URL from process.env internally
        // or we can pass it explicitly to datasources if needed, but standard usually works best.
        prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'], // VERBOSE logging
        });

        console.log('✅ Vanilla Prisma Client initialized');
    } catch (err) {
        console.error('❌ Error initializing Prisma:', err);
        throw err;
    }

    return prisma;
}

export function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
