import { getPrisma, cors } from './_lib/prisma.js';

export default async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const prisma = getPrisma();
    const { id } = req.query;

    try {
        if (req.method === 'DELETE') {
            await prisma.project.delete({ where: { id: parseInt(id) } });
            return res.json({ message: 'Project deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
