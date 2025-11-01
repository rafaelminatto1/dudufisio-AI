import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useData } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import CheckInPanel from '../components/checkin/CheckInPanel';
import QRCodeGenerator from '../components/checkin/QRCodeGenerator';
import { EnrichedAppointment } from '../types';
import * as appointmentService from '../services/appointmentService';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, refetch } = useAppointments(new Date(), new Date());
  const { therapists } = useData();
  const { showToast } = useToast();
  const [selectedAppointmentForQR, setSelectedAppointmentForQR] = useState<EnrichedAppointment | null>(null);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) return;

      // Atualizar status para completed (ou criar um status específico de checked-in)
      await appointmentService.saveAppointment({
        ...appointment,
        status: 'scheduled', // Manter como scheduled mas poderia ter um status "checked-in"
        notes: `${appointment.notes || ''}\nCheck-in realizado em ${new Date().toLocaleString('pt-BR')}`
      });

      showToast(`Check-in realizado para ${appointment.patientName}!`, 'success');
      refetch();
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      showToast('Erro ao fazer check-in', 'error');
    }
  };

  const handleGenerateQRCode = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setSelectedAppointmentForQR(appointment);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/agenda')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Agenda
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <CheckInPanel
          appointments={appointments}
          onCheckIn={handleCheckIn}
          onGenerateQRCode={handleGenerateQRCode}
        />
      </div>

      {/* QR Code Dialog */}
      <QRCodeGenerator
        isOpen={!!selectedAppointmentForQR}
        onClose={() => setSelectedAppointmentForQR(null)}
        appointment={selectedAppointmentForQR}
      />
    </div>
  );
};

export default CheckInPage;


