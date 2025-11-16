import React from 'react';
import { Edit, Trash2, PlayCircle } from 'lucide-react';

interface ExerciseCardProps {
    exercise: Exercise;
    onEdit: () => void;
    onDelete: () => void;
    onPlay: () => void;
}

const difficultyColors: Record<number, string> = {
    1: 'bg-green-50 text-green-700 border-green-200',
    2: 'bg-blue-50 text-blue-700 border-blue-200',
    3: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    4: 'bg-orange-50 text-orange-700 border-orange-200',
    5: 'bg-red-50 text-red-700 border-red-200',
};

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onEdit, onDelete, onPlay }) => {
    
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    // Safe access to all properties with fallbacks
    const hasVideo = exercise?.media?.videoUrl;
    const thumbnailUrl = exercise?.media?.thumbnailUrl || '/placeholder-exercise.jpg';
    const duration = exercise?.media?.duration;
    const bodyParts = exercise?.bodyParts || [];
    const name = exercise?.name || 'Exercício sem nome';
    const category = exercise?.category || 'Sem categoria';
    const difficulty = exercise?.difficulty || 1;

    return (
        <div 
            onClick={hasVideo ? onPlay : undefined} 
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group border border-slate-200 ${hasVideo ? 'cursor-pointer' : ''}`}
        >
            <div className="relative">
                <img
                    src={thumbnailUrl}
                    alt={name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                        e.currentTarget.src = '/placeholder-exercise.jpg';
                    }}
                />
                 {hasVideo && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle className="w-16 h-16 text-white/80" />
                    </div>
                )}
                {duration && (
                     <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-mono">
                         {formatDuration(duration)}
                     </div>
                )}
                 <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={stopPropagation}>
                    <button onClick={onEdit} className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white hover:text-teal-600 transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800 flex-1 pr-2">{name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${difficultyColors[difficulty]}`}>
                        Nível {difficulty}
                    </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{category}</p>
                <div className="mt-4 flex flex-wrap gap-2 flex-grow content-start">
                    {bodyParts.slice(0, 3).map(part => (
                        <span key={part} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">{part}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExerciseCard;