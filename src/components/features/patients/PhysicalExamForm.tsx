'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Input } from '~/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PhysicalExamFormProps {
  patientId: string;
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
}

export function PhysicalExamForm({ patientId, initialData, onSave }: PhysicalExamFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inspecao: initialData?.inspecao || '',
    palpacao: initialData?.palpacao || '',
    testes_especiais: initialData?.testes_especiais || '',
    adm: initialData?.adm || {},
    forca_muscular: initialData?.forca_muscular || {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (onSave) {
        await onSave(formData);
        toast.success('Exame físico salvo com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar exame físico');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="inspecao" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inspecao">Inspeção</TabsTrigger>
          <TabsTrigger value="palpacao">Palpação</TabsTrigger>
          <TabsTrigger value="testes">Testes Especiais</TabsTrigger>
          <TabsTrigger value="adm">ADM</TabsTrigger>
          <TabsTrigger value="forca">Força Muscular</TabsTrigger>
        </TabsList>

        <TabsContent value="inspecao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspeção</CardTitle>
              <CardDescription>Observações visuais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="inspecao">Descreva as observações da inspeção</Label>
                <Textarea
                  id="inspecao"
                  value={formData.inspecao}
                  onChange={(e) => setFormData({ ...formData, inspecao: e.target.value })}
                  placeholder="Postura, deformidades, atrofias, edemas, cicatrizes..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="palpacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Palpação</CardTitle>
              <CardDescription>Avaliação tátil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="palpacao">Descreva os achados da palpação</Label>
                <Textarea
                  id="palpacao"
                  value={formData.palpacao}
                  onChange={(e) => setFormData({ ...formData, palpacao: e.target.value })}
                  placeholder="Temperatura, sensibilidade, tensão muscular, pontos dolorosos..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testes Especiais</CardTitle>
              <CardDescription>Testes clínicos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="testes_especiais">Descreva os testes especiais realizados</Label>
                <Textarea
                  id="testes_especiais"
                  value={formData.testes_especiais}
                  onChange={(e) => setFormData({ ...formData, testes_especiais: e.target.value })}
                  placeholder="Ex: Teste de Lasègue, Teste de Thomas, Teste de Neer..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amplitude de Movimento (ADM)</CardTitle>
              <CardDescription>Medições de amplitude articular</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Flexão', 'Extensão', 'Abdução', 'Adução', 'Rotação Interna', 'Rotação Externa'].map((movement) => (
                  <div key={movement} className="space-y-2">
                    <Label htmlFor={`adm_${movement.toLowerCase().replace(' ', '_')}`}>{movement}</Label>
                    <Input
                      id={`adm_${movement.toLowerCase().replace(' ', '_')}`}
                      type="number"
                      placeholder="Graus"
                      value={formData.adm[movement.toLowerCase().replace(' ', '_')] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adm: {
                            ...formData.adm,
                            [movement.toLowerCase().replace(' ', '_')]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Força Muscular</CardTitle>
              <CardDescription>Avaliação de força (escala 0-5)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Flexores', 'Extensores', 'Abdutores', 'Adutores', 'Rotadores Internos', 'Rotadores Externos'].map((muscle) => (
                  <div key={muscle} className="space-y-2">
                    <Label htmlFor={`forca_${muscle.toLowerCase().replace(' ', '_')}`}>{muscle}</Label>
                    <Input
                      id={`forca_${muscle.toLowerCase().replace(' ', '_')}`}
                      type="number"
                      min="0"
                      max="5"
                      placeholder="0-5"
                      value={formData.forca_muscular[muscle.toLowerCase().replace(' ', '_')] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          forca_muscular: {
                            ...formData.forca_muscular,
                            [muscle.toLowerCase().replace(' ', '_')]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Exame Físico
        </Button>
      </div>
    </form>
  );
}

