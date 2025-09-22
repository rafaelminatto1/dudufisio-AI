import React from 'react';
import { SoapNote } from '../../types';

interface ClinicalHistoryTimelineProps {
  notes: SoapNote[];
}

const ClinicalHistoryTimeline: React.FC<ClinicalHistoryTimelineProps> = ({ notes }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Nenhuma anotação clínica encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="border-l-4 border-sky-200 pl-4 py-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">
                {new Date(note.date).toLocaleDateString('pt-BR')}
              </h4>
              <div className="mt-2 space-y-2">
                {note.subjective && (
                  <div>
                    <span className="font-medium text-slate-600">Subjetivo:</span>
                    <p className="text-slate-700">{note.subjective}</p>
                  </div>
                )}
                {note.objective && (
                  <div>
                    <span className="font-medium text-slate-600">Objetivo:</span>
                    <p className="text-slate-700">{note.objective}</p>
                  </div>
                )}
                {note.assessment && (
                  <div>
                    <span className="font-medium text-slate-600">Avaliação:</span>
                    <p className="text-slate-700">{note.assessment}</p>
                  </div>
                )}
                {note.plan && (
                  <div>
                    <span className="font-medium text-slate-600">Plano:</span>
                    <p className="text-slate-700">{note.plan}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClinicalHistoryTimeline;