import { getPrisma, cors } from './_lib/prisma.js';

export default async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const prisma = getPrisma();

    try {
        if (req.method === 'GET') {
            const editors = await prisma.editor.findMany({ orderBy: { createdAt: 'desc' } });
            return res.json(editors);
        }

        if (req.method === 'POST') {
            const { name, email, phone } = req.body;
            const editor = await prisma.editor.create({ data: { name, email, phone } });
            return res.status(201).json(editor);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
