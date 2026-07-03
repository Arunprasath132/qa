import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import TestCaseGenerator from './pages/TestCaseGenerator';
import AutomationGenerator from './pages/AutomationGenerator';
import BugReportGenerator from './pages/BugReportGenerator';
import Dashboard from './pages/Dashboard';
import ScreenshotGenerator from './pages/ScreenshotGenerator';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const pages = {
    dashboard:  <Dashboard onNavigate={setActivePage} />,
    testcases:  <TestCaseGenerator />,
    automation: <AutomationGenerator />,
    bugreports: <BugReportGenerator />,
    screenshot: <ScreenshotGenerator />,
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Mobile header */}
      <div className="mobile-header">
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'white', fontSize: 18 }}>☰</button>
        <div style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.3px' }}>QAENGINE</div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <Sidebar
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); setSidebarOpen(false); }}
        darkMode={darkMode}
        toggleDark={() => setDarkMode(!darkMode)}
        isOpen={sidebarOpen}
      />

      <main className="main-content">
        {pages[activePage]}
      </main>

      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: {
          background: darkMode ? '#1e293b' : '#fff',
          color: darkMode ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        }
      }} />
    </div>
  );
}
