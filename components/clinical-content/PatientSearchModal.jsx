/**
 * Modal de Pesquisa de Pacientes
 * Interface para buscar e selecionar pacientes para vincular protocolos
 */
import React, { useState, useEffect, useRef } from 'react';
import { mockPatientService } from '../../services/mockPatientService';
import { clinicalContentService } from '../../services/clinicalContentService';
export default function PatientSearchModal({ protocolId, protocolTitle, onClose, onAssign }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [assignedPatients, setAssignedPatients] = useState([]);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);
    // Carregar pacientes já atribuídos
    useEffect(() => {
        const assigned = clinicalContentService.protocols.getAssignedPatients(protocolId);
        setAssignedPatients(assigned);
    }, [protocolId]);
    // Focar no input quando o modal abrir
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);
    // Pesquisar pacientes
    useEffect(() => {
        if (searchQuery.length >= 2) {
            setIsSearching(true);
            const results = mockPatientService.searchByName(searchQuery);
            setSearchResults(results);
            setShowResults(true);
            setIsSearching(false);
        }
        else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchQuery]);
    // Fechar resultados quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setSelectedPatient(null);
    };
    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setSearchQuery(patient.name);
        setShowResults(false);
    };
    const handleAssign = () => {
        if (selectedPatient) {
            onAssign(selectedPatient.id);
            onClose();
        }
    };
    const handleRemoveAssignment = (patientId) => {
        clinicalContentService.protocols.unassignFromPatient(protocolId, patientId);
        setAssignedPatients(prev => prev.filter(id => id !== patientId));
    };
    const getPatientById = (patientId) => {
        return mockPatientService.getById(patientId);
    };
    const formatPhone = (phone) => {
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };
    const formatCPF = (cpf) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                👥 Atrelar Protocolo a Paciente
              </h2>
              <p className="text-gray-600 mt-1">
                <strong>Protocolo:</strong> {protocolTitle}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {/* Pacientes já atribuídos */}
          {assignedPatients.length > 0 && (<div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pacientes já atribuídos ({assignedPatients.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedPatients.map(patientId => {
                const patient = getPatientById(patientId);
                if (!patient)
                    return null;
                return (<div key={patientId} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800">{patient.name}</h4>
                          <p className="text-sm text-green-600">
                            {patient.email} • {formatPhone(patient.phone)}
                          </p>
                          <p className="text-xs text-green-500">
                            {calculateAge(patient.birthDate)} anos • {patient.gender === 'M' ? 'Masculino' : 'Feminino'}
                          </p>
                        </div>
                        <button onClick={() => handleRemoveAssignment(patientId)} className="ml-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                          🗑️ Remover
                        </button>
                      </div>
                    </div>);
            })}
              </div>
            </div>)}

          {/* Pesquisa de novos pacientes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Adicionar novo paciente
            </h3>
            
            {/* Campo de pesquisa */}
            <div className="relative" ref={resultsRef}>
              <input ref={searchInputRef} type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Digite o nome do paciente para buscar..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"/>
              
              {isSearching && (<div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>)}

              {/* Resultados da pesquisa */}
              {showResults && searchResults.length > 0 && (<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map(patient => (<div key={patient.id} onClick={() => handlePatientSelect(patient)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-600">
                            {patient.email} • {formatPhone(patient.phone)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {calculateAge(patient.birthDate)} anos • {patient.gender === 'M' ? 'Masculino' : 'Feminino'} • CPF: {formatCPF(patient.cpf)}
                          </p>
                        </div>
                        {assignedPatients.includes(patient.id) && (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Já atribuído
                          </span>)}
                      </div>
                    </div>))}
                </div>)}

              {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <p className="text-gray-500 text-center">Nenhum paciente encontrado</p>
                </div>)}
            </div>
          </div>

          {/* Paciente selecionado */}
          {selectedPatient && (<div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Paciente selecionado
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 text-lg">{selectedPatient.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-blue-700">
                      <p><strong>Email:</strong> {selectedPatient.email}</p>
                      <p><strong>Telefone:</strong> {formatPhone(selectedPatient.phone)}</p>
                      <p><strong>Idade:</strong> {calculateAge(selectedPatient.birthDate)} anos</p>
                      <p><strong>Gênero:</strong> {selectedPatient.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                      <p><strong>CPF:</strong> {formatCPF(selectedPatient.cpf)}</p>
                      <p><strong>Cidade:</strong> {selectedPatient.address.city}/{selectedPatient.address.state}</p>
                    </div>
                    {selectedPatient.medicalInfo.conditions.length > 0 && (<div className="mt-2">
                        <p className="text-sm font-medium text-blue-800">Condições médicas:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.medicalInfo.conditions.map((condition, index) => (<span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {condition}
                            </span>))}
                        </div>
                      </div>)}
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="ml-4 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                    ✕
                  </button>
                </div>
              </div>
            </div>)}

          {/* Botões de ação */}
          <div className="flex gap-4">
            <button onClick={handleAssign} disabled={!selectedPatient || assignedPatients.includes(selectedPatient.id)} className={`flex-1 px-6 py-3 rounded-lg font-semibold ${selectedPatient && !assignedPatients.includes(selectedPatient.id)
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {selectedPatient && assignedPatients.includes(selectedPatient.id)
            ? 'Paciente já atribuído'
            : selectedPatient
                ? 'Atrelar Protocolo'
                : 'Selecione um paciente'}
            </button>
            <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>);
}
