import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types';
import { useApp } from '../contexts/AppContext';
import PageHeader from '../components/PageHeader';
import { FileText, User, Search, ChevronRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const GerarLaudoPage: React.FC = () => {
    const navigate = useNavigate();
    const { patients } = useApp();
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setFilteredPatients(patients);
        setIsLoading(false);
    }, [patients]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPatients(patients);
        } else {
            const filtered = patients.filter(patient =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPatients(filtered);
        }
    }, [searchTerm, patients]);

    const handleSelectPatient = (patientId: string) => {
        navigate(`/medical-report/new/${patientId}`);
    };

    if (isLoading) {
        return (
            <>
                <PageHeader
                    title="Gerar Laudo Médico"
                    subtitle="Selecione um paciente para gerar um laudo médico com IA."
                />
                <div className="space-y-md">
                    <Skeleton className="h-12 w-full" />
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title="Gerar Laudo Médico"
                subtitle="Selecione um paciente para gerar um laudo médico com IA."
            />

            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
                {/* Search Bar */}
                <div className="mb-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-textTertiary w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar paciente por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                </div>

                {/* Patient List */}
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <User className="w-12 h-12 text-slate-300 mx-auto mb-md" />
                        <p className="text-neutral-textSecondary text-lg">
                            {searchTerm ? 'Nenhum paciente encontrado com esse critério.' : 'Nenhum paciente cadastrado.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-sm">
                        {filteredPatients.map((patient) => (
                            <button
                                key={patient.id}
                                onClick={() => handleSelectPatient(patient.id)}
                                className="w-full flex items-center justify-between p-md bg-neutral-bgAlt hover:bg-primary-light border border-neutral-border hover:border-sky-300 rounded-lg transition-all duration-200 group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-neutral-text group-hover:text-primary">
                                            {patient.name}
                                        </h3>
                                        <p className="text-sm text-neutral-textSecondary">
                                            {patient.email || 'Email não cadastrado'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 text-primary group-hover:text-primary">
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm font-medium">Gerar Laudo</span>
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-xl p-md bg-primary-light border border-primary rounded-lg">
                    <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Como funciona?</h4>
                            <p className="text-sm text-blue-800">
                                Selecione um paciente da lista acima para iniciar a geração de um laudo médico. 
                                Você poderá preencher as informações necessárias e nossa IA irá gerar um laudo 
                                profissional e personalizado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GerarLaudoPage;

