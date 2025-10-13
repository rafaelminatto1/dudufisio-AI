import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from "@/contexts/AppContext";
import { Users, Activity, CheckCircle, UserPlus, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                {icon}
            </div>
        </div>
    </div>
);

// Mock data de pacientes encaminhados
const mockReferredPatients = [
    {
        id: 'ref-001',
        patient: {
            id: 'p-001',
            name: 'Roberto Silva',
            age: 45,
            condition: 'Pós-cirurgia de joelho'
        },
        referredBy: 'Dra. Ana Santos',
        referralDate: '2024-01-15',
        status: 'active' as const,
        sessionsCompleted: 8,
        totalSessions: 12
    },
    {
        id: 'ref-002',
        patient: {
            id: 'p-002',
            name: 'Maria Costa',
            age: 38,
            condition: 'Condicionamento pós-fisioterapia'
        },
        referredBy: 'Dr. Carlos Mendes',
        referralDate: '2024-01-20',
        status: 'pending' as const,
        sessionsCompleted: 0,
        totalSessions: 10
    },
    {
        id: 'ref-003',
        patient: {
            id: 'p-003',
            name: 'João Oliveira',
            age: 52,
            condition: 'Reabilitação cardíaca'
        },
        referredBy: 'Dra. Ana Santos',
        referralDate: '2024-01-10',
        status: 'completed' as const,
        sessionsCompleted: 15,
        totalSessions: 15
    }
];

const EducatorDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [referredPatients] = useState(mockReferredPatients);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Em Tratamento';
            case 'pending': return 'Aguardando Aceite';
            case 'completed': return 'Concluído';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Activity className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            default: return <UserPlus className="w-4 h-4" />;
        }
    };

    return (
        <>
            <PageHeader
                title={`Boas-vindas, ${user?.name.split(' ')[0] || user?.name}!`}
                subtitle="Acompanhe os pacientes encaminhados e seus progressos."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Pacientes Ativos" value="5" icon={<Users />} />
                <StatCard title="Planos de Treino Criados" value="12" icon={<Activity />} />
                <StatCard title="Treinos Concluídos (Mês)" value="38" icon={<CheckCircle />} />
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Pacientes Encaminhados ({referredPatients.length})</h3>
                    <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Paciente
                    </Button>
                </div>
                
                <div className="space-y-4">
                    {referredPatients.map((referral) => (
                        <div 
                            key={referral.id} 
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-md font-semibold text-slate-900">
                                            {referral.patient.name}
                                        </h4>
                                        <Badge className={getStatusColor(referral.status)}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(referral.status)}
                                                {getStatusLabel(referral.status)}
                                            </span>
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">
                                        {referral.patient.age} anos • {referral.patient.condition}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Encaminhado por: {referral.referredBy} • {new Date(referral.referralDate).toLocaleDateString('pt-BR')}
                                    </p>
                                    {referral.status === 'active' && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-indigo-600 h-2 rounded-full transition-all" 
                                                        style={{ width: `${(referral.sessionsCompleted / referral.totalSessions) * 100}%` }}
                                                    />
                                                </div>
                                                <span>{referral.sessionsCompleted}/{referral.totalSessions} sessões</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        Ver Detalhes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {referredPatients.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <UserPlus className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p>Nenhum paciente encaminhado no momento.</p>
                        <p className="text-sm mt-2">Quando fisioterapeutas encaminharem pacientes, eles aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default EducatorDashboardPage;
