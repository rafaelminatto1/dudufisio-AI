import React from 'react';
import { Stethoscope, AlertTriangle, CreditCard } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
export const TreatmentForm = ({ form }) => {
    return (<div className="space-y-6">
      {/* Diagnóstico e Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5"/>
            Diagnóstico e Plano de Tratamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="treatmentData.diagnosis" render={({ field }) => (<FormItem>
                <FormLabel>Diagnóstico Principal *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Hérnia de disco L4-L5" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="treatmentData.secondaryDiagnosis" render={({ field }) => (<FormItem>
                <FormLabel>Diagnósticos Secundários</FormLabel>
                <FormControl>
                  <Textarea placeholder="Liste outros diagnósticos se houver" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="treatmentData.treatmentPlan" render={({ field }) => (<FormItem>
                <FormLabel>Plano de Tratamento *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva o plano de tratamento (ex: Fisioterapia + Pilates)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="treatmentData.goals" render={({ field }) => (<FormItem>
                <FormLabel>Objetivos do Tratamento</FormLabel>
                <FormControl>
                  <Textarea placeholder="Liste os objetivos (ex: Reduzir dor, Melhorar mobilidade)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>
        </CardContent>
      </Card>

      {/* Contraindicações e Cuidados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5"/>
            Contraindicações e Cuidados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="treatmentData.contraindications" render={({ field }) => (<FormItem>
                <FormLabel>Contraindicações</FormLabel>
                <FormControl>
                  <Textarea placeholder="Liste as contraindicações (ex: Evitar movimentos bruscos)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="treatmentData.specialInstructions" render={({ field }) => (<FormItem>
                <FormLabel>Instruções Especiais</FormLabel>
                <FormControl>
                  <Textarea placeholder="Instruções específicas para o tratamento" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>
        </CardContent>
      </Card>

      {/* Informações Financeiras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5"/>
            Informações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="financial.insuranceProvider" render={({ field }) => (<FormItem>
                  <FormLabel>Convênio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Unimed, Bradesco Saúde" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            
            <FormField control={form.control} name="financial.insuranceNumber" render={({ field }) => (<FormItem>
                  <FormLabel>Número do Convênio</FormLabel>
                  <FormControl>
                    <Input placeholder="Número da carteirinha" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="financial.paymentMethod" render={({ field }) => (<FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Convênio">Convênio</SelectItem>
                      <SelectItem value="Parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>)}/>
            
            <FormField control={form.control} name="financial.totalValue" render={({ field }) => (<FormItem>
                  <FormLabel>Valor Total</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="financial.paidValue" render={({ field }) => (<FormItem>
                  <FormLabel>Valor Pago</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            
            <FormField control={form.control} name="financial.pendingValue" render={({ field }) => (<FormItem>
                  <FormLabel>Valor Pendente</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
          </div>
        </CardContent>
      </Card>
    </div>);
};
