// components/TaskCard.tsx
import React from 'react';
import { Calendar, ChevronsUp, ChevronUp, ChevronsDown } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    therapist?: Therapist;
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const priorityInfo = {
    [TaskPriority.High]: { icon: <ChevronsUp className="w-4 h-4 text-red-600" />, color: 'bg-red-50 border-red-200' },
    [TaskPriority.Medium]: { icon: <ChevronUp className="w-4 h-4 text-yellow-600" />, color: 'bg-yellow-50 border-yellow-200' },
    [TaskPriority.Low]: { icon: <ChevronsDown className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50 border-blue-200' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, therapist, onClick, onDragStart }) => {
    const { icon, color } = priorityInfo[task.priority];
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < new Date() && task.status !== 'Concluído';

    return (
        <div
            onClick={onClick}
            draggable="true"
            onDragStart={(e) => onDragStart(e, task.id)}
            className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg border border-slate-200 cursor-grab active:cursor-grabbing transition-all duration-200"
        >
            <h4 className="font-semibold text-slate-800 text-sm mb-1">{task.title}</h4>
            <p className="text-xs text-slate-500 mb-3">{task.description}</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-md border ${color}`} title={`Prioridade: ${task.priority}`}>
                        {icon}
                    </div>
                    <div className={`flex items-center text-xs px-2 py-0.5 rounded-full border ${isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                </div>
                {therapist && (
                     <img
                        src={therapist.avatarUrl}
                        alt={therapist.name}
                        title={`Responsável: ${therapist.name}`}
                        className="w-7 h-7 rounded-full ring-2 ring-white"
                    />
                )}
            </div>
        </div>
    );
};

export default TaskCard;