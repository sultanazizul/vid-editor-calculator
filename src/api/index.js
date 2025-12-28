// API Client for Editor Fee Calculator
// In production (Vercel), use relative /api path. In dev, use localhost:3001
const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// ============ EDITORS ============

export async function getEditors() {
    const res = await fetch(`${API_BASE}/editors`);
    if (!res.ok) throw new Error('Failed to fetch editors');
    return res.json();
}

export async function createEditor(data) {
    const res = await fetch(`${API_BASE}/editors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create editor');
    return res.json();
}

export async function updateEditor(id, data) {
    const res = await fetch(`${API_BASE}/editors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update editor');
    return res.json();
}

export async function deleteEditor(id) {
    const res = await fetch(`${API_BASE}/editors/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete editor');
    return res.json();
}

// ============ PROJECTS ============

export async function getProjects(filters = {}) {
    const params = new URLSearchParams();
    if (filters.editorId) params.append('editorId', filters.editorId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const url = `${API_BASE}/projects${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
}

export async function createProject(data) {
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
}

export async function deleteProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
}

export async function deleteAllProjects() {
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete all projects');
    return res.json();
}

// ============ RATES ============

export async function getRates() {
    const res = await fetch(`${API_BASE}/rates`);
    if (!res.ok) throw new Error('Failed to fetch rates');
    return res.json();
}

export async function updateRates(data) {
    const res = await fetch(`${API_BASE}/rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update rates');
    return res.json();
}

// ============ HEALTH CHECK ============

export async function healthCheck() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        return res.ok;
    } catch {
        return false;
    }
}
