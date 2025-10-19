import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { EnrichedAppointment, Patient, Therapist } from '../../types';

interface SmartSearchProps {
  appointments: EnrichedAppointment[];
  patients: Patient[];
  therapists: Therapist[];
  onSearch: (query: string) => void;
  onSelectResult: (result: EnrichedAppointment) => void;
  searchQuery: string;
  className?: string;
}

interface SearchResult {
  type: 'appointment' | 'patient' | 'therapist';
  appointment?: EnrichedAppointment;
  patient?: Patient;
  therapist?: Therapist;
  matchScore: number;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  appointments,
  patients,
  therapists,
  onSearch,
  onSelectResult,
  searchQuery,
  className
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const history = localStorage.getItem('agenda_search_history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Erro ao carregar histórico de busca:', error);
      }
    }
  }, []);

  // Salvar no histórico
  const saveToHistory = (query: string) => {
    if (!query || query.length < 2) return;
    
    const updated = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('agenda_search_history', JSON.stringify(updated));
  };

  // Buscar sugestões
  useEffect(() => {
    if (localQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const query = localQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Buscar em agendamentos
    appointments.forEach(appointment => {
      let score = 0;
      
      if (appointment.patientName.toLowerCase().includes(query)) {
        score += 10;
      }
      if (appointment.therapistName?.toLowerCase().includes(query)) {
        score += 8;
      }
      if (appointment.type.toLowerCase().includes(query)) {
        score += 5;
      }
      if (appointment.observations?.toLowerCase().includes(query)) {
        score += 3;
      }

      if (score > 0) {
        results.push({
          type: 'appointment',
          appointment,
          matchScore: score
        });
      }
    });

    // Buscar em pacientes
    patients.forEach(patient => {
      let score = 0;
      
      if (patient.name.toLowerCase().includes(query)) {
        score += 10;
      }
      if (patient.cpf?.includes(query)) {
        score += 15;
      }
      if (patient.phone?.includes(query)) {
        score += 8;
      }
      if (patient.email?.toLowerCase().includes(query)) {
        score += 5;
      }

      if (score > 0) {
        results.push({
          type: 'patient',
          patient,
          matchScore: score
        });
      }
    });

    // Buscar em terapeutas
    therapists.forEach(therapist => {
      if (therapist.name.toLowerCase().includes(query)) {
        results.push({
          type: 'therapist',
          therapist,
          matchScore: 10
        });
      }
    });

    // Ordenar por score
    results.sort((a, b) => b.matchScore - a.matchScore);
    setSuggestions(results.slice(0, 10));
  }, [localQuery, appointments, patients, therapists]);

  const handleSearch = (query: string) => {
    setLocalQuery(query);
    onSearch(query);
    if (query.length >= 2) {
      saveToHistory(query);
    }
  };

  const handleSelectSuggestion = (result: SearchResult) => {
    if (result.type === 'appointment' && result.appointment) {
      onSelectResult(result.appointment);
      setShowSuggestions(false);
      setLocalQuery('');
      onSearch('');
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setLocalQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const selectHistoryItem = (query: string) => {
    setLocalQuery(query);
    onSearch(query);
    setShowSuggestions(false);
  };

  // Atalho de teclado / para focar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar... (pressione /)"
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (localQuery.length >= 2 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* History */}
          {localQuery.length < 2 && searchHistory.length > 0 && (
            <div className="p-2 border-b border-slate-200">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-slate-600">
                <Clock className="w-3 h-3" />
                Histórico de Buscas
              </div>
              <div className="space-y-1 mt-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => selectHistoryItem(query)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {localQuery.length >= 2 && (
            <div className="p-2">
              {suggestions.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500">
                  Nenhum resultado encontrado
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(result)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {result.type === 'appointment' && result.appointment && (
                            <>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-slate-900">
                                  {result.appointment.patientName}
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  {result.appointment.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {result.appointment.therapistName} • {new Date(result.appointment.startTime).toLocaleString('pt-BR')}
                              </p>
                            </>
                          )}
                          {result.type === 'patient' && result.patient && (
                            <>
                              <p className="font-medium text-sm text-slate-900">
                                {result.patient.name}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5">
                                CPF: {result.patient.cpf} • Tel: {result.patient.phone}
                              </p>
                            </>
                          )}
                          {result.type === 'therapist' && result.therapist && (
                            <>
                              <p className="font-medium text-sm text-slate-900">
                                {result.therapist.name}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Fisioterapeuta
                              </p>
                            </>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.matchScore}%
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {localQuery.length >= 2 && (
            <div className="p-2 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <TrendingUp className="w-3 h-3" />
                <span>Dica: Pressione Enter para buscar</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;

