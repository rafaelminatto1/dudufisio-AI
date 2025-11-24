'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AnamneseFormProps {
  patientId: string;
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
}

export function AnamneseForm({ patientId, initialData, onSave }: AnamneseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    queixa_principal: initialData?.queixa_principal || '',
    historia_doenca_atual: initialData?.historia_doenca_atual || '',
    historia_medica_pregressa: initialData?.historia_medica_pregressa || '',
    medicamentos_uso: initialData?.medicamentos_uso || [],
    alergias: initialData?.alergias || [],
    cirurgias_anteriores: initialData?.cirurgias_anteriores || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (onSave) {
        await onSave(formData);
        toast.success('Anamnese salva com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar anamnese');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="queixa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queixa">Queixa Principal</TabsTrigger>
          <TabsTrigger value="historia">História</TabsTrigger>
          <TabsTrigger value="medico">Histórico Médico</TabsTrigger>
        </TabsList>

        <TabsContent value="queixa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queixa Principal (QP)</CardTitle>
              <CardDescription>Motivo principal da consulta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="queixa_principal">Descreva a queixa principal do paciente</Label>
                <Textarea
                  id="queixa_principal"
                  value={formData.queixa_principal}
                  onChange={(e) => setFormData({ ...formData, queixa_principal: e.target.value })}
                  placeholder="Ex: Dor na região lombar há 3 semanas..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>História da Doença Atual (HDA)</CardTitle>
              <CardDescription>Evolução da queixa principal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="historia_doenca_atual">Descreva a história da doença atual</Label>
                <Textarea
                  id="historia_doenca_atual"
                  value={formData.historia_doenca_atual}
                  onChange={(e) => setFormData({ ...formData, historia_doenca_atual: e.target.value })}
                  placeholder="Ex: Início dos sintomas, fatores agravantes, fatores de melhora..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>História Médica Pregressa</CardTitle>
              <CardDescription>Histórico médico do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="historia_medica_pregressa">História Médica Pregressa</Label>
                <Textarea
                  id="historia_medica_pregressa"
                  value={formData.historia_medica_pregressa}
                  onChange={(e) => setFormData({ ...formData, historia_medica_pregressa: e.target.value })}
                  placeholder="Doenças anteriores, condições crônicas, histórico familiar..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                <Textarea
                  id="medicamentos"
                  value={Array.isArray(formData.medicamentos_uso) ? formData.medicamentos_uso.join('\n') : formData.medicamentos_uso}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medicamentos_uso: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Liste os medicamentos, um por linha"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alergias">Alergias</Label>
                <Textarea
                  id="alergias"
                  value={Array.isArray(formData.alergias) ? formData.alergias.join('\n') : formData.alergias}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alergias: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Liste as alergias, uma por linha"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cirurgias">Cirurgias Anteriores</Label>
                <Textarea
                  id="cirurgias"
                  value={Array.isArray(formData.cirurgias_anteriores) ? formData.cirurgias_anteriores.join('\n') : formData.cirurgias_anteriores}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cirurgias_anteriores: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Liste as cirurgias anteriores, uma por linha"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Anamnese
        </Button>
      </div>
    </form>
  );
}

