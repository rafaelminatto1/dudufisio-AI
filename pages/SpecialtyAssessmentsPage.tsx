import React, { useState, memo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import PageHeader from '../components/PageHeader';
import { Skeleton } from '../components/ui/skeleton';
import SpecialtyAssessmentGallery from '../components/SpecialtyAssessmentGallery';
import SportsAssessmentForm from '../components/forms/SportsAssessmentForm';
import { Specialty } from '../types';

const SpecialtyAssessmentsPage: React.FC = memo(() => {
    const { patients, isLoading: isLoadingPatients } = usePatients();
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);

    const handleBack = () => {
        setSelectedSpecialty(null);
    };

    const renderContent = () => {
        if (isLoadingPatients) {
            return (
                <div className="space-y-xl">
                    <Skeleton className="h-12 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-sm">
                                <Skeleton className="h-48 w-full rounded-card" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (!selectedPatientId) {
            return (
                <div className="text-center p-10 bg-white rounded-cardLarge shadow-card">
                    <h3 className="text-lg font-semibold text-neutral-text">Primeiro Passo</h3>
                    <p className="text-neutral-textSecondary mt-xs">Por favor, selecione um paciente para iniciar uma nova avaliação.</p>
                </div>
            );
        }

        if (selectedSpecialty) {
            // Render specific form based on specialty
            switch (selectedSpecialty.id) {
                case 'sports':
                    return <SportsAssessmentForm patientId={selectedPatientId} onBack={handleBack} />;
                default:
                    return (
                        <div className="text-center p-10 bg-white rounded-cardLarge shadow-card">
                             <h3 className="text-lg font-semibold text-neutral-text">Em Desenvolvimento</h3>
                             <p className="text-neutral-textSecondary mt-xs">O formulário de avaliação para "{selectedSpecialty.name}" ainda não está disponível.</p>
                        </div>
                    );
            }
        }

        return (
            <SpecialtyAssessmentGallery
                onSelectSpecialty={(specialty) => setSelectedSpecialty(specialty)}
            />
        );
    };

    const pageTitle = selectedSpecialty ? `Avaliação: ${selectedSpecialty.name}` : "Avaliações por Especialidade";
    const pageSubtitle = selectedSpecialty ? `Paciente: ${patients.find(p => p.id === selectedPatientId)?.name}` : "Inicie uma avaliação escolhendo um paciente e uma especialidade.";

    return (
        <>
            <PageHeader title={pageTitle} subtitle={pageSubtitle}>
                {selectedSpecialty && (
                     <button onClick={handleBack} className="inline-flex items-center rounded-lg border border-neutral-border bg-white px-md py-sm text-sm font-medium text-neutral-text shadow-card hover:bg-neutral-bgAlt mr-3">
                        <ChevronLeft className="-ml-xs mr-sm h-5 w-5" />
                        Voltar para Galeria
                    </button>
                )}
            </PageHeader>
            
            {!selectedSpecialty && (
                <div className="mb-xl bg-white p-md rounded-cardLarge shadow-card">
                    <label htmlFor="patient-select" className="block text-sm font-medium text-neutral-text mb-1">Paciente</label>
                    <select
                        id="patient-select"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full max-w-sm p-sm border border-neutral-border rounded-lg bg-white"
                        disabled={isLoadingPatients}
                    >
                        <option value="">Selecione um paciente...</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}

            {renderContent()}
        </>
    );
});

SpecialtyAssessmentsPage.displayName = 'SpecialtyAssessmentsPage';

export default SpecialtyAssessmentsPage;
