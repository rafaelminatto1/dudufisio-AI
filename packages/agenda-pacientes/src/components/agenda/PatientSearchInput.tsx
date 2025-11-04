import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Patient, PatientSummary } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import * as patientService from '../../services/patientService';
import { QuickRegisterModal } from './QuickRegisterModal';

interface PatientSearchInputProps {
  onSelectPatient: (patient: Patient | PatientSummary | null) => void;
  selectedPatient: Patient | PatientSummary | null;
}

export const PatientSearchInput: React.FC<PatientSearchInputProps> = ({ onSelectPatient, selectedPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [showQuickRegisterModal, setShowQuickRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (selectedPatient) {
        setSearchTerm(selectedPatient.name);
        setShowDropdown(false);
        setSelectedIndex(-1);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const search = async () => {
        if (debouncedSearchTerm.length < 2) {
          setSearchResults([]);
          setShowQuickRegister(false);
          setIsSearching(false);
          return;
        }
        
        setIsSearching(true);
        try {
          const data = await patientService.searchPatients(debouncedSearchTerm);
          setSearchResults(data || []);
          setShowDropdown(true);
          setShowQuickRegister(data.length === 0 && debouncedSearchTerm.length >= 3);
        } catch (error) {
          console.error('Erro na busca de pacientes:', error);
          // Mostrar erro mas permitir cadastro rápido
          setSearchResults([]);
          setShowQuickRegister(debouncedSearchTerm.length >= 3);
          showToast('Erro ao buscar pacientes. Você pode cadastrar um novo.', 'error');
        } finally {
          // Garantir que loading sempre para
          setIsSearching(false);
        }
    };
    search();
  }, [debouncedSearchTerm, showToast]);
  
  const handleQuickRegisterClick = () => {
    if (!searchTerm || searchTerm.length < 3) {
      showToast('Nome deve ter pelo menos 3 caracteres', 'error');
      return;
    }
    setShowQuickRegisterModal(true);
    setShowDropdown(false);
  };

  const handleQuickRegister = async (name: string, phone?: string) => {
    console.log('🔄 Iniciando cadastro rápido:', name, phone);

    try {
      const newPatient = await patientService.quickAddPatient(name, phone);
      console.log('✅ Paciente criado:', newPatient);

      // Garantir que o paciente é selecionado
      console.log('🔄 Chamando onSelectPatient com:', newPatient);
      onSelectPatient(newPatient);
      setSearchTerm(newPatient.name);
      setShowQuickRegister(false);

      showToast(`Paciente "${newPatient.name}" cadastrado com sucesso!`, 'success');

      if (inputRef.current) {
        inputRef.current.classList.add('animate-pulse-green');
        setTimeout(() => inputRef.current?.classList.remove('animate-pulse-green'), 1000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar paciente:', error);
      const errorMessage = error?.message || 'Erro ao cadastrar paciente. Tente novamente.';
      showToast(errorMessage, 'error');
      throw error; // Re-throw para o modal tratar
    }
  };
  
  const handleSelectPatient = (patient: PatientSummary | Patient) => {
    onSelectPatient(patient);
    setSearchTerm(patient.name);
    setShowDropdown(false);
    setShowQuickRegister(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    if (value !== selectedPatient?.name) onSelectPatient(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    const totalItems = searchResults.length + (showQuickRegister ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < searchResults.length) {
            handleSelectPatient(searchResults[selectedIndex]);
          } else if (showQuickRegister) {
            handleQuickRegister();
          }
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder="Digite o nome ou CPF do paciente..."
          className={cn("w-full px-10 py-2 border rounded-md", "focus:ring-2 focus:ring-sky-500 focus:border-transparent", selectedPatient && "border-green-500 bg-green-50")}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <AnimatePresence>
          {isSearching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
            </motion.div>
          )}
          {selectedPatient && !isSearching && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Check className="w-5 h-5 text-green-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {showDropdown && !selectedPatient && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-20 w-full mt-1 bg-white rounded-md shadow-lg border overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.length > 0 && searchResults.map((patient, index) => (
              <button 
                key={patient.id} 
                onClick={() => handleSelectPatient(patient)} 
                className={cn(
                  "w-full px-4 py-2 text-left transition-colors",
                  selectedIndex === index ? "bg-sky-100 text-sky-900" : "hover:bg-sky-50"
                )}
              >
                <p className="font-medium text-gray-900">{patient.name}</p>
                <p className="text-sm text-gray-500">{patient.cpf}</p>
              </button>
            ))}
            
            {showQuickRegister && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleQuickRegisterClick}
                className={cn(
                  "w-full p-3 border-t transition-colors",
                  selectedIndex === searchResults.length
                    ? "bg-green-100 text-green-900"
                    : "bg-green-50 hover:bg-green-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-sm text-gray-900">
                    {`Cadastrar "${searchTerm}"`}
                  </p>
                </div>
              </motion.button>
            )}
            
            {debouncedSearchTerm.length >= 2 && searchResults.length === 0 && !showQuickRegister && !isSearching && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Nenhum paciente encontrado.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Digite pelo menos 3 caracteres para cadastrar novo paciente.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Register Modal */}
      <QuickRegisterModal
        isOpen={showQuickRegisterModal}
        onClose={() => setShowQuickRegisterModal(false)}
        onConfirm={handleQuickRegister}
        initialName={searchTerm}
      />
    </div>
  );
};
