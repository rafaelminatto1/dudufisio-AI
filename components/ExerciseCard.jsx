import React from 'react';
import { Edit, Trash2, PlayCircle } from 'lucide-react';
const difficultyColors = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-sky-100 text-sky-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800',
};
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
const ExerciseCard = ({ exercise, onEdit, onDelete, onPlay }) => {
    const stopPropagation = (e) => e.stopPropagation();
    // Safe access to all properties with fallbacks
    const hasVideo = exercise?.media?.videoUrl;
    const thumbnailUrl = exercise?.media?.thumbnailUrl || '/placeholder-exercise.jpg';
    const duration = exercise?.media?.duration;
    const bodyParts = exercise?.bodyParts || [];
    const name = exercise?.name || 'Exercício sem nome';
    const category = exercise?.category || 'Sem categoria';
    const difficulty = exercise?.difficulty || 1;
    return (<div onClick={hasVideo ? onPlay : undefined} className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden group ${hasVideo ? 'cursor-pointer' : ''}`}>
            <div className="relative">
                <img src={thumbnailUrl} alt={name} className="w-full h-40 object-cover" onError={(e) => {
            e.currentTarget.src = '/placeholder-exercise.jpg';
        }}/>
                 {hasVideo && (<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle className="w-16 h-16 text-white/80"/>
                    </div>)}
                {duration && (<div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-mono">
                         {formatDuration(duration)}
                     </div>)}
                 <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={stopPropagation}>
                    <button onClick={onEdit} className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white hover:text-teal-600 transition-colors">
                        <Edit className="w-4 h-4"/>
                    </button>
                    <button onClick={onDelete} className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800 flex-1 pr-2">{name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficultyColors[difficulty]}`}>
                        Nível {difficulty}
                    </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{category}</p>
                <div className="mt-4 flex flex-wrap gap-2 flex-grow content-start">
                    {bodyParts.slice(0, 3).map(part => (<span key={part} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">{part}</span>))}
                </div>
            </div>
        </div>);
};
export default ExerciseCard;
