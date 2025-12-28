import React, { useState, useEffect } from 'react';
import {
    DollarSign, Zap, FileVideo, Layers, Type, Save,
    Trash2, History, Mic, Film, Scissors, Sparkles, ChevronRight, Clock,
    User, ChevronDown, X
} from 'lucide-react';
import * as api from '../api';

export default function CalculatorPage({ history, setHistory, editors, rates, formatIDR, apiConnected }) {
    const [projectName, setProjectName] = useState('');
    const [selectedEditor, setSelectedEditor] = useState('');
    const [mainCategory, setMainCategory] = useState('rough');
    const [roughSubType, setRoughSubType] = useState('video');
    const [duration, setDuration] = useState(1);

    const [isRush, setIsRush] = useState(false);
    const [isNoAssets, setIsNoAssets] = useState(false);
    const [isComplex, setIsComplex] = useState(false);
    const [hasSubtitles, setHasSubtitles] = useState(false);
    const [isBuyout, setIsBuyout] = useState(false);

    const [totalFee, setTotalFee] = useState(0);
    const [breakdown, setBreakdown] = useState({ base: 0, durationCost: 0, addons: 0, multiplierTotal: 0 });
    const [saving, setSaving] = useState(false);

    // Auto-select editor if only one exists
    useEffect(() => {
        if (editors.length === 1 && !selectedEditor) {
            setSelectedEditor(editors[0].id.toString());
        }
    }, [editors, selectedEditor]);

    const getRateKey = () => {
        if (mainCategory === 'full') return 'full_edit';
        return roughSubType === 'audio' ? 'rough_audio' : 'rough_video';
    };

    const currentRateKey = getRateKey();
    const currentRateData = rates[currentRateKey];

    useEffect(() => {
        let durationCost = duration > 1 ? (duration - 1) * currentRateData.extraPerMinute : 0;
        const subTotal = currentRateData.basePrice + durationCost;

        let multiplier = 0;
        if (isRush) multiplier += 0.30;
        if (isNoAssets) multiplier += 0.15;
        if (isComplex) multiplier += 0.40;
        if (isBuyout) multiplier += 0.50;

        const multiplierCost = subTotal * multiplier;
        let flatAddons = hasSubtitles ? 25000 : 0;
        const finalTotal = subTotal + multiplierCost + flatAddons;

        setTotalFee(finalTotal);
        setBreakdown({ base: currentRateData.basePrice, durationCost, multiplierTotal: multiplierCost, addons: flatAddons });
    }, [mainCategory, roughSubType, duration, isRush, isNoAssets, isComplex, hasSubtitles, isBuyout, currentRateData]);

    const handleSave = async () => {
        if (!projectName.trim()) {
            alert("Mohon isi nama project terlebih dahulu");
            return;
        }
        if (!selectedEditor) {
            alert("Mohon pilih editor terlebih dahulu");
            return;
        }
        setSaving(true);
        const editorInfo = editors.find(e => e.id === parseInt(selectedEditor));
        const tags = [isRush && 'Rush', isNoAssets && 'Cari Aset', isComplex && 'Advance', hasSubtitles && 'Subtitle', isBuyout && 'Buyout'].filter(Boolean);
        try {
            if (apiConnected) {
                const newProject = await api.createProject({
                    name: projectName.trim(),
                    type: currentRateData.label,
                    duration,
                    total: totalFee,
                    tags,
                    editorId: parseInt(selectedEditor)
                });
                setHistory([newProject, ...history]);
            } else {
                const newEntry = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('id-ID'),
                    project: projectName,
                    type: currentRateData.label,
                    duration,
                    total: totalFee,
                    editorId: parseInt(selectedEditor),
                    editorName: editorInfo ? editorInfo.name : null,
                    tags
                };
                setHistory([newEntry, ...history]);
            }
            setProjectName('');
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Gagal menyimpan project.');
        } finally {
            setSaving(false);
        }
    };

    const clearHistory = async () => {
        if (confirm('Yakin hapus semua riwayat?')) {
            try {
                if (apiConnected) await api.deleteAllProjects();
                setHistory([]);
            } catch (error) {
                console.error('Error clearing history:', error);
            }
        }
    };

    const deleteItem = async (id) => {
        if (confirm('Hapus project ini dari riwayat?')) {
            try {
                if (apiConnected) await api.deleteProject(id);
                setHistory(history.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    // Color classes mapping (Tailwind doesn't support dynamic classes)
    const colorClasses = {
        amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-600' },
        violet: { bg: 'bg-violet-500', bgLight: 'bg-violet-50', ring: 'ring-violet-200', text: 'text-violet-600' },
        rose: { bg: 'bg-rose-500', bgLight: 'bg-rose-50', ring: 'ring-rose-200', text: 'text-rose-600' },
        emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-600' },
        red: { bg: 'bg-red-500', bgLight: 'bg-red-50', ring: 'ring-red-200', text: 'text-red-600' }
    };

    const conditions = [
        { key: 'isRush', value: isRush, setter: () => setIsRush(!isRush), icon: Zap, label: 'Rush Order', desc: 'Deadline ketat', color: 'amber', percent: '30%', fullOnly: false },
        { key: 'isNoAssets', value: isNoAssets, setter: () => setIsNoAssets(!isNoAssets), icon: FileVideo, label: 'Cari Aset', desc: 'Cari stock sendiri', color: 'violet', percent: '15%', fullOnly: true },
        { key: 'isComplex', value: isComplex, setter: () => setIsComplex(!isComplex), icon: Sparkles, label: 'High Complexity', desc: 'Motion graphic, efek', color: 'rose', percent: '40%', fullOnly: true },
        { key: 'hasSubtitles', value: hasSubtitles, setter: () => setHasSubtitles(!hasSubtitles), icon: Type, label: 'Manual Subtitle', desc: 'Teks manual', color: 'emerald', flat: 'Rp25rb', fullOnly: true },
        { key: 'isBuyout', value: isBuyout, setter: () => setIsBuyout(!isBuyout), icon: DollarSign, label: 'File Mentah', desc: 'Buyout project file', color: 'red', percent: '50%', fullOnly: true }
    ];

    // Filter conditions based on output type
    const visibleConditions = mainCategory === 'full'
        ? conditions
        : conditions.filter(c => !c.fullOnly);

    return (
        <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
            {/* Sticky Header */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Kalkulator Fee</h2>
                    <p className="text-slate-500 text-sm">Hitung estimasi biaya editing</p>
                </div>
                <div className="text-right bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30">
                    <p className="text-xs text-white/80">Total Estimasi</p>
                    <p className="text-2xl font-bold">{formatIDR(totalFee)}</p>
                </div>
            </div>

            {/* Main Content with Independent Scroll */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Panel - Calculator (Scrollable) */}
                <div className="lg:col-span-7 overflow-y-auto pr-2 custom-scrollbar space-y-5 pb-4">
                    {/* Project Name & Editor */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-3 block">Nama Project <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Contoh: Video Vlog Bali"
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-3 block flex items-center gap-2">
                                    <User size={14} className="text-slate-400" /> Editor <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedEditor}
                                        onChange={(e) => setSelectedEditor(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                                        required
                                    >
                                        <option value="">Pilih Editor</option>
                                        {editors.map(editor => (
                                            <option key={editor.id} value={editor.id}>{editor.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {editors.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2">⚠️ Belum ada editor. Tambah di menu Master Data → Editor</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Type */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <label className="text-sm font-semibold text-slate-700 mb-4 block">Jenis Output</label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMainCategory('rough')}
                                className={`relative p-4 rounded-xl border-2 transition-all group ${mainCategory === 'rough'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center transition-colors ${mainCategory === 'rough' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                    <Scissors size={24} />
                                </div>
                                <p className={`font-bold text-sm ${mainCategory === 'rough' ? 'text-indigo-700' : 'text-slate-600'}`}>Rough Cut</p>
                                <p className="text-xs text-slate-400 mt-0.5">Potong kasar</p>
                            </button>

                            <button
                                onClick={() => setMainCategory('full')}
                                className={`relative p-4 rounded-xl border-2 transition-all group ${mainCategory === 'full'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center transition-colors ${mainCategory === 'full' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                    <Film size={24} />
                                </div>
                                <p className={`font-bold text-sm ${mainCategory === 'full' ? 'text-purple-700' : 'text-slate-600'}`}>Full Editing</p>
                                <p className="text-xs text-slate-400 mt-0.5">Lengkap & polish</p>
                            </button>
                        </div>

                        {mainCategory === 'rough' && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl animate-fade-in">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Tipe Media:</p>
                                <div className="flex gap-2">
                                    {[
                                        { key: 'audio', icon: Mic, label: 'Audio' },
                                        { key: 'video', icon: FileVideo, label: 'Video' }
                                    ].map(({ key, icon: Icon, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setRoughSubType(key)}
                                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${roughSubType === key
                                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                                                : 'text-slate-500 hover:bg-white/50'
                                                }`}
                                        >
                                            <Icon size={16} /> {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Duration */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" /> Durasi Final
                            </label>
                            <span className="text-lg font-bold gradient-text">{duration} menit</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="0.5"
                            value={duration}
                            onChange={(e) => setDuration(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>1m</span><span>15m</span><span>30m</span>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <label className="text-sm font-semibold text-slate-700 mb-4 block">Kondisi Tambahan</label>
                        <div className="space-y-2">
                            {visibleConditions.map(({ key, value, setter, icon: Icon, label, desc, color, percent, flat }) => {
                                const colors = colorClasses[color];
                                return (
                                    <label
                                        key={key}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${value ? `${colors.bgLight} ring-1 ${colors.ring}` : 'bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${value ? `${colors.bg} text-white` : 'bg-white text-slate-400 shadow-sm'
                                                }`}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{label}</p>
                                                <p className="text-xs text-slate-400">{desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold ${value ? colors.text : 'text-slate-400'}`}>
                                                {percent ? `+${percent}` : flat}
                                            </span>
                                            <input type="checkbox" checked={value} onChange={setter} />
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!selectedEditor || editors.length === 0}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 btn-press transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Simpan ke Riwayat
                    </button>
                </div>

                {/* Right Panel - Breakdown & History (Sticky/Fixed) */}
                <div className="lg:col-span-5 overflow-y-auto pr-2 custom-scrollbar space-y-5 pb-4">
                    {/* Cost Breakdown */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Layers size={18} className="text-indigo-500" /> Rincian Biaya
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Base Rate</p>
                                    <p className="text-xs text-slate-400">{currentRateData.label}</p>
                                </div>
                                <span className="font-mono font-bold text-slate-800">{formatIDR(breakdown.base)}</span>
                            </div>

                            {breakdown.durationCost > 0 && (
                                <div className="flex justify-between items-center p-3 rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Durasi Ekstra</p>
                                        <p className="text-xs text-slate-400">{duration - 1} menit × {formatIDR(currentRateData.extraPerMinute)}</p>
                                    </div>
                                    <span className="font-mono font-bold text-slate-800">+{formatIDR(breakdown.durationCost)}</span>
                                </div>
                            )}

                            {breakdown.multiplierTotal > 0 && (
                                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-bold text-amber-700">Biaya Tambahan</p>
                                        <span className="font-mono font-bold text-amber-600">+{formatIDR(breakdown.multiplierTotal)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {isRush && <span className="text-xs px-2 py-0.5 bg-white rounded-full text-amber-600">Rush +30%</span>}
                                        {isNoAssets && <span className="text-xs px-2 py-0.5 bg-white rounded-full text-violet-600">Aset +15%</span>}
                                        {isComplex && <span className="text-xs px-2 py-0.5 bg-white rounded-full text-rose-600">Complex +40%</span>}
                                        {isBuyout && <span className="text-xs px-2 py-0.5 bg-white rounded-full text-red-600">Buyout +50%</span>}
                                    </div>
                                </div>
                            )}

                            {breakdown.addons > 0 && (
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-sm font-bold text-emerald-700">Add-ons (Subtitle)</p>
                                    <span className="font-mono font-bold text-emerald-600">+{formatIDR(breakdown.addons)}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800">Total Fee</span>
                                <span className="text-xl font-bold gradient-text">{formatIDR(totalFee)}</span>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <History size={18} className="text-slate-400" /> Riwayat Terbaru
                            </h3>
                            {history.length > 0 && (
                                <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
                                    <Trash2 size={12} /> Hapus
                                </button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="text-center py-8">
                                <History size={28} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-slate-400 text-sm">Belum ada riwayat</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {history.slice(0, 10).map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors animate-slide-up group"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-slate-800 truncate text-sm">{item.project}</p>
                                                {item.editorName && (
                                                    <p className="text-xs text-indigo-600 flex items-center gap-1">
                                                        <User size={10} /> {item.editorName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono font-bold text-indigo-600 text-sm">{formatIDR(item.total)}</span>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                                                    title="Hapus"
                                                >
                                                    <X size={14} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            {item.type} <ChevronRight size={10} /> {item.duration}m <ChevronRight size={10} /> {item.date}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
