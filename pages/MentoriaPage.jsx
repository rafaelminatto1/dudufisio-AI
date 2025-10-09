// pages/MentoriaPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { InternStatus } from '../types';
import * as mentoriaService from '../services/mentoriaService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import MentoriaStats from '../components/mentoria/MentoriaStats';
import InternsTable from '../components/mentoria/InternsTable';
import CasesList from '../components/mentoria/CasesList';
import InternFormModal from '../components/InternFormModal';
import CaseFormModal from '../components/CaseFormModal';
import CaseDetailModal from '../components/CaseDetailModal';
const MentoriaPage = () => {
    const [interns, setInterns] = useState([]);
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    // Modal states
    const [isInternModalOpen, setIsInternModalOpen] = useState(false);
    const [internToEdit, setInternToEdit] = useState(undefined);
    const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
    const [caseToEdit, setCaseToEdit] = useState(undefined);
    const [caseToView, setCaseToView] = useState(undefined);
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { interns, cases } = await mentoriaService.getMentoriaData();
            setInterns(interns);
            setCases(cases);
        }
        catch (error) {
            showToast('Erro ao carregar dados de mentoria.', 'error');
        }
        finally {
            setIsLoading(false);
        }
    }, [showToast]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Intern Handlers
    const handleAddIntern = () => {
        setInternToEdit(undefined);
        setIsInternModalOpen(true);
    };
    const handleEditIntern = (intern) => {
        setInternToEdit(intern);
        setIsInternModalOpen(true);
    };
    const handleSaveIntern = async (data) => {
        await mentoriaService.saveIntern(data);
        showToast(data.id ? 'Estagiário atualizado!' : 'Estagiário adicionado!', 'success');
        setIsInternModalOpen(false);
        fetchData();
    };
    // Case Handlers
    const handleAddCase = () => {
        setCaseToEdit(undefined);
        setIsCaseModalOpen(true);
    };
    const handleEditCase = (clinicalCase) => {
        setCaseToEdit(clinicalCase);
        setIsCaseModalOpen(true);
    };
    const handleSaveCase = async (data) => {
        await mentoriaService.saveCase(data);
        showToast(data.id ? 'Caso clínico atualizado!' : 'Caso clínico adicionado!', 'success');
        setIsCaseModalOpen(false);
        fetchData();
    };
    const activeInterns = interns.filter(i => i.status === InternStatus.Active).length;
    const avgGrade = interns.reduce((acc, i) => acc + (i.averageGrade || 0), 0) / (interns.length || 1);
    return (<>
            <PageHeader title="Módulo de Mentoria e Ensino" subtitle="Gerencie estagiários, casos clínicos educacionais e avaliações de competências."/>

            <InternFormModal isOpen={isInternModalOpen} onClose={() => setIsInternModalOpen(false)} onSave={handleSaveIntern} internToEdit={internToEdit}/>
            <CaseFormModal isOpen={isCaseModalOpen} onClose={() => setIsCaseModalOpen(false)} onSave={handleSaveCase} caseToEdit={caseToEdit}/>
            <CaseDetailModal clinicalCase={caseToView} onClose={() => setCaseToView(undefined)}/>

            {isLoading ? (<Skeleton className="h-96 w-full"/>) : (<div className="space-y-8">
                    <MentoriaStats activeInterns={activeInterns} totalCases={cases.length} avgGrade={avgGrade}/>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <InternsTable interns={interns} onAdd={handleAddIntern} onEdit={handleEditIntern}/>
                        <CasesList cases={cases} onAdd={handleAddCase} onView={setCaseToView} onEdit={handleEditCase}/>
                    </div>
                </div>)}
        </>);
};
export default MentoriaPage;
