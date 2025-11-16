import React from 'react';
import { Crown } from 'lucide-react';
import { GamificationLeaderboardEntry } from '../../../types';

interface LeaderboardProps {
  entries: GamificationLeaderboardEntry[];
  highlightPatientId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, highlightPatientId }) => {
  if (!entries.length) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-slate-900">Ranking de pacientes</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => {
          const isHighlighted = entry.patientId === highlightPatientId;
          return (
            <div
              key={entry.patientId}
              className={`flex items-center justify-between border rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                isHighlighted ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${entry.position === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-white text-slate-600 border-slate-300'}`}>
                  {entry.position}
                </span>
                <img src={entry.avatarUrl || `https://i.pravatar.cc/150?u=${entry.patientId}`} alt={entry.patientName} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-slate-900">{entry.patientName}</p>
                  <p className="text-xs text-slate-600">Nível {entry.level} • Streak {entry.streak}d</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700">{entry.points} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
