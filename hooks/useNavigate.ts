import { useContext } from 'react';

// Define a NavigationContext interface
interface NavigationContextType {
  navigate: (path: string) => void;
}

// Mock context for now - this should be replaced with a proper context
const NavigationContext = {
  navigate: (path: string) => {
    console.log('Navigation requested to:', path);

    // Try to find the current page setter in the window object (hack for now)
    const currentPageSetter = (window as any).__setCurrentPage;
    if (currentPageSetter && typeof currentPageSetter === 'function') {
      // Map paths to internal page names
      if (path.startsWith('/patients/')) {
        const patientId = path.replace('/patients/', '');
        // Store patient ID for the detail page
        (window as any).__selectedPatientId = patientId;
        currentPageSetter('patient-detail');
      } else if (path.startsWith('/patients')) {
        currentPageSetter('patients');
      } else if (path.startsWith('/atendimento/') || path.startsWith('/teleconsulta/')) {
        const appointmentId = path.split('/')[2];
        (window as any).__selectedAppointmentId = appointmentId;
        currentPageSetter('session');
      }
    }
  }
};

// Hook useNavigate for navigation without React Router
export const useNavigate = () => {
  return NavigationContext.navigate;
};