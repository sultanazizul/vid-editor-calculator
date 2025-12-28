import { getPrisma, cors } from './_lib/prisma.js';

export default async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const prisma = getPrisma();

    try {
        if (req.method === 'GET') {
            const rates = await prisma.rate.findMany();
            const ratesObj = {};
            rates.forEach(r => {
                ratesObj[r.key] = { label: r.label, basePrice: r.basePrice, extraPerMinute: r.extraPerMinute };
            });
            return res.json(ratesObj);
        }

        if (req.method === 'PUT') {
            for (const [key, data] of Object.entries(req.body)) {
                await prisma.rate.upsert({
                    where: { key },
                    update: { label: data.label, basePrice: data.basePrice, extraPerMinute: data.extraPerMinute },
                    create: { key, label: data.label, basePrice: data.basePrice, extraPerMinute: data.extraPerMinute }
                });
            }
            return res.json({ message: 'Rates updated' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
