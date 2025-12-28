import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

let prisma;

export function getPrisma() {
    if (!prisma) {
        console.log('🔌 Initializing Prisma with Neon Adapter (WebSocket)...');

        try {
            if (!process.env.DATABASE_URL) {
                throw new Error('DATABASE_URL is missing');
            }

            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            const adapter = new PrismaNeon(pool);

            prisma = new PrismaClient({ adapter });
            console.log('✅ Prisma Client initialized with Adapter');
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
