import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalculatorPage from './pages/Calculator';
import Invoice from './pages/Invoice';
import Editors from './pages/Editors';
import Rates from './pages/Rates';
import * as api from './api';

const DEFAULT_RATES = {
  rough_audio: { label: 'Rough Cut (Audio)', basePrice: 25000, extraPerMinute: 5000 },
  rough_video: { label: 'Rough Cut (Video)', basePrice: 40000, extraPerMinute: 10000 },
  full_edit: { label: 'Full Editing', basePrice: 100000, extraPerMinute: 20000 }
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  const [history, setHistory] = useState([]);
  const [editors, setEditors] = useState([]);
  const [rates, setRates] = useState(DEFAULT_RATES);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check API health
        const isConnected = await api.healthCheck();
        setApiConnected(isConnected);

        if (isConnected) {
          // Load from API
          const [projectsData, editorsData, ratesData] = await Promise.all([
            api.getProjects(),
            api.getEditors(),
            api.getRates()
          ]);

          setHistory(projectsData);
          setEditors(editorsData);

          // If rates exist in DB, use them; otherwise use defaults
          if (Object.keys(ratesData).length > 0) {
            setRates(ratesData);
          }
        } else {
          // Fallback to localStorage if API not available
          console.warn('API not available, using localStorage');
          const savedHistory = localStorage.getItem('editorFeeHistory');
          const savedEditors = localStorage.getItem('editorFeeEditors');
          const savedRates = localStorage.getItem('editorFeeRates');

          if (savedHistory) setHistory(JSON.parse(savedHistory));
          if (savedEditors) setEditors(JSON.parse(savedEditors));
          if (savedRates) setRates(JSON.parse(savedRates));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage on error
        const savedHistory = localStorage.getItem('editorFeeHistory');
        const savedEditors = localStorage.getItem('editorFeeEditors');
        const savedRates = localStorage.getItem('editorFeeRates');

        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedEditors) setEditors(JSON.parse(savedEditors));
        if (savedRates) setRates(JSON.parse(savedRates));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync to localStorage as backup (in case API is down)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('editorFeeHistory', JSON.stringify(history));
    }
  }, [history, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('editorFeeEditors', JSON.stringify(editors));
    }
  }, [editors, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('editorFeeRates', JSON.stringify(rates));
    }
  }, [rates, loading]);

  // API-aware state setters
  const handleSetHistory = async (newHistory) => {
    // If it's a function, call it with current history
    const resolvedHistory = typeof newHistory === 'function' ? newHistory(history) : newHistory;
    setHistory(resolvedHistory);
  };

  const handleSetEditors = (newEditors) => {
    const resolvedEditors = typeof newEditors === 'function' ? newEditors(editors) : newEditors;
    setEditors(resolvedEditors);
  };

  const handleSetRates = (newRates) => {
    const resolvedRates = typeof newRates === 'function' ? newRates(rates) : newRates;
    setRates(resolvedRates);
  };

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Memuat data...</p>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard history={history} formatIDR={formatIDR} />;
      case 'calculator':
        return <CalculatorPage history={history} setHistory={handleSetHistory} editors={editors} rates={rates} formatIDR={formatIDR} apiConnected={apiConnected} />;
      case 'editors':
        return <Editors editors={editors} setEditors={handleSetEditors} apiConnected={apiConnected} />;
      case 'rates':
        return <Rates rates={rates} setRates={handleSetRates} defaultRates={DEFAULT_RATES} apiConnected={apiConnected} />;
      case 'invoice':
        return <Invoice history={history} editors={editors} formatIDR={formatIDR} />;
      default:
        return <Dashboard history={history} formatIDR={formatIDR} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 min-h-screen lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-6xl mx-auto">
          {/* API Status Banner */}
          {!loading && !apiConnected && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              ⚠️ Tidak terkoneksi ke server. Data disimpan secara lokal. Jalankan <code className="bg-amber-100 px-1 rounded">npm run server</code> untuk persistensi database.
            </div>
          )}
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
