import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MapPin, Search } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface AddressFormProps {
  form: UseFormReturn<any>;
}

export const AddressForm: React.FC<AddressFormProps> = ({ form }) => {
  const searchCEP = async (cep: string) => {
    if (cep.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          form.setValue('address.street', data.logradouro);
          form.setValue('address.neighborhood', data.bairro);
          form.setValue('address.city', data.localidade);
          form.setValue('address.state', data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="address.zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="00000-000" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      searchCEP(e.target.value);
                    }}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => searchCEP(field.value)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rua/Avenida *</FormLabel>
              <FormControl>
                <Input placeholder="Nome da rua ou avenida" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input placeholder="Apto 45, Bloco A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <FormControl>
                  <Input placeholder="SP" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
