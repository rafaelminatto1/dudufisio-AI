'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Check, Plus, User } from 'lucide-react';
import { cn } from '~/lib/utils';
import { searchPatients } from '~/lib/actions/patients';
import { useRouter } from 'next/navigation';

interface PatientAutocompleteProps {
  value?: string;
  onSelect: (patientId: string, patientName: string) => void;
  placeholder?: string;
  showQuickAdd?: boolean;
}

export function PatientAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar paciente...',
  showQuickAdd = true,
}: PatientAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        loadPatients();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setPatients([]);
    }
  }, [searchQuery]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const result = await searchPatients(searchQuery);
      if (result.data) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (patient: any) => {
    onSelect(patient.id, patient.full_name);
    setOpen(false);
    setSearchQuery('');
  };

  const handleQuickAdd = () => {
    router.push('/dashboard/pacientes/novo?returnTo=agenda');
    setOpen(false);
  };

  const selectedPatient = patients.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatient ? (
            <span className="truncate">{selectedPatient.full_name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Digite o nome, CPF ou telefone..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            ) : patients.length === 0 && searchQuery.length >= 2 ? (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 p-4">
                  <p className="text-sm text-muted-foreground">
                    Nenhum paciente encontrado
                  </p>
                  {showQuickAdd && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleQuickAdd}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Novo Paciente
                    </Button>
                  )}
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {showQuickAdd && searchQuery.length >= 2 && (
                  <CommandItem onSelect={handleQuickAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="font-medium">Cadastrar: {searchQuery}</span>
                  </CommandItem>
                )}
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.id}
                    onSelect={() => handleSelect(patient)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === patient.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{patient.full_name}</span>
                      {patient.phone && (
                        <span className="text-xs text-muted-foreground">
                          {patient.phone}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

