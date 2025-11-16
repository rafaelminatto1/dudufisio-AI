import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Phone, User } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface EmergencyContactFormProps {
  form: UseFormReturn<any>;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contato de Emergência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="emergencyContact.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do contato de emergência" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergencyContact.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parentesco *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pai">Pai</SelectItem>
                    <SelectItem value="Mãe">Mãe</SelectItem>
                    <SelectItem value="Esposo(a)">Esposo(a)</SelectItem>
                    <SelectItem value="Filho(a)">Filho(a)</SelectItem>
                    <SelectItem value="Irmão(ã)">Irmão(ã)</SelectItem>
                    <SelectItem value="Avô/Avó">Avô/Avó</SelectItem>
                    <SelectItem value="Sogro(a)">Sogro(a)</SelectItem>
                    <SelectItem value="Cunhado(a)">Cunhado(a)</SelectItem>
                    <SelectItem value="Primo(a)">Primo(a)</SelectItem>
                    <SelectItem value="Tio(a)">Tio(a)</SelectItem>
                    <SelectItem value="Amigo(a)">Amigo(a)</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="emergencyContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="emergencyContact.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyContact.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Input placeholder="Informações adicionais sobre o contato" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
