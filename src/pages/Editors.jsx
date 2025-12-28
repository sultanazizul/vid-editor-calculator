import React, { useState } from 'react';
import {
    Users, Plus, Edit2, Trash2, X, Check, User, Mail, Phone, Save
} from 'lucide-react';
import * as api from '../api';

export default function Editors({ editors, setEditors, apiConnected }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);

    const handleAdd = () => {
        setFormData({ name: '', email: '', phone: '' });
        setIsAdding(true);
        setEditingId(null);
    };

    const handleEdit = (editor) => {
        setFormData({ name: editor.name, email: editor.email || '', phone: editor.phone || '' });
        setEditingId(editor.id);
        setIsAdding(false);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('Nama editor harus diisi');
            return;
        }

        setSaving(true);
        try {
            if (isAdding) {
                if (apiConnected) {
                    const newEditor = await api.createEditor({
                        name: formData.name.trim(),
                        email: formData.email.trim() || null,
                        phone: formData.phone.trim() || null
                    });
                    setEditors([...editors, newEditor]);
                } else {
                    const newEditor = {
                        id: Date.now(),
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        createdAt: new Date().toISOString()
                    };
                    setEditors([...editors, newEditor]);
                }
            } else if (editingId) {
                if (apiConnected) {
                    const updated = await api.updateEditor(editingId, {
                        name: formData.name.trim(),
                        email: formData.email.trim() || null,
                        phone: formData.phone.trim() || null
                    });
                    setEditors(editors.map(e => e.id === editingId ? updated : e));
                } else {
                    setEditors(editors.map(e =>
                        e.id === editingId
                            ? { ...e, name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim() }
                            : e
                    ));
                }
            }

            setFormData({ name: '', email: '', phone: '' });
            setIsAdding(false);
            setEditingId(null);
        } catch (error) {
            console.error('Error saving editor:', error);
            alert('Gagal menyimpan editor. Silahkan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin hapus editor ini? Project yang sudah diassign tidak akan terpengaruh.')) {
            try {
                if (apiConnected) {
                    await api.deleteEditor(id);
                }
                setEditors(editors.filter(e => e.id !== id));
            } catch (error) {
                console.error('Error deleting editor:', error);
                alert('Gagal menghapus editor.');
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', email: '', phone: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Kelola Editor</h2>
                    <p className="text-slate-500 text-sm">Tambah dan kelola daftar editor</p>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 btn-press transition-all"
                >
                    <Plus size={18} />
                    Tambah Editor
                </button>
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        {isAdding ? <Plus size={18} className="text-indigo-500" /> : <Edit2 size={18} className="text-indigo-500" />}
                        {isAdding ? 'Tambah Editor Baru' : 'Edit Editor'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">
                                <User size={14} className="inline mr-2" />
                                Nama Editor *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nama lengkap"
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">
                                <Mail size={14} className="inline mr-2" />
                                Email (opsional)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">
                                <Phone size={14} className="inline mr-2" />
                                No. Telepon (opsional)
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="08xxxxxxxxxx"
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <X size={16} /> Batal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Simpan
                        </button>
                    </div>
                </div>
            )}

            {/* Editors List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-slate-400" />
                    Daftar Editor
                    <span className="text-sm font-normal text-slate-400">({editors.length})</span>
                </h3>

                {editors.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Users size={28} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm">Belum ada editor</p>
                        <p className="text-slate-300 text-xs mt-1">Klik "Tambah Editor" untuk menambahkan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {editors.map((editor) => (
                            <div
                                key={editor.id}
                                className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                                        {editor.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(editor)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(editor.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="font-bold text-slate-800">{editor.name}</h4>
                                {editor.email && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Mail size={12} /> {editor.email}
                                    </p>
                                )}
                                {editor.phone && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Phone size={12} /> {editor.phone}
                                    </p>
                                )}
                                <p className="text-xs text-slate-400 mt-2">Ditambahkan: {formatDate(editor.createdAt)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
