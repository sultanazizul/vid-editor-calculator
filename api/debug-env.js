export default function handler(req, res) {
    const dbUrl = process.env.DATABASE_URL;
    res.json({
        hasUrl: !!dbUrl,
        length: dbUrl ? dbUrl.length : 0,
        startsWith: dbUrl ? dbUrl.substring(0, 15) : 'N/A',
        endChar: dbUrl ? dbUrl.slice(-1) : 'N/A',
        containsQuotes: dbUrl ? (dbUrl.includes('"') || dbUrl.includes("'")) : false,
        parsed: 'Debugging env var'
    });
}
