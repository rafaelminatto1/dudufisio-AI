'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { getTherapists, getResources } from '~/lib/actions/agenda';

interface AgendaFiltersProps {
  selectedTherapist?: string;
  selectedResource?: string;
  onTherapistChange: (therapistId: string | undefined) => void;
  onResourceChange: (resourceId: string | undefined) => void;
}

export function AgendaFilters({
  selectedTherapist,
  selectedResource,
  onTherapistChange,
  onResourceChange,
}: AgendaFiltersProps) {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  const loadFilters = async () => {
    const [therapistsResult, resourcesResult] = await Promise.all([
      getTherapists(),
      getResources(),
    ]);

    if (therapistsResult.data) {
      setTherapists(therapistsResult.data);
    }
    if (resourcesResult.data) {
      setResources(resourcesResult.data);
    }
  };

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFilters = () => {
    onTherapistChange(undefined);
    onResourceChange(undefined);
  };

  const hasActiveFilters = selectedTherapist || selectedResource;

  return (
    <div className="flex items-end gap-4">
      <div className="space-y-2">
        <Label>Profissional</Label>
        <Select
          value={selectedTherapist || 'all'}
          onValueChange={(value) => onTherapistChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os profissionais</SelectItem>
            {therapists.map((therapist) => (
              <SelectItem key={therapist.id} value={therapist.id}>
                {therapist.full_name || therapist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Recurso</Label>
        <Select
          value={selectedResource || 'all'}
          onValueChange={(value) => onResourceChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os recursos</SelectItem>
            {resources.map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                {resource.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      )}

      {hasActiveFilters && (
        <div className="flex gap-2">
          {selectedTherapist && (
            <Badge variant="secondary">
              Profissional: {therapists.find((t) => t.id === selectedTherapist)?.full_name || selectedTherapist}
            </Badge>
          )}
          {selectedResource && (
            <Badge variant="secondary">
              Recurso: {resources.find((r) => r.id === selectedResource)?.name || selectedResource}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

