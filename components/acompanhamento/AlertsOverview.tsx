import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, BellRing, CheckCircle2, Clock3, Users, Activity, TrendingUp } from 'lucide-react';
import { IntelligentAlertSummary, DashboardMetrics } from '../../services/acompanhamentoService';

interface AlertsOverviewProps {
    alerts: IntelligentAlertSummary;
    metrics: DashboardMetrics;
}

const levelInfo = [
    {
        key: 'abandonment' as const,
        title: 'Abandono de Tratamento',
        description: 'Pacientes há mais de 7 dias sem comparecer e sem novo agendamento.',
        icon: AlertTriangle,
        accent: 'bg-red-100 text-red-600',
    },
    {
        key: 'highRisk' as const,
        title: 'Alerta Crítico',
        description: 'Pacientes que faltaram às últimas consultas consecutivas.',
        icon: BellRing,
        accent: 'bg-amber-100 text-amber-600',
    },
    {
        key: 'attention' as const,
        title: 'Próximos da Alta',
        description: 'Pacientes que concluíram 80% do plano e precisam de revisão.',
        icon: CheckCircle2,
        accent: 'bg-sky-100 text-sky-600',
    },
    {
        key: 'pendingDischarge' as const,
        title: 'Alta Pendente',
        description: 'Planos concluídos sem agendamento de consulta de alta.',
        icon: Clock3,
        accent: 'bg-emerald-100 text-emerald-600',
    },
];

const AlertsOverview: React.FC<AlertsOverviewProps> = ({ alerts, metrics }) => {
    const summary = useMemo(() => {
        return levelInfo.map(level => ({
            ...level,
            count: alerts[level.key].length,
            examples: alerts[level.key].slice(0, 3).map(patient => patient.name),
        }));
    }, [alerts]);

    const metricCards = [
        {
            title: 'Pacientes Ativos',
            value: metrics.totalActivePatients,
            icon: Users,
            accent: 'bg-slate-100 text-slate-700',
            description: 'Total de pacientes em tratamento ativo.',
        },
        {
            title: 'Taxa de Abandono',
            value: `${metrics.abandonmentRate}%`,
            icon: Activity,
            accent: 'bg-red-100 text-red-600',
            description: 'Pacientes sem comparecimento há mais de 7 dias.',
        },
        {
            title: 'Adesão Média',
            value: `${metrics.adherenceAverage}%`,
            icon: TrendingUp,
            accent: 'bg-emerald-100 text-emerald-600',
            description: 'Comparação entre sessões realizadas e agendadas.',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="space-y-4">
                    <div>
                        <CardTitle className="text-lg font-semibold text-slate-800">Alertas Inteligentes</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Priorização automática baseada no comportamento de presença e evolução clínica.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {metricCards.map(card => (
                            <div key={card.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{card.title}</p>
                                        <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.accent}`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-3 leading-relaxed">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {summary.map(level => (
                    <div key={level.key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${level.accent}`}>
                                <level.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h3 className="text-base font-semibold text-slate-800">{level.title}</h3>
                                    <div className="text-sm">
                                        <span className="text-slate-500">Total:</span>{' '}
                                        <span className="font-semibold text-slate-800">{level.count}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{level.description}</p>
                                {level.examples.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Exemplos</p>
                                        <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                            {level.examples.map(name => (
                                                <li key={name} className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                    {name}
                                                </li>
                                            ))}
                                            {alerts[level.key].length > level.examples.length && (
                                                <li className="text-slate-400 text-xs">
                                                    + {alerts[level.key].length - level.examples.length} outros pacientes
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default AlertsOverview;

