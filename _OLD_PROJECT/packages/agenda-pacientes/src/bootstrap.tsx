// Bootstrap file for module federation
console.log('Agenda-Pacientes remote loaded');

// Export pages for federation
export { default as AgendaPage } from './pages/AgendaPage.tsx';
export { default as PatientListPage } from './pages/PatientListPage.tsx';
export { default as PatientDetailPage } from './pages/PatientDetailPage.tsx';
export { default as ClinicalMaterialsPage } from './pages/ClinicalMaterialsPage.tsx';

