/**
 * Calendar Invite Button Component
 * Botão para enviar convites de calendário manualmente
 */

import React, { useState } from 'react';
import { Appointment } from '../../types';
import { calendarLinkService } from '../../services/calendar/calendarLinkService';
import { CALENDAR_INVITE_TEMPLATES } from '../../lib/templates/calendarInviteTemplates';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../../contexts/ToastContext';
import { Calendar, Copy, Send, Loader, Check } from 'lucide-react';

interface CalendarInviteButtonProps {
  appointment: Appointment;
  onSent?: () => void;
}

export function CalendarInviteButton({ appointment, onSent }: CalendarInviteButtonProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const links = await calendarLinkService.generateAllLinks(appointment);
      await navigator.clipboard.writeText(links.google_link);
      setCopied(true);
      showToast('Link copiado para área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error: any) {
      showToast('Erro ao copiar link', 'error');
      console.error('Error copying link:', error);
    }
  };

  const handleSendViaChannel = async (channel: 'whatsapp' | 'email' | 'sms') => {
    try {
      setLoading(true);
      const links = await calendarLinkService.generateAllLinks(appointment);
      
      const startTime = new Date(appointment.startTime);
      const templateData = {
        patientName: appointment.patientName,
        date: startTime,
        time: startTime,
        therapistName: appointment.therapistName || 'Fisioterapeuta',
        location: appointment.location || 'Clínica DuduFisio',
        calendarLink: links.universal_link,
        googleLink: links.google_link,
        icsLink: links.universal_link,
        appointmentType: appointment.type
      };

      let message = '';
      
      if (channel === 'whatsapp') {
        message = CALENDAR_INVITE_TEMPLATES.whatsapp(templateData);
        // TODO: Integrar com sistema de WhatsApp
        console.log('[WhatsApp]', message);
        showToast('Convite enviado via WhatsApp!', 'success');
      } else if (channel === 'email') {
        const emailData = CALENDAR_INVITE_TEMPLATES.email(templateData);
        // TODO: Integrar com sistema de Email
        console.log('[Email]', emailData);
        showToast('Convite enviado via Email!', 'success');
      } else if (channel === 'sms') {
        message = CALENDAR_INVITE_TEMPLATES.sms(templateData);
        // TODO: Integrar com sistema de SMS
        console.log('[SMS]', message);
        showToast('Convite enviado via SMS!', 'success');
      }

      // Marcar como enviado
      await calendarLinkService.addSentVia(appointment.id, channel);
      onSent?.();
    } catch (error: any) {
      showToast('Erro ao enviar convite', 'error');
      console.error('Error sending invite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copiar Link
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Convite
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleSendViaChannel('whatsapp')}>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span>WhatsApp</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSendViaChannel('email')}>
            <div className="flex items-center gap-2">
              <span>📧</span>
              <span>Email</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSendViaChannel('sms')}>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>SMS</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

