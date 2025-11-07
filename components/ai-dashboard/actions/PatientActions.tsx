/**
 * Patient Actions Component
 * Handles patient communication actions (Call, WhatsApp, Email)
 */

import React from 'react';
import { Phone, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { saveUserAction } from '@/lib/services/ai-dashboard.service';

interface PatientActionsProps {
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function PatientActions({
  patientId,
  patientName,
  patientPhone,
  patientEmail,
  size = 'default',
}: PatientActionsProps) {
  const handleCall = async () => {
    if (!patientPhone) {
      toast({
        title: 'Telefone não disponível',
        description: `Nenhum telefone cadastrado para ${patientName}`,
        variant: 'destructive',
      });
      return;
    }

    // Track action
    try {
      await saveUserAction({
        userId: 'current-user-id', // TODO: Get from auth context
        actionType: 'call',
        targetId: patientId,
        metadata: { patientName, phone: patientPhone },
      });
    } catch (error) {
      console.error('Error tracking action:', error);
    }

    // Open phone dialer
    window.location.href = `tel:${patientPhone}`;

    toast({
      title: 'Ligação iniciada',
      description: `Ligando para ${patientName}`,
      variant: 'default',
    });
  };

  const handleWhatsApp = async () => {
    if (!patientPhone) {
      toast({
        title: 'Telefone não disponível',
        description: `Nenhum telefone cadastrado para ${patientName}`,
        variant: 'warning',
      });
      return;
    }

    // Track action
    try {
      await saveUserAction({
        userId: 'current-user-id', // TODO: Get from auth context
        actionType: 'whatsapp',
        targetId: patientId,
        metadata: { patientName, phone: patientPhone },
      });
    } catch (error) {
      console.error('Error tracking action:', error);
    }

    // Format phone for WhatsApp (remove special chars)
    const cleanPhone = patientPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    
    // Open in new window
    window.open(whatsappUrl, '_blank');

    toast({
      title: 'WhatsApp aberto',
      description: `Conversando com ${patientName}`,
      variant: 'default',
    });
  };

  const handleEmail = async () => {
    if (!patientEmail) {
      toast({
        title: 'Email não disponível',
        description: `Nenhum email cadastrado para ${patientName}`,
        variant: 'destructive',
      });
      return;
    }

    // Track action
    try {
      await saveUserAction({
        userId: 'current-user-id', // TODO: Get from auth context
        actionType: 'email',
        targetId: patientId,
        metadata: { patientName, email: patientEmail },
      });
    } catch (error) {
      console.error('Error tracking action:', error);
    }

    // Open email client
    window.location.href = `mailto:${patientEmail}?subject=Contato da Clínica`;

    toast({
      title: 'Email aberto',
      description: `Enviando email para ${patientName}`,
      variant: 'default',
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        size={size}
        variant="outline"
        onClick={handleCall}
        disabled={!patientPhone}
        className="flex-1"
      >
        <Phone className="w-4 h-4 mr-2" />
        Ligar
      </Button>
      <Button
        size={size}
        variant="outline"
        onClick={handleWhatsApp}
        disabled={!patientPhone}
        className="flex-1"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        WhatsApp
      </Button>
      <Button
        size={size}
        variant="outline"
        onClick={handleEmail}
        disabled={!patientEmail}
        className="flex-1"
      >
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>
    </div>
  );
}
