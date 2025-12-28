import React, { useState } from 'react';
import {
    Settings, Save, RotateCcw, Scissors, Film, Mic
} from 'lucide-react';
import * as api from '../api';

export default function Rates({ rates, setRates, defaultRates, apiConnected }) {
    const [tempRates, setTempRates] = useState(rates);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleChange = (key, field, value) => {
        const numValue = parseInt(value) || 0;
        setTempRates(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: numValue
            }
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (apiConnected) {
                await api.updateRates(tempRates);
            }
            setRates(tempRates);
            setHasChanges(false);
            alert('Rate card berhasil disimpan!');
        } catch (error) {
            console.error('Error saving rates:', error);
            alert('Gagal menyimpan rate card.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (confirm('Reset semua rate ke default?')) {
            try {
                if (apiConnected) {
                    await api.updateRates(defaultRates);
                }
                setTempRates(defaultRates);
                setRates(defaultRates);
                setHasChanges(false);
            } catch (error) {
                console.error('Error resetting rates:', error);
            }
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Color classes mapping (Tailwind doesn't support dynamic classes)
    const colorClasses = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };

    const rateCards = [
        { key: 'rough_audio', label: 'Rough Cut (Audio)', icon: Mic, color: 'blue' },
        { key: 'rough_video', label: 'Rough Cut (Video)', icon: Scissors, color: 'indigo' },
        { key: 'full_edit', label: 'Full Editing', icon: Film, color: 'purple' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Rate Card</h2>
                    <p className="text-slate-500 text-sm">Atur base rate untuk setiap jenis output</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                    >
                        <RotateCcw size={16} /> Reset Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all"
                    >
                        <Save size={16} /> Simpan
                    </button>
                </div>
            </div>

            {/* Rate Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {rateCards.map(({ key, label, icon: Icon, color }) => {
                    const colors = colorClasses[color];
                    return (
                        <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{label}</h3>
                                    <p className="text-xs text-slate-400">{tempRates[key]?.label}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                                        Base Price (1 menit pertama)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                                        <input
                                            type="number"
                                            value={tempRates[key]?.basePrice || 0}
                                            onChange={(e) => handleChange(key, 'basePrice', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all text-right font-mono"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 text-right">
                                        {formatNumber(tempRates[key]?.basePrice || 0)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                                        Extra per Menit
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                                        <input
                                            type="number"
                                            value={tempRates[key]?.extraPerMinute || 0}
                                            onChange={(e) => handleChange(key, 'extraPerMinute', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all text-right font-mono"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 text-right">
                                        {formatNumber(tempRates[key]?.extraPerMinute || 0)} /menit
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Preview (5 menit):</p>
                                <p className="font-mono font-bold text-lg text-slate-800">
                                    Rp {formatNumber((tempRates[key]?.basePrice || 0) + (4 * (tempRates[key]?.extraPerMinute || 0)))}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                    <strong>💡 Catatan:</strong> Perubahan rate hanya berlaku untuk project baru. Project yang sudah tersimpan tidak terpengaruh.
                </p>
            </div>
        </div>
    );
}
