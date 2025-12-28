// Load env first
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found!');
    process.exit(1);
}
console.log('✅ DATABASE_URL loaded');

// Import after env is loaded
const { default: express } = await import('express');
const { default: cors } = await import('cors');
const { PrismaClient } = await import('@prisma/client');
const { PrismaPg } = await import('@prisma/adapter-pg');
const pg = await import('pg');

const app = express();

// Use standard pg Pool
console.log('🔌 Creating database connection...');
const pool = new pg.default.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Test connection
try {
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Database connected!');
} catch (err) {
    console.error('❌ Database connection failed:', err.message);
}

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());

// ============ EDITORS ============

app.get('/api/editors', async (req, res) => {
    try {
        const editors = await prisma.editor.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(editors);
    } catch (error) {
        console.error('Error fetching editors:', error);
        res.status(500).json({ error: 'Failed to fetch editors' });
    }
});

app.post('/api/editors', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const editor = await prisma.editor.create({ data: { name, email, phone } });
        res.status(201).json(editor);
    } catch (error) {
        console.error('Error creating editor:', error);
        res.status(500).json({ error: 'Failed to create editor' });
    }
});

app.put('/api/editors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;
        const editor = await prisma.editor.update({ where: { id: parseInt(id) }, data: { name, email, phone } });
        res.json(editor);
    } catch (error) {
        console.error('Error updating editor:', error);
        res.status(500).json({ error: 'Failed to update editor' });
    }
});

app.delete('/api/editors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.editor.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Editor deleted' });
    } catch (error) {
        console.error('Error deleting editor:', error);
        res.status(500).json({ error: 'Failed to delete editor' });
    }
});

// ============ PROJECTS ============

app.get('/api/projects', async (req, res) => {
    try {
        const { editorId, startDate, endDate } = req.query;
        const where = {};
        if (editorId) where.editorId = parseInt(editorId);
        if (startDate && endDate) {
            where.date = { gte: new Date(startDate), lte: new Date(endDate) };
        }
        const projects = await prisma.project.findMany({ where, include: { editor: true }, orderBy: { createdAt: 'desc' } });
        const formattedProjects = projects.map(p => ({
            id: p.id, project: p.name, type: p.type, duration: p.duration, total: p.total, tags: p.tags,
            date: p.date.toLocaleDateString('id-ID'), editorId: p.editorId, editorName: p.editor?.name || null
        }));
        res.json(formattedProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { name, type, duration, total, tags, editorId } = req.body;
        const project = await prisma.project.create({
            data: { name, type, duration, total, tags, editorId: editorId ? parseInt(editorId) : null },
            include: { editor: true }
        });
        res.status(201).json({
            id: project.id, project: project.name, type: project.type, duration: project.duration,
            total: project.total, tags: project.tags, date: project.date.toLocaleDateString('id-ID'),
            editorId: project.editorId, editorName: project.editor?.name || null
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

app.delete('/api/projects', async (req, res) => {
    try {
        await prisma.project.deleteMany();
        res.json({ message: 'All projects deleted' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete all projects' });
    }
});

// ============ RATES ============

app.get('/api/rates', async (req, res) => {
    try {
        const rates = await prisma.rate.findMany();
        const ratesObj = {};
        rates.forEach(r => { ratesObj[r.key] = { label: r.label, basePrice: r.basePrice, extraPerMinute: r.extraPerMinute }; });
        res.json(ratesObj);
    } catch (error) {
        console.error('Error fetching rates:', error);
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
});

app.put('/api/rates', async (req, res) => {
    try {
        for (const [key, data] of Object.entries(req.body)) {
            await prisma.rate.upsert({
                where: { key },
                update: { label: data.label, basePrice: data.basePrice, extraPerMinute: data.extraPerMinute },
                create: { key, label: data.label, basePrice: data.basePrice, extraPerMinute: data.extraPerMinute }
            });
        }
        res.json({ message: 'Rates updated' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update rates' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
});
