// Entry point for agenda-pacientes remote (dev harness)
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './bootstrap';

// Pages
import AgendaPage from './pages/AgendaPage';
import PatientListPage from './pages/PatientListPage';
import PatientDetailPage from './pages/PatientDetailPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 12 }}>
        <Link to="/agenda">Agenda</Link>
        <Link to="/patients">Pacientes</Link>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/agenda" replace />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}

