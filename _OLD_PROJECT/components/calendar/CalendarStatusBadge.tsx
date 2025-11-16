/**
 * Calendar Status Badge Component
 * Badge para mostrar status do link de calendário
 */

import React from 'react';
import { CalendarLink } from '../../types';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface CalendarStatusBadgeProps {
  calendarLink?: CalendarLink | null;
  compact?: boolean;
}

export function CalendarStatusBadge({ calendarLink, compact = false }: CalendarStatusBadgeProps) {
  if (!calendarLink) {
    return null;
  }

  // Link foi acessado
  if (calendarLink.link_accessed) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        {!compact && 'Link acessado'}
      </Badge>
    );
  }

  // Link foi enviado mas não acessado
  if (calendarLink.sent_via && calendarLink.sent_via.length > 0) {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
        <Clock className="w-3 h-3 mr-1" />
        {!compact && 'Convite enviado'}
      </Badge>
    );
  }

  // Link gerado mas não enviado
  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
      <Calendar className="w-3 h-3 mr-1" />
      {!compact && 'Link disponível'}
    </Badge>
  );
}

/**
 * Badge compacto para uso em listas
 */
export function CalendarStatusBadgeCompact({ calendarLink }: CalendarStatusBadgeProps) {
  return <CalendarStatusBadge calendarLink={calendarLink} compact />;
}

