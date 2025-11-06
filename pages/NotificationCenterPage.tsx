import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from "../contexts/AppContext";
import { useNotifications } from '../hooks/useNotifications';
import { Notification, Role } from '../types';
import { notificationService } from '../services/notificationService';
import { useToast } from '../contexts/ToastContext';
import { Bell, Send, CheckCheck, Loader, MessageSquare, Inbox, CalendarClock, ClipboardList, Megaphone, Dumbbell } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import TiptapEditorLazy from '../components/ui/TiptapEditorLazy';

// A simple time ago function for display
const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "agora mesmo";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
};

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'task_assigned': return <ClipboardList className="w-5 h-5 text-purple-500" />;
        case 'announcement': return <Megaphone className="w-5 h-5 text-amber-500" />;
        case 'appointment_reminder': return <CalendarClock className="w-5 h-5 text-sky-500" />;
        case 'exercise_reminder': return <Dumbbell className="w-5 h-5 text-teal-500" />;
        default: return <Bell className="w-5 h-5 text-neutral-textSecondary" />;
    }
}

const NotificationItem: React.FC<{ notification: Notification; onMarkAsRead: (id: string) => void }> = ({ notification, onMarkAsRead }) => {
    return (
        <div
            onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
            className={`flex items-start p-md border-b border-neutral-border transition-colors duration-200 ${!notification.isRead ? 'bg-primary-light/50 hover:bg-primary-light cursor-pointer' : 'bg-white'}`}
        >
            <div className="flex-shrink-0 relative">
                {!notification.isRead && <span className="absolute -left-1 top-sm h-2 w-2 rounded-full bg-primary"></span>}
                <div className="p-sm bg-neutral-bgDark rounded-full ml-sm">
                    {getNotificationIcon(notification.type)}
                </div>
            </div>
            <div className="ml-4 flex-grow">
                <p className="text-sm text-neutral-text">{notification.message}</p>
                <p className="text-xs text-neutral-textSecondary mt-xs">{timeAgo(notification.createdAt)}</p>
            </div>
        </div>
    );
};

const BroadcastForm: React.FC<{ onSent: () => void }> = ({ onSent }) => {
    const [message, setMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState<Role>(Role.Therapist);
    const [isSending, setIsSending] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            showToast('A mensagem não pode estar vazia.', 'error');
            return;
        }
        setIsSending(true);
        try {
            await notificationService.sendBroadcast(message, targetGroup);
            showToast('Comunicado enviado com sucesso!', 'success');
            setMessage('');
            onSent();
        } catch (error) {
            showToast('Falha ao enviar comunicado.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-lg space-y-md">
            <div>
                <label htmlFor="broadcast-message" className="block text-sm font-medium text-neutral-text">Mensagem</label>
                <TiptapEditorLazy
                    value={message}
                    onChange={setMessage}
                    minHeight="120px"
                    placeholder="Digite seu comunicado aqui..."
                />
            </div>
            <div>
                <label htmlFor="target-group" className="block text-sm font-medium text-neutral-text">Destinatários</label>
                <select
                    id="target-group"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value as Role)}
                    className="mt-xs block w-full rounded-md border-neutral-border shadow-card focus:border-teal-500 focus:ring-teal-500"
                >
                    <option value={Role.Therapist}>Todos os Fisioterapeutas</option>
                    <option value={Role.Patient}>Todos os Pacientes</option>
                    <option value={Role.EducadorFisico}>Todos os Educadores Físicos</option>
                </select>
            </div>
            <div className="text-right">
                <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-md py-sm text-sm font-medium text-white shadow-card hover:bg-teal-600 disabled:bg-teal-300"
                >
                    {isSending ? <Loader className="w-5 h-5 mr-sm animate-spin" /> : <Send className="w-5 h-5 mr-sm" />}
                    {isSending ? 'Enviando...' : 'Enviar Comunicado'}
                </button>
            </div>
        </form>
    );
};


const NotificationCenterPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'my' | 'broadcast'>('my');
    const { user } = useAuth();
    const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifications(user?.id || '');

    return (
        <>
            <PageHeader
                title="Centro de Notificações"
                subtitle="Acompanhe suas mensagens e envie comunicados para a equipe."
            />
            <div className="bg-white rounded-cardLarge shadow-card overflow-hidden">
                <div className="border-b border-neutral-border">
                    <nav className="flex space-x-4 px-lg" aria-label="Tabs">
                        <button onClick={() => setActiveTab('my')} className={`flex items-center whitespace-nowrap py-md px-1 border-b-2 font-medium text-sm ${activeTab === 'my' ? 'border-teal-500 text-teal-600' : 'border-transparent text-neutral-textSecondary hover:text-neutral-text'}`}>
                            <Bell className="w-5 h-5 mr-sm" />
                            Minhas Notificações {unreadCount > 0 && <span className="ml-sm bg-error-light0 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>}
                        </button>
                        {user?.role === Role.Admin && (
                            <button onClick={() => setActiveTab('broadcast')} className={`flex items-center whitespace-nowrap py-md px-1 border-b-2 font-medium text-sm ${activeTab === 'broadcast' ? 'border-teal-500 text-teal-600' : 'border-transparent text-neutral-textSecondary hover:text-neutral-text'}`}>
                                <MessageSquare className="w-5 h-5 mr-sm" />
                                Enviar Comunicado
                            </button>
                        )}
                    </nav>
                </div>
                
                {activeTab === 'my' && (
                    <div>
                        <div className="p-md flex justify-end border-b border-neutral-border">
                            <button onClick={markAllAsRead} disabled={unreadCount === 0} className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 disabled:text-neutral-textTertiary disabled:cursor-not-allowed">
                                <CheckCheck className="w-5 h-5 mr-sm" />
                                Marcar todas como lidas
                            </button>
                        </div>
                        {isLoading ? (
                             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                                {notifications.map(n => <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} />)}
                            </div>
                        ) : (
                            <div className="text-center p-12">
                                <Inbox className="w-16 h-16 mx-auto text-slate-300 mb-md" />
                                <h3 className="text-lg font-semibold text-neutral-text">Caixa de entrada vazia</h3>
                                <p className="text-neutral-textSecondary mt-xs">Você não tem nenhuma notificação no momento.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'broadcast' && user?.role === Role.Admin && (
                    <BroadcastForm onSent={refetch} />
                )}
            </div>
        </>
    );
};

export default NotificationCenterPage;