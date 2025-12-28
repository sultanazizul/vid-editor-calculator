import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Use global variable to cache instance across hot reloads in serverless
let prisma;

export function getPrisma() {
    console.log('⚡️ getPrisma called');

    if (prisma) {
        console.log('📦 Reusing cached Prisma instance');
        return prisma;
    }

    console.log('🔌 Initializing NEW Prisma instance...');

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('❌ DATABASE_URL is missing in environment variables');
            throw new Error('DATABASE_URL is missing');
        }

        // Log masked URL for debugging credential issues
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
        console.log(`🔗 Connecting with URL: ${maskedUrl}`);

        const pool = new Pool({ connectionString: dbUrl });
        const adapter = new PrismaNeon(pool);

        prisma = new PrismaClient({ adapter });
        console.log('✅ Prisma Client initialized successfully');
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
