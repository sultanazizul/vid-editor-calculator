import { PrismaClient } from '@prisma/client';

let prisma;

export function getPrisma() {
    if (!prisma) {
        console.log('🔌 Initializing Standard Prisma Client...');
        try {
            // Use standard Prisma Client without adapter first to test connectivity
            // This relies on schema.prisma `datasource db { provider = "postgresql" url = env("DATABASE_URL") }`
            // But in Prisma 7, I moved URL to constructor or config.
            // Let's modify schema to be standard or pass datasourceUrl here.

            prisma = new PrismaClient({
                datasourceUrl: process.env.DATABASE_URL,
            });
            console.log('✅ Standard Prisma Client initialized');
        } catch (err) {
            console.error('❌ Error initializing Prisma:', err);
            throw err;
        }
    }
    return prisma;
}

export function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
