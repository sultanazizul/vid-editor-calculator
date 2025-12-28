import React, { useState, useMemo } from 'react';
import {
    FileText, Download, Calendar, Printer, User,
    ChevronDown, Building2, ChevronLeft, ChevronRight, X, Mail, FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Month Picker Component
function MonthPicker({ value, onChange, maxDate, label, isStart }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => {
        const [year] = value.split('-');
        return parseInt(year);
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const maxYear = maxDate ? parseInt(maxDate.split('-')[0]) : currentYear;
    const maxMonth = maxDate ? parseInt(maxDate.split('-')[1]) - 1 : currentMonth;

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    const formatDisplay = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    const isDisabled = (monthIdx) => {
        if (viewYear > currentYear) return true;
        if (viewYear === currentYear && monthIdx > currentMonth) return true;
        return false;
    };

    const handleSelect = (monthIdx) => {
        if (isDisabled(monthIdx)) return;
        const newValue = `${viewYear}-${String(monthIdx + 1).padStart(2, '0')}`;
        onChange(newValue);
        setIsOpen(false);
    };

    const isSelected = (monthIdx) => {
        const [selectedYear, selectedMonth] = value.split('-').map(Number);
        return viewYear === selectedYear && monthIdx === selectedMonth - 1;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-left flex items-center justify-between hover:bg-slate-100 transition-all"
            >
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-500" />
                    <span className="font-medium text-slate-700">{formatDisplay(value)}</span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 animate-fade-in">
                        {/* Year Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setViewYear(viewYear - 1)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>
                            <span className="font-bold text-slate-800">{viewYear}</span>
                            <button
                                onClick={() => viewYear < currentYear && setViewYear(viewYear + 1)}
                                disabled={viewYear >= currentYear}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Months Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {months.map((month, idx) => (
                                <button
                                    key={month}
                                    onClick={() => handleSelect(idx)}
                                    disabled={isDisabled(idx)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${isSelected(idx)
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                        : isDisabled(idx)
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    onChange(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                Bulan Ini
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Invoice({ history, editors, formatIDR }) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [startMonth, setStartMonth] = useState(currentMonth);
    const [endMonth, setEndMonth] = useState(currentMonth);
    const [selectedEditor, setSelectedEditor] = useState('');
    const [companyName, setCompanyName] = useState('Sazporto');
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Handle start month change - ensure end is not before start
    const handleStartChange = (newStart) => {
        setStartMonth(newStart);
        if (newStart > endMonth) {
            setEndMonth(newStart);
        }
    };

    // Handle end month change - ensure it's not before start
    const handleEndChange = (newEnd) => {
        if (newEnd >= startMonth) {
            setEndMonth(newEnd);
        }
    };

    // Filter projects by date range AND editor
    const filteredProjects = useMemo(() => {
        return history.filter(item => {
            const [day, month, year] = item.date.split('/').map(Number);
            const itemMonth = `${year}-${String(month).padStart(2, '0')}`;
            const monthMatch = itemMonth >= startMonth && itemMonth <= endMonth;
            const editorMatch = !selectedEditor || item.editorId === parseInt(selectedEditor);
            return monthMatch && editorMatch;
        });
    }, [history, startMonth, endMonth, selectedEditor]);

    const totalAmount = filteredProjects.reduce((sum, item) => sum + item.total, 0);

    const selectedEditorData = editors.find(e => e.id === parseInt(selectedEditor));

    const formatMonthDisplay = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const formatMonthShort = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    const getPeriodDisplay = () => {
        if (startMonth === endMonth) {
            return formatMonthDisplay(startMonth);
        }
        return `${formatMonthShort(startMonth)} - ${formatMonthShort(endMonth)}`;
    };

    const generatePDF = () => {
        if (filteredProjects.length === 0) {
            alert('Tidak ada project untuk filter ini');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text('Fee Editor Video', pageWidth / 2, 32, { align: 'center' });

        // Invoice Info Box
        doc.setDrawColor(200);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 40, pageWidth - 28, 35, 3, 3, 'FD');

        doc.setTextColor(60);
        doc.setFontSize(10);

        // Left side - Editor
        doc.setFont('helvetica', 'bold');
        doc.text('Kepada:', 20, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(selectedEditorData?.name || 'Semua Editor', 20, 57);
        if (selectedEditorData?.email) {
            doc.setFontSize(8);
            doc.text(selectedEditorData.email, 20, 63);
            doc.setFontSize(10);
        }

        // Right side - Company
        doc.setFont('helvetica', 'bold');
        doc.text('Dari:', pageWidth - 70, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(companyName || 'Company Name', pageWidth - 70, 57);

        doc.setFont('helvetica', 'bold');
        doc.text('Periode:', 20, 68);
        doc.setFont('helvetica', 'normal');
        doc.text(getPeriodDisplay(), 45, 68);

        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal:', pageWidth - 70, 68);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString('id-ID'), pageWidth - 45, 68);

        // Table
        const tableData = filteredProjects.map((item, idx) => [
            idx + 1,
            item.project,
            item.type,
            `${item.duration}m`,
            item.tags.join(', ') || '-',
            formatIDR(item.total)
        ]);

        autoTable(doc, {
            startY: 85,
            head: [['No', 'Nama Project', 'Tipe', 'Durasi', 'Kondisi', 'Jumlah']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 50 },
                2: { cellWidth: 35 },
                3: { halign: 'center', cellWidth: 20 },
                4: { cellWidth: 35 },
                5: { halign: 'right', cellWidth: 30 }
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            }
        });

        // Total
        const finalY = (doc).lastAutoTable.finalY + 10;

        doc.setFillColor(99, 102, 241);
        doc.roundedRect(pageWidth - 80, finalY, 66, 20, 3, 3, 'F');

        doc.setTextColor(255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', pageWidth - 75, finalY + 8);
        doc.setFontSize(12);
        doc.text(formatIDR(totalAmount), pageWidth - 18, finalY + 15, { align: 'right' });

        // Footer
        doc.setTextColor(150);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Invoice dibuat pada ${new Date().toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 15,
            { align: 'center' }
        );

        // Save
        const editorNameForFile = selectedEditorData?.name?.replace(/\s+/g, '_') || 'All';
        const fileName = `Invoice_${editorNameForFile}_${startMonth}_to_${endMonth}.pdf`;
        doc.save(fileName);
    };

    return (
        <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
            {/* Sticky Header */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Invoice Generator</h2>
                    <p className="text-slate-500 text-sm">Buat invoice untuk editor</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={generatePDF}
                        disabled={filteredProjects.length === 0 || !selectedEditor || !companyName.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all"
                    >
                        <FileDown size={18} />
                        Export Invoice
                    </button>
                    {selectedEditorData?.email && (
                        <button
                            onClick={() => setShowEmailModal(true)}
                            disabled={filteredProjects.length === 0 || !selectedEditor}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all"
                            title="Kirim ke Email Editor"
                        >
                            <Mail size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Email Modal */}
            {showEmailModal && selectedEditorData && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setShowEmailModal(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-md shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Mail size={20} className="text-emerald-500" />
                                Kirim Invoice ke Editor
                            </h3>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-4">
                            <p className="text-sm text-slate-600"><strong>Kepada:</strong> {selectedEditorData.name}</p>
                            <p className="text-sm text-slate-500">{selectedEditorData.email}</p>
                            <p className="text-sm text-slate-600 mt-2"><strong>Periode:</strong> {getPeriodDisplay()}</p>
                            <p className="text-sm text-slate-600"><strong>Total:</strong> {formatIDR(totalAmount)}</p>
                        </div>

                        <p className="text-xs text-slate-400 mb-4">
                            💡 Ini akan membuka aplikasi email Anda dengan draft invoice. Pastikan untuk melampirkan file PDF invoice secara manual.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <a
                                href={`mailto:${selectedEditorData.email}?subject=Invoice Fee ${getPeriodDisplay()} - ${companyName}&body=Halo ${selectedEditorData.name},%0D%0A%0D%0ABerikut invoice untuk periode ${getPeriodDisplay()}.%0D%0A%0D%0ATotal: ${formatIDR(totalAmount)}%0D%0A%0D%0AMohon untuk melampirkan file PDF invoice secara terpisah.%0D%0A%0D%0ATerima kasih,%0D%0A${companyName}`}
                                onClick={() => setShowEmailModal(false)}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail size={16} />
                                Buka Email
                            </a>
                        </div>
                    </div>
                </>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-4">
                {/* Invoice Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-500" />
                        Detail Invoice
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">
                                <User size={14} className="inline mr-2" />
                                Pilih Editor <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedEditor}
                                    onChange={(e) => setSelectedEditor(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                                    required
                                >
                                    <option value="">-- Pilih Editor --</option>
                                    {editors.map(editor => (
                                        <option key={editor.id} value={editor.id}>{editor.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {!selectedEditor && (
                                <p className="text-xs text-amber-600 mt-2">⚠️ Pilih editor untuk membuat invoice</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">
                                <Building2 size={14} className="inline mr-2" />
                                Nama Perusahaan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Nama perusahaan/bisnis"
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Period Range with Calendar Picker */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">
                            Periode Pembayaran
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Dari Bulan</p>
                                <MonthPicker
                                    value={startMonth}
                                    onChange={handleStartChange}
                                    label="Mulai"
                                    isStart={true}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Sampai Bulan</p>
                                <MonthPicker
                                    value={endMonth}
                                    onChange={handleEndChange}
                                    label="Sampai"
                                    isStart={false}
                                />
                            </div>
                        </div>
                        {startMonth !== endMonth && (
                            <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                                <Calendar size={12} />
                                Periode: {getPeriodDisplay()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Printer size={18} className="text-slate-400" />
                            Preview Invoice
                        </h3>
                        <span className="text-sm text-slate-500">
                            {filteredProjects.length} project • {selectedEditorData?.name || 'Semua Editor'}
                        </span>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <FileText size={28} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-sm">Tidak ada project untuk filter ini</p>
                            <p className="text-slate-300 text-xs mt-1">Coba pilih editor atau periode lain</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Project</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Durasi</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                                            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-slate-800">{item.project}</p>
                                                    {item.editorName && !selectedEditor && (
                                                        <p className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5">
                                                            <User size={10} /> {item.editorName}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 text-sm">{item.type}</td>
                                                <td className="py-3 px-4 text-center text-slate-600 text-sm">{item.duration}m</td>
                                                <td className="py-3 px-4 text-slate-500 text-sm">{item.date}</td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">{formatIDR(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-end">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl">
                                    <p className="text-xs text-white/80 mb-1">Total Pembayaran</p>
                                    <p className="text-xl font-bold">{formatIDR(totalAmount)}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
