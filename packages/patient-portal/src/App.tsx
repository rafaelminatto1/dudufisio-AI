import { Routes, Route, Navigate } from 'react-router-dom';
import PatientLoginPage from './pages/PatientLoginPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import PatientExercisesPage from './pages/PatientExercisesPage';
import PatientProfilePage from './pages/PatientProfilePage';
import { PatientAuthGuard } from './components/PatientAuthGuard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PatientLoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PatientAuthGuard>
            <PatientDashboardPage />
          </PatientAuthGuard>
        }
      />
      <Route
        path="/exercises"
        element={
          <PatientAuthGuard>
            <PatientExercisesPage />
          </PatientAuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <PatientAuthGuard>
            <PatientProfilePage />
          </PatientAuthGuard>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

