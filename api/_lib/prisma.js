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
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                console.error('❌ DATABASE_URL is missing in environment variables');
                throw new Error('DATABASE_URL is missing');
            }

            console.log(`🔗 Connecting to Pool with URL length: ${dbUrl.length}`);

            const pool = new Pool({ connectionString: dbUrl });
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
