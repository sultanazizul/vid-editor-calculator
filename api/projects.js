import { getPrisma, cors } from './_lib/prisma.js';

export default async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const prisma = getPrisma();

    try {
        if (req.method === 'GET') {
            const { editorId, startDate, endDate } = req.query;
            const where = {};
            if (editorId) where.editorId = parseInt(editorId);
            if (startDate && endDate) {
                where.date = { gte: new Date(startDate), lte: new Date(endDate) };
            }
            const projects = await prisma.project.findMany({
                where,
                include: { editor: true },
                orderBy: { createdAt: 'desc' }
            });
            const formatted = projects.map(p => ({
                id: p.id, project: p.name, type: p.type, duration: p.duration,
                total: p.total, tags: p.tags, date: p.date.toLocaleDateString('id-ID'),
                editorId: p.editorId, editorName: p.editor?.name || null
            }));
            return res.json(formatted);
        }

        if (req.method === 'POST') {
            const { name, type, duration, total, tags, editorId } = req.body;
            const project = await prisma.project.create({
                data: { name, type, duration, total, tags, editorId: editorId ? parseInt(editorId) : null },
                include: { editor: true }
            });
            return res.status(201).json({
                id: project.id, project: project.name, type: project.type,
                duration: project.duration, total: project.total, tags: project.tags,
                date: project.date.toLocaleDateString('id-ID'),
                editorId: project.editorId, editorName: project.editor?.name || null
            });
        }

        if (req.method === 'DELETE') {
            await prisma.project.deleteMany();
            return res.json({ message: 'All projects deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
