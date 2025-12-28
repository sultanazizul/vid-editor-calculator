import { getPrisma, cors } from './_lib/prisma.js';

export default async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const prisma = getPrisma();
    const { id } = req.query;

    try {
        if (req.method === 'PUT') {
            const { name, email, phone } = req.body;
            const editor = await prisma.editor.update({
                where: { id: parseInt(id) },
                data: { name, email, phone }
            });
            return res.json(editor);
        }

        if (req.method === 'DELETE') {
            await prisma.editor.delete({ where: { id: parseInt(id) } });
            return res.json({ message: 'Editor deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
