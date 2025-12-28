import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

let prisma;

export function getPrisma() {
    if (!prisma) {
        console.log('🔌 Initializing Prisma Client...');
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL is missing in environment variables');
            throw new Error('DATABASE_URL is missing');
        }

        try {
            console.log('🔗 Connecting to Neon with HTTP driver...');
            const sql = neon(process.env.DATABASE_URL);
            const adapter = new PrismaNeon(sql);
            prisma = new PrismaClient({ adapter });
            console.log('✅ Prisma Client initialized');
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
