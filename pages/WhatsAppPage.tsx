// pages/WhatsAppPage.tsx
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import WhatsappChatInterface from '../components/whatsapp/WhatsappChatInterface';
import { WhatsappMessage } from '../types';
import * as whatsappLogService from '../services/whatsappLogService';
import { MessageSquare, List, Bot, Loader, Check, CheckCheck, XCircle } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const LogRow: React.FC<{ log: WhatsappMessage }> = ({ log }) => {
    const statusInfo: Record<WhatsappMessage['status'], { text: string; color: string; icon: React.ReactNode }> = {
        sending: { text: 'Enviando', color: 'bg-neutral-bgDark text-neutral-text', icon: <Loader className="w-3 h-3 animate-spin" /> },
        sent: { text: 'Enviado', color: 'bg-primary-light text-sky-800', icon: <Check className="w-3 h-3" /> },
        delivered: { text: 'Entregue', color: 'bg-primary-light text-blue-800', icon: <CheckCheck className="w-3 h-3" /> },
        read: { text: 'Lido', color: 'bg-success-light text-success', icon: <CheckCheck className="w-3 h-3 text-blue-500" /> },
        failed: { text: 'Falhou', color: 'bg-error-light text-error', icon: <XCircle className="w-3 h-3" /> },
    };
    const currentStatus = statusInfo[log.status];

    return (
        <tr className="border-b border-neutral-border">
            <td className="p-md">
                <div className="font-medium text-neutral-text">{log.patientName}</div>
                <div className="text-xs text-neutral-textSecondary">{log.phone}</div>
            </td>
            <td className="p-md text-sm text-neutral-textSecondary max-w-sm truncate" title={log.content}>{log.content}</td>
            <td className="p-md text-sm text-neutral-textSecondary capitalize">{log.type}</td>
            <td className="p-md text-center">
                <span title={currentStatus.text} className={`px-sm py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full capitalize ${currentStatus.color}`}>
                    {currentStatus.icon}
                    <span className="ml-xs.5">{currentStatus.text}</span>
                </span>
            </td>
            <td className="p-md text-xs text-neutral-textSecondary whitespace-nowrap">{log.createdAt.toLocaleString('pt-BR')}</td>
        </tr>
    );
};


const WhatsAppPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'simulator' | 'log'>('simulator');
    const [logs, setLogs] = useState<WhatsappMessage[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (activeTab === 'log') {
            setIsLoadingLogs(true);
            whatsappLogService.getLogs().then(data => {
                setLogs(data);
                setIsLoadingLogs(false);
            });
        }
    }, [activeTab]);

    return (
        <>
            <PageHeader
                title="Integração WhatsApp"
                subtitle="Simule conversas e monitore o log de mensagens automáticas."
            />

            <div className="bg-white rounded-cardLarge shadow-card overflow-hidden">
                <div className="border-b border-neutral-border">
                    <nav className="flex space-x-4 px-lg" aria-label="Tabs">
                        <button onClick={() => setActiveTab('simulator')} className={`flex items-center whitespace-nowrap py-md px-1 border-b-2 font-medium text-sm ${activeTab === 'simulator' ? 'border-teal-500 text-teal-600' : 'border-transparent text-neutral-textSecondary hover:text-neutral-text'}`}>
                            <Bot className="w-5 h-5 mr-sm" /> Simulador de Chat
                        </button>
                        <button onClick={() => setActiveTab('log')} className={`flex items-center whitespace-nowrap py-md px-1 border-b-2 font-medium text-sm ${activeTab === 'log' ? 'border-teal-500 text-teal-600' : 'border-transparent text-neutral-textSecondary hover:text-neutral-text'}`}>
                            <List className="w-5 h-5 mr-sm" /> Log de Mensagens
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'simulator' && (
                    <div className="p-md md:p-lg">
                        <WhatsappChatInterface />
                    </div>
                )}

                {activeTab === 'log' && (
                    <div className="p-md md:p-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-neutral-bgAlt">
                                    <tr>
                                        <th className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase">Paciente</th>
                                        <th className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase">Conteúdo</th>
                                        <th className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase">Tipo</th>
                                        <th className="p-md text-center text-xs font-medium text-neutral-textSecondary uppercase">Status</th>
                                        <th className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {isLoadingLogs ? (
                                        Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={5} className="p-md"><Skeleton className="h-10 w-full" /></td></tr>)
                                    ) : logs.length > 0 ? (
                                        logs.map(log => <LogRow key={log.id} log={log} />)
                                    ) : (
                                        <tr><td colSpan={5} className="text-center p-10 text-neutral-textSecondary">Nenhuma mensagem no log. Confirmações e lembretes aparecerão aqui.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default WhatsAppPage;