import React, { useState } from 'react';
import { EnrichedAppointment, Therapist } from '../../types';
import MobileToolbar from './MobileToolbar';
import MobileDayView from './MobileDayView';
import MobileAppointmentDrawer from './MobileAppointmentDrawer';
import MobileFAB from './MobileFAB';
import { useMobileGestures } from '../../hooks/useMobileGestures';
import { shouldReduceMotion } from '../../lib/mobileOptimizations';
import { motion } from 'framer-motion';

interface MobileAgendaViewProps {
  appointments: EnrichedAppointment[];
  currentDate: Date;
  therapists: Therapist[];
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  onNewAppointment: () => void;
  onWaitlist: () => void;
  onCheckIn: () => void;
  onFilters: () => void;
  onEdit?: (appointment: EnrichedAppointment) => void;
  onDelete?: (appointment: EnrichedAppointment) => void;
  onCall?: (appointment: EnrichedAppointment) => void;
  onMarkComplete?: (appointment: EnrichedAppointment) => void;
  onMarkPaid?: (appointment: EnrichedAppointment) => void;
  notificationCount?: number;
}

const MobileAgendaView: React.FC<MobileAgendaViewProps> = ({
  appointments,
  currentDate,
  therapists,
  onDateChange,
  onAppointmentClick,
  onNewAppointment,
  onWaitlist,
  onCheckIn,
  onFilters,
  onEdit,
  onDelete,
  onCall,
  onMarkComplete,
  onMarkPaid,
  notificationCount = 0
}) => {
  const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Navegação entre dias
  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Gestos de navegação
  const bind = useMobileGestures({
    onSwipeLeft: handleNextDay,
    onSwipeRight: handlePrevDay,
    enabled: !isDrawerOpen
  });

  // Abrir drawer com agendamento
  const handleAppointmentClick = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAppointment(null);
  };

  // Actions do drawer
  const handleEdit = () => {
    if (selectedAppointment && onEdit) {
      onEdit(selectedAppointment);
    }
  };

  const handleDelete = () => {
    if (selectedAppointment && onDelete) {
      onDelete(selectedAppointment);
    }
  };

  const handleCall = () => {
    if (selectedAppointment && onCall) {
      onCall(selectedAppointment);
    }
  };

  const handleMarkComplete = () => {
    if (selectedAppointment && onMarkComplete) {
      onMarkComplete(selectedAppointment);
    }
  };

  const handleMarkPaid = () => {
    if (selectedAppointment && onMarkPaid) {
      onMarkPaid(selectedAppointment);
    }
  };

  const reduceMotion = shouldReduceMotion();

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Toolbar */}
      <MobileToolbar
        currentDate={currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        onMenuClick={onFilters}
        notificationCount={notificationCount}
      />

      {/* Main Content with Gestures */}
      <motion.div
        {...bind()}
        className="flex-1 overflow-y-auto"
        style={{
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
        animate={reduceMotion ? {} : {
          x: 0,
          transition: { duration: 0.3 }
        }}
      >
        <MobileDayView
          appointments={appointments}
          onAppointmentClick={handleAppointmentClick}
          compact={true}
        />
      </motion.div>

      {/* FAB */}
      <MobileFAB
        onNewAppointment={onNewAppointment}
        onWaitlist={onWaitlist}
        onCheckIn={onCheckIn}
        onFilters={onFilters}
      />

      {/* Drawer */}
      <MobileAppointmentDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        appointment={selectedAppointment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCall={handleCall}
        onMarkComplete={handleMarkComplete}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
};

export default MobileAgendaView;

