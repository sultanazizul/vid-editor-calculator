import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

let prisma;

export function getPrisma() {
    if (!prisma) {
        const sql = neon(process.env.DATABASE_URL);
        const adapter = new PrismaNeon(sql);
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}

export function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
