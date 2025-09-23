import React, { lazy, useState } from 'react';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { AppProvider } from './contexts/AppContext';
import LoginPage from './pages/auth/LoginPage';
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage';
import { Role } from './types';

// Lazy load different portal dashboards
const CompleteDashboard = lazy(() => import('./pages/CompleteDashboard'));
const PatientPortalDashboard = lazy(() => import('./pages/PatientPortalDashboard'));
const PartnerPortalDashboard = lazy(() => import('./pages/PartnerPortalDashboard'));

const AppContent: React.FC = () => {
    const { user, isAuthenticated, loading, logout } = useSupabaseAuth();
    const [show2FASetup, setShow2FASetup] = useState(false);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // 2FA Setup flow
    if (show2FASetup) {
        return (
            <TwoFactorSetupPage
                onComplete={() => setShow2FASetup(false)}
                onBack={() => setShow2FASetup(false)}
            />
        );
    }

    const renderDashboard = () => {
        if (!user) return null;

        // Route to appropriate dashboard based on user role
        switch (user.role) {
            case Role.Patient:
                return <PatientPortalDashboard user={user} onLogout={logout} />;
            case Role.EducadorFisico:
                return <PartnerPortalDashboard user={user} onLogout={logout} />;
            case Role.Admin:
            case Role.Therapist:
            default:
                return <CompleteDashboard user={user} onLogout={logout} />;
        }
    };

    if (isAuthenticated && user) {
        return (
            <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dashboard...</p>
                    </div>
                </div>
            }>
                {renderDashboard()}
            </React.Suspense>
        );
    }

    return (
        <LoginPage
            onSuccess={() => {
                // Optionally show 2FA setup for new users
                // setShow2FASetup(true);
            }}
        />
    );
};

const AppRoutes: React.FC = () => {
    return (
        <SupabaseAuthProvider>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </SupabaseAuthProvider>
    );
};

export default AppRoutes;