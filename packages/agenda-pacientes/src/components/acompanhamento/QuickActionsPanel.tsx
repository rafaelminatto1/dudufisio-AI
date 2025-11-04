import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, PhoneCall, CalendarPlus, StickyNote, ArrowUpRight } from 'lucide-react';
import { QuickActionsData } from '../../services/acompanhamentoService';

interface QuickActionsPanelProps {
    quickActions: QuickActionsData;
    onLogContact: (patientId: string, type: 'WhatsApp' | 'Ligação') => void;
    onReschedule: (patientId: string) => void;
    onAddObservation: (patientId: string) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ quickActions, onLogContact, onReschedule, onAddObservation }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contato Prioritário</h3>
                        <span className="text-xs text-slate-400">{quickActions.whatsappContacts.length} pacientes</span>
                    </div>
                    <div className="space-y-3">
                        {quickActions.whatsappContacts.slice(0, 3).map(contact => (
                            <div key={contact.patientId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{contact.patientName}</p>
                                    <p className="text-xs text-slate-500">{contact.phone}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                        onClick={() => onLogContact(contact.patientId, 'WhatsApp')}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                        onClick={() => onLogContact(contact.patientId, 'Ligação')}
                                    >
                                        <PhoneCall className="w-4 h-4 mr-1" /> Ligar
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {quickActions.whatsappContacts.length > 3 && (
                            <p className="text-xs text-slate-400 pl-1">
                                + {quickActions.whatsappContacts.length - 3} pacientes aguardando contato
                            </p>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Remarcações Sugeridas</h3>
                        <span className="text-xs text-slate-400">{quickActions.rescheduleSuggestions.length} casos</span>
                    </div>
                    <div className="space-y-3">
                        {quickActions.rescheduleSuggestions.slice(0, 3).map(suggestion => (
                            <div key={suggestion.patientId} className="p-3 border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{suggestion.patientName}</p>
                                        <p className="text-xs text-slate-500">Última visita: {suggestion.lastVisit}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-sky-600 border-sky-200 hover:bg-sky-50"
                                        onClick={() => onReschedule(suggestion.patientId)}
                                    >
                                        <CalendarPlus className="w-4 h-4 mr-1" /> Remarcar
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{suggestion.reason}</p>
                            </div>
                        ))}
                        {quickActions.rescheduleSuggestions.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">Nenhum paciente crítico aguardando remarcação.</p>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Registro de Contatos</h3>
                        <span className="text-xs text-slate-400">{quickActions.contactLogsPending.length} pacientes</span>
                    </div>
                    <div className="space-y-3">
                        {quickActions.contactLogsPending.slice(0, 4).map(log => (
                            <div key={log.patientId} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{log.patientName}</p>
                                    <p className="text-xs text-slate-500">
                                        Último contato:{' '}
                                        {log.lastCommunication
                                            ? new Date(log.lastCommunication).toLocaleString('pt-BR')
                                            : 'Nunca registrado'}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-slate-500 hover:text-slate-700"
                                    onClick={() => onAddObservation(log.patientId)}
                                >
                                    Registrar <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Observações Clínicas</h3>
                        <span className="text-xs text-slate-400">{quickActions.observations.length} alertas</span>
                    </div>
                    <div className="space-y-3">
                        {quickActions.observations.slice(0, 3).map(observation => (
                            <div key={observation.patientId} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-800">{observation.patientName}</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-amber-600 hover:bg-amber-50"
                                        onClick={() => onAddObservation(observation.patientId)}
                                    >
                                        <StickyNote className="w-4 h-4 mr-1" /> Anotar
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{observation.summary}</p>
                            </div>
                        ))}
                        {quickActions.observations.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">Nenhuma observação clínica pendente.</p>
                        )}
                    </div>
                </section>
            </CardContent>
        </Card>
    );
};

export default QuickActionsPanel;

