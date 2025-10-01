import React, { useState } from 'react';
import { Users, Plus, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { WaitlistEntry, Patient } from '../../types';

interface WaitlistCompactBannerProps {
  waitlistEntries: WaitlistEntry[];
  patients: Patient[];
  onAddToWaitlist?: () => void;
  onViewWaitlist?: () => void;
}

const WaitlistCompactBanner: React.FC<WaitlistCompactBannerProps> = ({
  waitlistEntries,
  patients,
  onAddToWaitlist,
  onViewWaitlist
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (waitlistEntries.length === 0 && !onAddToWaitlist) {
    return null;
  }

  return (
    <Card className="mb-2 border-blue-200 bg-blue-50/50">
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-blue-600">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                Lista de Espera
              </span>
              {waitlistEntries.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                  {waitlistEntries.length}
                </Badge>
              )}
            </div>
            
            {waitlistEntries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-5 px-1.5 text-xs text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-3 h-3 mr-0.5" />
                {isExpanded ? 'Ocultar' : 'Ver'}
              </Button>
            )}
          </div>

          {onAddToWaitlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToWaitlist}
              className="h-5 px-1.5 text-xs border-blue-300 text-blue-600 hover:bg-blue-100"
            >
              <Plus className="w-3 h-3 mr-0.5" />
              Adicionar
            </Button>
          )}
        </div>

        {isExpanded && waitlistEntries.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {waitlistEntries.slice(0, 2).map((entry) => {
              const patient = patients.find(p => p.id === entry.patientId);
              return (
                <div key={entry.id} className="flex items-center justify-between p-1.5 bg-white rounded border text-xs">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">
                        {patient?.name || `Paciente #${entry.patientId.slice(-4)}`}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {entry.preferredStartFrom ? 
                          new Date(entry.preferredStartFrom).toLocaleDateString('pt-BR') : 
                          'Data flexível'
                        }
                      </span>
                    </div>
                    {entry.urgency > 3 && (
                      <Badge variant="destructive" className="h-4 px-1 text-xs flex-shrink-0">
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {waitlistEntries.length > 2 && (
              <div className="text-xs text-slate-500 text-center py-1">
                +{waitlistEntries.length - 2} mais aguardando...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitlistCompactBanner;
