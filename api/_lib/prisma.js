import { neon, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// WebSocket support is optional for HTTP driver but good to have compliant config
neonConfig.webSocketConstructor = ws;

let prisma;

export function getPrisma() {
    console.log('⚡️ getPrisma called');

    if (prisma) {
        console.log('📦 Reusing cached Prisma instance');
        return prisma;
    }

    console.log('🔌 Initializing NEW Prisma instance (HTTP Driver)...');

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('❌ DATABASE_URL is missing in environment variables');
            throw new Error('DATABASE_URL is missing');
        }

        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
        console.log(`🔗 Connecting with URL: ${maskedUrl}`);

        // Use neon() HTTP driver - confirmed working in debug-db.js
        const sql = neon(dbUrl);
        const adapter = new PrismaNeon(sql);

        prisma = new PrismaClient({ adapter });
        console.log('✅ Prisma Client initialized using HTTP driver');
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
