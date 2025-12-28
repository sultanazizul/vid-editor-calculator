import { PrismaClient } from '@prisma/client';

let prisma;

export function getPrisma() {
    if (!prisma) {
        console.log('🔌 Initializing Standard Prisma Client...');
        try {
            // With url = env("DATABASE_URL") in schema, 
            // Prisma Client automatically picks up process.env.DATABASE_URL
            // We don't need to pass anything to constructor unless overriding it.
            prisma = new PrismaClient();
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
