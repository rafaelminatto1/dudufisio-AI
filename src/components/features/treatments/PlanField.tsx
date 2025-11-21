'use client';

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Badge } from '~/components/ui/badge';
import { X, Plus, Search } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { ConductLibraryService, ConductProcedure } from '~/lib/services/treatments/conductLibraryService';

interface PlanFieldProps {
  value: string;
  structuredConducts?: Array<{
    id: string;
    name: string;
    category: string;
    duration?: number;
    notes?: string;
  }>;
  onChange: (value: string) => void;
  onStructuredChange?: (conducts: Array<{
    id: string;
    name: string;
    category: string;
    duration?: number;
    notes?: string;
  }>) => void;
  placeholder?: string;
}

export function PlanField({
  value,
  structuredConducts = [],
  onChange,
  onStructuredChange,
  placeholder = 'Plano de tratamento e condutas aplicadas...',
}: PlanFieldProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<ConductProcedure[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<ConductProcedure[]>([]);

  useEffect(() => {
    const loadLibrary = async () => {
      const service = new ConductLibraryService();
      const cats = await service.getCategories();
      setCategories(cats);

      // Carrega todos os procedimentos
      const allProcedures: ConductProcedure[] = [];
      cats.forEach((cat) => {
        if (cat.procedures) {
          allProcedures.push(...cat.procedures);
        }
      });
      setProcedures(allProcedures);
    };

    loadLibrary();
  }, []);

  const filteredProcedures = procedures.filter((proc) => {
    const matchesSearch =
      searchQuery === '' ||
      proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || proc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProcedure = (procedure: ConductProcedure) => {
    if (selectedProcedures.find((p) => p.id === procedure.id)) {
      return; // Já está selecionado
    }

    const newConducts = [
      ...structuredConducts,
      {
        id: procedure.id,
        name: procedure.name,
        category: procedure.category,
        duration: procedure.duration_minutes,
      },
    ];

    onStructuredChange?.(newConducts);
    setSelectedProcedures([...selectedProcedures, procedure]);
  };

  const handleRemoveConduct = (id: string) => {
    const newConducts = structuredConducts.filter((c) => c.id !== id);
    onStructuredChange?.(newConducts);
    setSelectedProcedures(selectedProcedures.filter((p) => p.id !== id));
  };

  const handleApplySelected = () => {
    // Adiciona os procedimentos selecionados ao texto
    const proceduresText = structuredConducts
      .map((c) => {
        let text = c.name;
        if (c.duration) {
          text += ` (${c.duration}min)`;
        }
        if (c.notes) {
          text += ` - ${c.notes}`;
        }
        return text;
      })
      .join('\n');

    const newValue = value
      ? `${value}\n\n${proceduresText}`
      : proceduresText;
    onChange(newValue);
    setIsLibraryOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="plan">
          Plano (P) - Condutas e Procedimentos
        </Label>
        <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Biblioteca de Procedimentos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Biblioteca de Procedimentos</DialogTitle>
              <DialogDescription>
                Selecione procedimentos da biblioteca para estruturar o plano
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar procedimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtro por categoria */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lista de procedimentos */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredProcedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAddProcedure(procedure)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{procedure.name}</div>
                      {procedure.description && (
                        <div className="text-sm text-muted-foreground">
                          {procedure.description}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{procedure.category}</Badge>
                        {procedure.duration_minutes && (
                          <Badge variant="secondary">
                            {procedure.duration_minutes}min
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selectedProcedures.find((p) => p.id === procedure.id) && (
                      <Badge variant="default">Selecionado</Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Procedimentos selecionados */}
              {structuredConducts.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label>Procedimentos Selecionados</Label>
                  <div className="space-y-2">
                    {structuredConducts.map((conduct) => (
                      <div
                        key={conduct.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{conduct.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveConduct(conduct.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplySelected}
                    className="w-full"
                  >
                    Aplicar ao Plano
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Condutas estruturadas */}
      {structuredConducts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          {structuredConducts.map((conduct) => (
            <Badge
              key={conduct.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {conduct.name}
              {conduct.duration && ` (${conduct.duration}min)`}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 -mr-1"
                onClick={() => handleRemoveConduct(conduct.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Campo de texto livre */}
      <Textarea
        id="plan"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Você pode usar a biblioteca de procedimentos ou escrever livremente
      </p>
    </div>
  );
}

