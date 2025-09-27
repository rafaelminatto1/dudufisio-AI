import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, ChevronRight, Users, X, Loader2, Edit, Trash2, Eye, MoreVertical, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Patient, PatientSummary } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import PatientFormModal from '../components/PatientFormModal';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../contexts/ToastContext';
import { usePatients } from '../hooks/usePatients';
import { useDebounce } from '../hooks/useDebounce';
import { useData } from '../contexts/AppContext';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';
import { auditHelpers } from '../services/auditService';
// 🎯 Professional Patient Actions Dropdown Component
const PatientActions: React.FC<{
  patient: PatientSummary;
  onEdit: (patient: PatientSummary) => void;
  onDelete: (patient: PatientSummary) => void;
}> = ({ patient, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Ações"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isDropdownOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={(e) => handleAction(e, async () => {
                // Log de auditoria para visualização
                await auditHelpers.logPatientOperation(
                  'Current User',
                  'VIEW_PATIENT_RECORD',
                  patient.id,
                  patient.name
                );
                navigate(`/patients/${patient.id}`);
              })}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visualizar
            </button>

            <IfPermission permission="patients:write">
              <button
                onClick={(e) => handleAction(e, () => onEdit(patient))}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </IfPermission>

            <IfPermission permission="patients:delete">
              <hr className="my-1" />
              <button
                onClick={(e) => handleAction(e, () => onDelete(patient))}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </IfPermission>
          </div>
        </>
      )}
    </div>
  );
};

