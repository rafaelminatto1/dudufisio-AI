// Bootstrap file for module federation
console.log('Agenda-Pacientes remote loaded');

// Export pages for federation
export { default as AgendaPage } from './pages/AgendaPage';
export { default as PatientListPage } from './pages/PatientListPage';
export { default as PatientDetailPage } from './pages/PatientDetailPage';
export { default as ClinicalMaterialsPage } from './pages/ClinicalMaterialsPage';

