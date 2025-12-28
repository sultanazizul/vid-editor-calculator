import { Client } from 'pg';
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const dbUrl = process.env.DATABASE_URL;
    const results = {
        env: {
            exists: !!dbUrl,
            len: dbUrl ? dbUrl.length : 0
        },
        pg: 'pending',
        neon: 'pending'
    };

    // Test pg Client
    try {
        const client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false }
        });
        await client.connect();
        const resPg = await client.query('SELECT 1 as val');
        await client.end();
        results.pg = `Success: ${resPg.rows[0].val}`;
    } catch (err) {
        results.pg = `Error: ${err.message}`;
    }

    // Test neon HTTP
    try {
        const sql = neon(dbUrl);
        const resNeon = await sql`SELECT 1 as val`;
        results.neon = `Success: ${resNeon[0].val}`;
    } catch (err) {
        results.neon = `Error: ${err.message}`;
    }

    res.json(results);
}
