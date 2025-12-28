import React from 'react';
import {
    LayoutDashboard, Calculator, FileText, Users, Menu, X,
    Database, Settings
} from 'lucide-react';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Kalkulator', icon: Calculator },
    { id: 'invoice', label: 'Invoice', icon: FileText },
];

const masterDataItems = [
    { id: 'editors', label: 'Editor', icon: Users },
    { id: 'rates', label: 'Rate Card', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }) {
    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        w-64 bg-slate-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icon-192x192.png"
                            alt="Editor Fee"
                            className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/30"
                        />
                        <div>
                            <h1 className="font-bold text-lg">Editor Fee</h1>
                            <p className="text-xs text-slate-400">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {/* Main Menu */}
                    <div className="space-y-1">
                        {menuItems.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setActivePage(id);
                                    setIsOpen(false);
                                }}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${activePage === id
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }
                `}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Master Data Group */}
                    <div>
                        <div className="flex items-center gap-2 px-4 mb-2">
                            <Database size={14} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Master Data</span>
                        </div>
                        <div className="space-y-1">
                            {masterDataItems.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setActivePage(id);
                                        setIsOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${activePage === id
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="px-4 py-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-400">Editor Fee Calculator</p>
                        <p className="text-xs text-slate-500">v2.1.0 • PWA Ready</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
