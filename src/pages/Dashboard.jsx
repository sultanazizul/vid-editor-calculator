import React from 'react';
import {
    Wallet, TrendingUp, FileVideo, Calendar, ArrowUpRight, ArrowDownRight, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Dashboard({ history, formatIDR }) {
    // Format with minus sign for expenses
    const formatExpense = (amount) => `- ${formatIDR(amount)}`;

    const totalExpenses = history.reduce((sum, item) => sum + item.total, 0);
    const totalProjects = history.length;

    // Calculate monthly data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthProjects = history.filter(item => {
        const [day, month, year] = item.date.split('/').map(Number);
        return month - 1 === currentMonth && year === currentYear;
    });

    const thisMonthExpenses = thisMonthProjects.reduce((sum, item) => sum + item.total, 0);

    const lastMonthProjects = history.filter(item => {
        const [day, month, year] = item.date.split('/').map(Number);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return month - 1 === lastMonth && year === lastMonthYear;
    });

    const lastMonthExpenses = lastMonthProjects.reduce((sum, item) => sum + item.total, 0);

    const expenseChange = lastMonthExpenses > 0
        ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
        : thisMonthExpenses > 0 ? 100 : 0;

    // Group by editor type
    const byType = history.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.total;
        return acc;
    }, {});

    // Recent projects
    const recentProjects = history.slice(0, 5);

    // Export to Excel
    const exportToExcel = () => {
        if (history.length === 0) {
            alert('Belum ada data untuk di-export');
            return;
        }

        // Prepare data for Excel
        const exportData = history.map((item, index) => ({
            'No': index + 1,
            'Tanggal': item.date,
            'Nama Project': item.project,
            'Tipe': item.type,
            'Durasi (menit)': item.duration,
            'Editor': item.editorName || '-',
            'Tags': item.tags?.join(', ') || '-',
            'Total Fee': item.total
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },   // No
            { wch: 12 },  // Tanggal
            { wch: 30 },  // Nama Project
            { wch: 20 },  // Tipe
            { wch: 15 },  // Durasi
            { wch: 20 },  // Editor
            { wch: 25 },  // Tags
            { wch: 15 }   // Total Fee
        ];

        // Add summary row
        const summaryStartRow = exportData.length + 3;
        XLSX.utils.sheet_add_aoa(ws, [
            [''],
            ['RINGKASAN'],
            ['Total Project', totalProjects],
            ['Total Pengeluaran', totalExpenses],
            ['Rata-rata per Project', totalProjects > 0 ? Math.round(totalExpenses / totalProjects) : 0]
        ], { origin: `A${summaryStartRow}` });

        XLSX.utils.book_append_sheet(wb, ws, 'Data Project');

        // Generate filename with date
        const today = new Date().toLocaleDateString('id-ID').split('/').join('-');
        const filename = `Editor_Fee_Report_${today}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    };

    const statCards = [
        {
            label: 'Total Pengeluaran',
            value: formatExpense(totalExpenses),
            icon: Wallet,
            gradient: 'from-rose-500 to-pink-600',
            shadow: 'shadow-rose-500/20'
        },
        {
            label: 'Bulan Ini',
            value: formatExpense(thisMonthExpenses),
            subValue: expenseChange !== 0 ? `${expenseChange > 0 ? '+' : ''}${expenseChange}%` : null,
            subPositive: expenseChange <= 0,
            icon: Calendar,
            gradient: 'from-indigo-500 to-purple-600',
            shadow: 'shadow-indigo-500/20'
        },
        {
            label: 'Total Project',
            value: `${totalProjects}`,
            subValue: thisMonthProjects.length > 0 ? `${thisMonthProjects.length} bulan ini` : null,
            icon: FileVideo,
            gradient: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20'
        },
        {
            label: 'Rata-rata/Project',
            value: totalProjects > 0 ? formatExpense(totalExpenses / totalProjects) : formatExpense(0),
            icon: TrendingUp,
            gradient: 'from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/20'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
                    <p className="text-slate-500 text-sm">Overview pengeluaran fee editor</p>
                </div>
                <button
                    onClick={exportToExcel}
                    disabled={history.length === 0}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all"
                >
                    <FileSpreadsheet size={18} />
                    Export Excel
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, subValue, subPositive, icon: Icon, gradient, shadow }) => (
                    <div
                        key={label}
                        className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg ${shadow} card-hover`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Icon size={20} />
                            </div>
                            {subValue && (
                                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${subPositive ? 'bg-white/20' : 'bg-white/20'
                                    }`}>
                                    {subPositive ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                    {subValue}
                                </span>
                            )}
                        </div>
                        <p className="text-white/80 text-xs font-medium mb-1">{label}</p>
                        <p className="text-xl font-bold">{value}</p>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* By Type Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Pengeluaran per Tipe</h3>
                    {Object.keys(byType).length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(byType).map(([type, amount]) => {
                                const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
                                return (
                                    <div key={type}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">{type}</span>
                                            <span className="font-mono font-medium text-rose-600">{formatExpense(amount)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{percentage}% dari total</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Projects */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Project Terbaru</h3>
                    {recentProjects.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Belum ada project</p>
                    ) : (
                        <div className="space-y-3">
                            {recentProjects.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">{item.project}</p>
                                        <p className="text-xs text-slate-400">{item.type} • {item.date}</p>
                                    </div>
                                    <span className="font-mono font-bold text-rose-600 ml-3">{formatExpense(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
