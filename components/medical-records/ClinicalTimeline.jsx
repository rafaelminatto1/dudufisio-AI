/**
 * Componente: Timeline Clínica
 * Timeline visual de eventos clínicos do paciente
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Activity, Calendar, Clock } from 'lucide-react';
export function ClinicalTimeline({ events, onEventClick }) {
    const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());
    const getEventIcon = (type) => {
        switch (type) {
            case 'assessment':
                return FileText;
            case 'evolution':
                return Activity;
            default:
                return Calendar;
        }
    };
    const getEventColor = (type) => {
        switch (type) {
            case 'assessment':
                return 'bg-blue-100 text-blue-800';
            case 'evolution':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (<Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <Clock className="h-6 w-6 text-gray-600 mr-3"/>
          <h2 className="text-2xl font-bold">Timeline Clínica</h2>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"/>

            <div className="space-y-6">
              {sortedEvents.map((event, index) => {
            const Icon = getEventIcon(event.type);
            return (<div key={event.id} className={`relative flex items-start space-x-4 ${onEventClick ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2' : ''}`} onClick={() => onEventClick?.(event)}>
                    {/* Ícone do evento */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getEventColor(event.type)}`}>
                        <Icon className="h-6 w-6"/>
                      </div>
                    </div>

                    {/* Conteúdo do evento */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <Badge variant="outline" className="flex-shrink-0 ml-2">
                          {event.date.toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {event.date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                      </p>
                    </div>
                  </div>);
        })}

              {sortedEvents.length === 0 && (<div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400"/>
                  <p className="text-lg font-medium">Nenhum evento registrado</p>
                  <p className="text-sm">Os eventos clínicos aparecerão aqui</p>
                </div>)}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>);
}
