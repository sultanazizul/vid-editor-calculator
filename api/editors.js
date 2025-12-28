import { getPrisma, cors } from './_lib/prisma.js';

export default async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log(`📥 API /editors request: ${req.method}`);

    try {
        const prisma = getPrisma();

        if (req.method === 'GET') {
            console.log('🔍 Fetching editors...');
            const editors = await prisma.editor.findMany({ orderBy: { createdAt: 'desc' } });
            console.log(`✅ Found ${editors.length} editors`);
            return res.json(editors);
        }

        if (req.method === 'POST') {
            const { name, email, phone } = req.body;
            console.log(`📝 Creating editor: ${name}`);
            const editor = await prisma.editor.create({ data: { name, email, phone } });
            console.log(`✅ Editor created: ${editor.id}`);
            return res.status(201).json(editor);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('❌ API Error detailed:', error);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({
            error: 'Server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
