import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Patient } from '@/types';
import { supabasePatientService } from '@/services/supabase/patientServiceSupabase';

interface PatientDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSuccess: () => void;
}

export default function PatientDeleteDialog({ 
  open, 
  onOpenChange, 
  patient, 
  onSuccess 
}: PatientDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!patient) return;

    try {
      setIsDeleting(true);
      await supabasePatientService.deletePatient(patient.id);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!patient) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o paciente <strong>{patient.name}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados ao paciente 
            serão permanentemente removidos do sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Paciente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
