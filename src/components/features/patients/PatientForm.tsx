'use client';

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { validateCPF, formatCPF, formatPhone } from '~/lib/utils/validation';
import { createPatient, updatePatient, type CreatePatientData } from '~/lib/actions/patients';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PatientFormProps {
  patientId?: string;
  initialData?: Partial<CreatePatientData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PatientForm({ patientId, initialData, onSuccess, onCancel }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePatientData>({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    cpf: initialData?.cpf || '',
    birth_date: initialData?.birth_date || '',
    gender: initialData?.gender,
    address: initialData?.address || {},
    emergency_contact: initialData?.emergency_contact || {},
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        cpf: initialData.cpf || '',
        birth_date: initialData.birth_date || '',
        gender: initialData.gender,
        address: initialData.address || {},
        emergency_contact: initialData.emergency_contact || {},
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'Data de nascimento é obrigatória';
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (patientId) {
        result = await updatePatient({ ...formData, id: patientId });
      } else {
        result = await createPatient(formData);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(patientId ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!');
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Erro ao salvar paciente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCPFChange = (value: string) => {
    const cleanCPF = value.replace(/\D/g, '');
    const formatted = formatCPF(cleanCPF);
    setFormData({ ...formData, cpf: formatted });
  };

  const handlePhoneChange = (value: string) => {
    const cleanPhone = value.replace(/\D/g, '');
    setFormData({ ...formData, phone: cleanPhone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="additional">Adicionais</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Dados básicos do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="João Silva"
                    required
                  />
                  {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="birth_date">
                    Data de Nascimento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    required
                  />
                  {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contato */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>Telefones, email e endereço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@email.com"
                    required
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Telefone/WhatsApp <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formatPhone(formData.phone)}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_street">Rua</Label>
                    <Input
                      id="address_street"
                      value={formData.address?.street || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      placeholder="Rua das Flores"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_number">Número</Label>
                    <Input
                      id="address_number"
                      value={formData.address?.number || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, number: e.target.value },
                        })
                      }
                      placeholder="123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_complement">Complemento</Label>
                    <Input
                      id="address_complement"
                      value={formData.address?.complement || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, complement: e.target.value },
                        })
                      }
                      placeholder="Apto 101"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_neighborhood">Bairro</Label>
                    <Input
                      id="address_neighborhood"
                      value={formData.address?.neighborhood || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, neighborhood: e.target.value },
                        })
                      }
                      placeholder="Centro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_city">Cidade</Label>
                    <Input
                      id="address_city"
                      value={formData.address?.city || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_state">Estado</Label>
                    <Input
                      id="address_state"
                      value={formData.address?.state || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_zipcode">CEP</Label>
                    <Input
                      id="address_zipcode"
                      value={formData.address?.zipcode || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, zipcode: e.target.value },
                        })
                      }
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Contato de Emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name">Nome</Label>
                    <Input
                      id="emergency_name"
                      value={formData.emergency_contact?.name || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact: { ...formData.emergency_contact, name: e.target.value },
                        })
                      }
                      placeholder="Maria Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Telefone</Label>
                    <Input
                      id="emergency_phone"
                      value={formatPhone(formData.emergency_contact?.phone || '')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact: {
                            ...formData.emergency_contact,
                            phone: e.target.value.replace(/\D/g, ''),
                          },
                        })
                      }
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_relationship">Parentesco</Label>
                    <Input
                      id="emergency_relationship"
                      value={formData.emergency_contact?.relationship || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact: {
                            ...formData.emergency_contact,
                            relationship: e.target.value,
                          },
                        })
                      }
                      placeholder="Mãe, Pai, Cônjuge..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Adicionais */}
        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>Observações e notas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre o paciente..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {patientId ? 'Atualizar' : 'Cadastrar'} Paciente
        </Button>
      </div>
    </form>
  );
}

