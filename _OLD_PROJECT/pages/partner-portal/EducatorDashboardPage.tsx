import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from "@/contexts/AppContext";
import { Users, Activity, CheckCircle, UserPlus, Clock, CheckCircle2, TrendingUp, Target, Star } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { educatorService, ReferredPatient, EducatorPerformance } from '../../services/educatorService';
import { useToast } from '../../contexts/ToastContext';

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

// Componente para mostrar progresso detalhado
const ProgressCard = ({ referral }: { referral: ReferredPatient }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{referral.progress.adherence}%</div>
                <div className="text-xs text-blue-500">Adesão</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{referral.progress.functionalScore}</div>
                <div className="text-xs text-green-500">Score Funcional</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{referral.progress.painLevel}/10</div>
                <div className="text-xs text-orange-500">Dor (EVA)</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{referral.progress.currentSession}/{referral.progress.totalSessions}</div>
                <div className="text-xs text-purple-500">Sessões</div>
            </div>
        </div>
    </div>
);

const EducatorDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [referredPatients, setReferredPatients] = useState<ReferredPatient[]>([]);
    const [performance, setPerformance] = useState<EducatorPerformance | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados do educador
    useEffect(() => {
        const loadEducatorData = async () => {
            try {
                setIsLoading(true);
                const educatorId = user?.id || 'educator_001';
                
                const [patients, perf] = await Promise.all([
                    educatorService.getReferredPatients(educatorId),
                    educatorService.getEducatorPerformance(educatorId)
                ]);
                
                setReferredPatients(patients);
                setPerformance(perf);
            } catch (error) {
                showToast('Erro ao carregar dados do educador', 'error');
                console.error('Erro ao carregar dados:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadEducatorData();
    }, [user?.id, showToast]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_progress': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'in_progress': return 'Em Tratamento';
            case 'pending': return 'Aguardando Aceite';
            case 'accepted': return 'Aceito';
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'in_progress': return <Activity className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'accepted': return <CheckCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'cancelled': return <UserPlus className="w-4 h-4" />;
            default: return <UserPlus className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Urgente';
            case 'high': return 'Alta';
            case 'medium': return 'Média';
            case 'low': return 'Baixa';
            default: return priority;
        }
    };

    return (
        <>
            <PageHeader
                title={`Boas-vindas, ${user?.name.split(' ')[0] || user?.name}!`}
                subtitle="Acompanhe os pacientes encaminhados e seus progressos."
            />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Pacientes Ativos" 
                        value={performance?.activePatients.toString() || "0"} 
                        icon={<Users />} 
                    />
                    <StatCard 
                        title="Total de Pacientes" 
                        value={performance?.totalPatients.toString() || "0"} 
                        icon={<Target />} 
                    />
                    <StatCard 
                        title="Taxa de Adesão" 
                        value={`${performance?.averageAdherence.toFixed(1) || "0"}%`} 
                        icon={<TrendingUp />} 
                    />
                    <StatCard 
                        title="Satisfação" 
                        value={performance?.patientSatisfaction.toFixed(1) || "0"} 
                        icon={<Star />} 
                    />
                </div>
            )}

            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Pacientes Encaminhados ({referredPatients.length})</h3>
                    <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Paciente
                    </Button>
                </div>
                
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
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
                                        <Badge className={getPriorityColor(referral.priority)}>
                                            {getPriorityLabel(referral.priority)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">
                                        {referral.patient.age} anos • {referral.patient.conditions.join(', ')}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Encaminhado em: {new Date(referral.referralDate).toLocaleDateString('pt-BR')}
                                    </p>
                                    {referral.notes && (
                                        <p className="text-xs text-slate-600 mb-3 p-2 bg-slate-50 rounded border-l-2 border-slate-300">
                                            <strong>Observações:</strong> {referral.notes}
                                        </p>
                                    )}
                                    {(referral.status === 'in_progress' || referral.status === 'accepted') && (
                                        <ProgressCard referral={referral} />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        Ver Detalhes
                                    </Button>
                                    {referral.status === 'pending' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                            Aceitar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
                
                {!isLoading && referredPatients.length === 0 && (
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
