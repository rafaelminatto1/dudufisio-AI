/**
 * components/common/ConfirmDialog.tsx
 * Componente reutilizável para diálogos de confirmação
 */
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '../ui/alert-dialog';
import { AlertTriangle, Info, HelpCircle, AlertCircle } from 'lucide-react';
// ============================================================================
// VARIANT CONFIGS
// ============================================================================
const variantConfig = {
    default: {
        icon: HelpCircle,
        iconColor: 'text-blue-500',
        confirmButton: 'bg-blue-600 hover:bg-blue-700',
    },
    destructive: {
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        confirmButton: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
        icon: AlertCircle,
        iconColor: 'text-yellow-500',
        confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        confirmButton: 'bg-blue-600 hover:bg-blue-700',
    },
};
// ============================================================================
// COMPONENT
// ============================================================================
export function ConfirmDialog({ open, onOpenChange, title, description, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'default', onConfirm, onCancel, isLoading = false, }) {
    const config = variantConfig[variant];
    const Icon = config.icon;
    const handleConfirm = async () => {
        await onConfirm();
        onOpenChange(false);
    };
    const handleCancel = () => {
        if (onCancel)
            onCancel();
        onOpenChange(false);
    };
    return (<AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${config.iconColor}`}/>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className={config.confirmButton}>
            {isLoading ? 'Processando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>);
}
/**
 * Diálogo de confirmação de exclusão pré-configurado
 */
export function DeleteConfirmDialog({ open, onOpenChange, itemName, itemType = 'item', onConfirm, isLoading, }) {
    return (<ConfirmDialog open={open} onOpenChange={onOpenChange} title={`Excluir ${itemType}?`} description={`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`} confirmText="Sim, excluir" cancelText="Cancelar" variant="destructive" onConfirm={onConfirm} isLoading={isLoading}/>);
}
/**
 * Diálogo de confirmação de salvamento pré-configurado
 */
export function SaveConfirmDialog({ open, onOpenChange, message = 'Você tem alterações não salvas. Deseja salvá-las antes de sair?', onConfirm, onCancel, isLoading, }) {
    return (<ConfirmDialog open={open} onOpenChange={onOpenChange} title="Salvar alterações?" description={message} confirmText="Salvar" cancelText="Descartar" variant="warning" onConfirm={onConfirm} onCancel={onCancel} isLoading={isLoading}/>);
}
/**
 * Diálogo de confirmação de alta do paciente
 */
export function DischargeConfirmDialog({ open, onOpenChange, patientName, onConfirm, isLoading, }) {
    return (<ConfirmDialog open={open} onOpenChange={onOpenChange} title="Dar alta ao paciente?" description={`Tem certeza que deseja dar alta a ${patientName}? O paciente será marcado como "Concluído" e removido da lista de atendimentos ativos.`} confirmText="Sim, dar alta" cancelText="Cancelar" variant="warning" onConfirm={onConfirm} isLoading={isLoading}/>);
}
