'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Download, FileText, Search } from 'lucide-react';
import { getClinicalMaterials } from '~/lib/actions/clinicalMaterials';
import { toast } from 'sonner';

interface ClinicalMaterial {
  id: string;
  name: string;
  category: string;
  specialty: string;
  description?: string;
  file_url?: string;
  file_type: 'pdf' | 'docx' | 'xlsx';
}

export function ClinicalMaterialsLibrary() {
  const [materials, setMaterials] = useState<ClinicalMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  useEffect(() => {
    loadMaterials();
  }, [selectedSpecialty]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const result = await getClinicalMaterials({
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        search: searchQuery || undefined,
      });
      if (result.data) {
        setMaterials(result.data as ClinicalMaterial[]);
      }
    } catch (error) {
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (material: ClinicalMaterial) => {
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    } else {
      toast.error('Arquivo não disponível');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Materiais Clínicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="orthopedic">Ortopedia</SelectItem>
                <SelectItem value="neurological">Neurologia</SelectItem>
                <SelectItem value="respiratory">Respiratória</SelectItem>
                <SelectItem value="sports">Esportiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando...
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum material encontrado
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{material.name}</CardTitle>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{material.category}</Badge>
                  <Badge variant="secondary">{material.specialty}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {material.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {material.description}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownload(material)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar {material.file_type.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

