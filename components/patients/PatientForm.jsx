import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select';
import { Button } from '../ui/button';
const patientSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
    status: z.enum(['Active', 'Inactive', 'Discharged']),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
    conditions: z.string().optional(),
});
export function PatientForm({ isOpen, onClose, onSubmit, initialData, title = 'Novo Paciente' }) {
    const form = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: initialData?.name || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            cpf: initialData?.cpf || '',
            status: initialData?.status || 'Active',
            birthDate: initialData?.birthDate || '',
            conditions: initialData?.conditions || '',
        },
    });
    const handleSubmit = (data) => {
        onSubmit(data);
        form.reset();
        onClose();
    };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Edite as informações do paciente' : 'Adicione um novo paciente ao sistema'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="joao@email.com" type="email" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="cpf" render={({ field }) => (<FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="123.456.789-00" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="status" render={({ field }) => (<FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Ativo</SelectItem>
                      <SelectItem value="Inactive">Inativo</SelectItem>
                      <SelectItem value="Discharged">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="conditions" render={({ field }) => (<FormItem>
                  <FormLabel>Condições (separadas por vírgula)</FormLabel>
                  <FormControl>
                    <Input placeholder="Dor lombar, Hérnia de disco" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {initialData ? 'Atualizar' : 'Criar'} Paciente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
