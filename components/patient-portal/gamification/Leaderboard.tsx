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
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-800">Ranking de pacientes</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => {
          const isHighlighted = entry.patientId === highlightPatientId;
          return (
            <div
              key={entry.patientId}
              className={`flex items-center justify-between border rounded-xl px-3 py-2 text-sm ${
                isHighlighted ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${entry.position === 1 ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-600'}`}>
                  {entry.position}
                </span>
                <img src={entry.avatarUrl} alt={entry.patientName} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-slate-800">{entry.patientName}</p>
                  <p className="text-xs text-slate-500">Nível {entry.level} • Streak {entry.streak}d</p>
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
