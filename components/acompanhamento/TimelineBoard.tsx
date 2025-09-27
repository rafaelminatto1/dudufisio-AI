import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { PatientTimelineEntry } from '../../services/acompanhamentoService';
import { Clock, CalendarDays } from 'lucide-react';

interface TimelineBoardProps {
    timeline: PatientTimelineEntry[];
}

const statusInfo: Record<PatientTimelineEntry['status'], { label: string; color: string; badge: string }> = {
    abandonment: { label: 'Abandono', color: 'text-red-600', badge: 'bg-red-100 text-red-700' },
    risk: { label: 'Risco', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    on_track: { label: 'Regular', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
};

const TimelineBoard: React.FC<TimelineBoardProps> = ({ timeline }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Linha do Tempo de Visitas</CardTitle>
            </CardHeader>
            <CardContent>
                {timeline.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-16">
                        Ainda não há pacientes com histórico suficiente para exibir.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {timeline.map(entry => {
                            const status = statusInfo[entry.status];
                            return (
                                <div
                                    key={entry.patientId}
                                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-base font-semibold text-slate-800">{entry.patientName}</h3>
                                            <Badge variant="outline" className={status.badge}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>
                                                    Última visita há <span className={status.color}>{entry.daysSinceLastVisit} dia(s)</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                                <span>
                                                    Próxima visita:{' '}
                                                    {entry.nextVisit ? (
                                                        <span className="text-slate-700">{entry.nextVisit}</span>
                                                    ) : (
                                                        <span className="text-red-500">Sem agendamento</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        <div>Última visita: <span className="text-slate-700 font-medium">{entry.lastVisit}</span></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TimelineBoard;

