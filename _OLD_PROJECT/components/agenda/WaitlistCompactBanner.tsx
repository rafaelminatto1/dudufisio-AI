import React, { useState } from 'react';
import { Users, Plus, Eye, Clock, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { WaitlistEntry, Patient } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface WaitlistCompactBannerProps {
  waitlistEntries: WaitlistEntry[];
  patients: Patient[];
  onAddToWaitlist?: () => void;
  onViewWaitlist?: () => void;
  onScheduleFromWaitlist?: (entry: WaitlistEntry) => void;
}

const WaitlistCompactBanner: React.FC<WaitlistCompactBannerProps> = ({
  waitlistEntries,
  patients,
  onAddToWaitlist,
  onViewWaitlist,
  onScheduleFromWaitlist
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (waitlistEntries.length === 0 && !onAddToWaitlist) {
    return null;
  }

  return (
    <Card className="mb-2 border-blue-200 bg-blue-50 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-blue-700">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Lista de Espera
              </span>
              {waitlistEntries.length > 0 && (
                <Badge className="h-5 px-2 text-xs bg-blue-100 text-blue-700 border-blue-200">
                  {waitlistEntries.length}
                </Badge>
              )}
            </div>
            
            {waitlistEntries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <Eye className="w-3 h-3 mr-1" />
                {isExpanded ? 'Ocultar' : 'Ver'}
              </Button>
            )}
          </div>

          {onAddToWaitlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToWaitlist}
              className="h-6 px-2 text-xs border-blue-300 text-blue-600 hover:bg-blue-100 hover:border-blue-400"
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          )}
        </div>

        {isExpanded && waitlistEntries.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {waitlistEntries.slice(0, 2).map((entry) => {
              const patient = patients.find(p => p.id === entry.patientId);
              const hasTimePreferences = entry.preferredStartFrom || entry.preferredStartTo;
              
              return (
                <div 
                  key={entry.id} 
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex items-center justify-between p-3 bg-white rounded-lg border text-xs transition-all duration-200 shadow-sm group",
                    onScheduleFromWaitlist 
                      ? "border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]" 
                      : "border-slate-200 cursor-default"
                  )}
                  onClick={() => onScheduleFromWaitlist?.(entry)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && onScheduleFromWaitlist) {
                      e.preventDefault();
                      onScheduleFromWaitlist(entry);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-1.5 h-1.5 bg-fisio-warning-400 rounded-full flex-shrink-0 animate-pulse"></div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-slate-900">
                          {patient?.name || `Paciente #${entry.patientId.slice(-4)}`}
                        </span>
                        {entry.urgency > 3 && (
                          <Badge className="h-4 px-1.5 text-[10px] bg-red-50 text-red-700 border-red-200 flex-shrink-0">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-slate-600 mt-1 flex-wrap">
                        {entry.preferredStartFrom ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span className="text-xs">
                              {format(new Date(entry.preferredStartFrom), 'dd/MM/yyyy', { locale: ptBR })}
                              {entry.preferredStartTo && ` - ${format(new Date(entry.preferredStartTo), 'dd/MM/yyyy', { locale: ptBR })}`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span className="text-xs">Data flexível</span>
                          </div>
                        )}
                        
                        {hasTimePreferences && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-xs">
                              {entry.preferredStartFrom ? format(new Date(entry.preferredStartFrom), 'HH:mm', { locale: ptBR }) : 'Horário flexível'}
                              {entry.preferredStartTo && ` - ${format(new Date(entry.preferredStartTo), 'HH:mm', { locale: ptBR })}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {onScheduleFromWaitlist && (
                      <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">→</span>
                        </div>
                      </div>
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