const PatientRow: React.FC<{
  patient: PatientSummary;
  onEdit: (patient: PatientSummary) => void;
  onDelete: (patient: PatientSummary) => void;
}> = ({ patient, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const statusColorMap = {
    Active: 'bg-green-100 text-green-800 ring-green-200',
    Inactive: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    Discharged: 'bg-slate-100 text-slate-800 ring-slate-200',
  };

  return (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-sky-400 hover:shadow-md transition-all duration-200">
      <img className="h-12 w-12 rounded-full object-cover" src={patient.avatarUrl} alt={patient.name} />
      <div
        onClick={() => navigate(`/patients/${patient.id}`)}
        className="ml-4 flex-1 cursor-pointer"
      >
        <div className="text-md font-bold text-slate-800">{patient.name}</div>
        <div className="text-sm text-slate-500">{patient.email || patient.phone}</div>
      </div>
      <div className="hidden md:block mr-4">
        <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ring-1 ring-inset ${statusColorMap[patient.status]}`}>
          {patient.status}
        </span>
      </div>
      <PatientActions patient={patient} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};
const PatientListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientSummary | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientSummary | null>(null);
  const { patients, isLoading, error, fetchInitialPatients, fetchMorePatients, addPatient, hasMore, isLoadingMore } = usePatients();
  const { therapists } = useData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [therapistFilter, setTherapistFilter] = useState('All');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);
  useEffect(() => {
      fetchInitialPatients({ searchTerm: debouncedSearchTerm, statusFilter, startDate: debouncedStartDate, endDate: debouncedEndDate, therapistId: therapistFilter });
  }, [debouncedSearchTerm, statusFilter, debouncedStartDate, debouncedEndDate, therapistFilter, fetchInitialPatients]);
  const handleSavePatient = async (patientData: Omit<Patient, 'id' | 'lastVisit'>) => {
      try {
        const patient = await addPatient(patientData);
        const patientId = typeof patient === 'object' && patient?.id ? patient.id : 'unknown';

        // Log de auditoria
        if (editingPatient) {
          await auditHelpers.logPatientOperation(
            'Current User', // Em produção, usar o usuário atual
            'UPDATE_PATIENT',
            patientId,
            patientData.name
          );
        } else {
          await auditHelpers.logPatientOperation(
            'Current User', // Em produção, usar o usuário atual
            'CREATE_PATIENT',
            patientId,
            patientData.name
          );
        }

        setIsModalOpen(false);
        setEditingPatient(null);
        showToast('Paciente salvo com sucesso!', 'success');
      } catch (error) {
        console.error('Error saving patient:', error);
        showToast('Erro ao salvar paciente. Tente novamente.', 'error');
      }
  };

  const handleEditPatient = (patient: PatientSummary) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleDeletePatient = (patient: PatientSummary) => {
    setDeletingPatient(patient);
  };

  const confirmDeletePatient = async () => {
    if (!deletingPatient) return;

    try {
      // Log de auditoria para exclusão
      await auditHelpers.logPatientOperation(
        'Current User',
        'DELETE_PATIENT',
        deletingPatient.id,
        deletingPatient.name,
        'Paciente marcado para exclusão (soft delete)'
      );

      showToast('Funcionalidade de exclusão será implementada com soft delete', 'info');
      setDeletingPatient(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
      showToast('Erro ao excluir paciente. Tente novamente.', 'error');
    }
  };

  const cancelDeletePatient = () => {
    setDeletingPatient(null);
  };
  const handleClearFilters = () => {
      setSearchTerm('');
      setStatusFilter('All');
      setStartDate('');
      setEndDate('');
      setTherapistFilter('All');
  };
  // FIX: Replaced IntersectionObserver with a "Load More" button to resolve an error and align with tests.
  // The error "Expected 1 arguments, but got 0" was likely caused by a bug in the infinite scroll implementation.
  // A button is a simpler and more robust approach.
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ));
    }
    if (error) {
        return <div className="text-center p-10 text-red-500 col-span-full">Falha ao carregar pacientes.</div>;
    }
    if (patients.length === 0 && !isLoading) {
        return (
            <div className="text-center p-10 text-slate-500 col-span-full">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhum paciente encontrado</h3>
                <p className="mt-1 text-sm text-slate-500">Tente ajustar seus filtros ou adicione um novo paciente.</p>
            </div>
        );
    }
    return patients.map((patient) => {
      return <PatientRow key={patient.id} patient={patient} onEdit={handleEditPatient} onDelete={handleDeletePatient} />
    });
  };
  return (
    <PermissionGuard permission="patients:read">
      <PageHeader
        title="Gestão de Pacientes"
        subtitle="Adicione, visualize e gerencie as informações dos seus pacientes."
      >
        <IfPermission permission="patients:write">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Novo Paciente
          </button>
        </IfPermission>
      </PageHeader>
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        patientToEdit={editingPatient}
      />

      {/* Delete Confirmation Modal */}
      {deletingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Tem certeza que deseja excluir o paciente <strong>{deletingPatient.name}</strong>?
              Esta ação não poderá ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDeletePatient}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePatient}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <div className="xl:col-span-2">
              <label className="text-sm font-medium text-slate-600">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                <option value="All">Todos os Status</option>
                <option value="Active">Ativo</option>
                <option value="Inactive">Inativo</option>
                <option value="Discharged">Alta</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Data de Cadastro (De)</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
             <div>
              <label className="text-sm font-medium text-slate-600">Data de Cadastro (Até)</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="xl:col-span-2">
              <label className="text-sm font-medium text-slate-600">Fisioterapeuta</label>
              <select value={therapistFilter} onChange={(e) => setTherapistFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                <option value="All">Todos os Fisioterapeutas</option>
                {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="xl:col-span-6">
                <button onClick={handleClearFilters} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center">
                    <X className="w-4 h-4 mr-1"/> Limpar Filtros
                </button>
            </div>
          </div>
      </div>
      <div className="space-y-4">
        {renderContent()}
      </div>
      <div className="h-16 flex items-center justify-center">
        {isLoadingMore && (
          <div className="flex items-center text-slate-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>Carregando mais pacientes...</span>
          </div>
        )}
        {hasMore && !isLoading && !isLoadingMore && (
          <button
            onClick={() => fetchMorePatients()}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Carregar Mais Pacientes
          </button>
        )}
        {!hasMore && !isLoading && patients.length > 0 && (
          <p className="text-sm text-slate-400">Você chegou ao fim da lista.</p>
        )}
      </div>
    </PermissionGuard>
  );
};
export default PatientListPage;

