import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FileText, Paperclip, Tag } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

interface ObservationsFormProps {
  form: UseFormReturn<any>;
}

export const ObservationsForm: React.FC<ObservationsFormProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Observações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas do Paciente</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações importantes sobre o paciente, comportamento, aderência ao tratamento, etc."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="internalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Internas</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações internas da clínica (não visíveis para o paciente)"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextAppointmentNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações para Próxima Consulta</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Lembretes e observações para a próxima consulta"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Tags e Categorização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags e Categorização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Separe as tags por vírgula (ex: Dor lombar, Urgente, VIP)"
                    {...field}
                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                    onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria do Paciente</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Ortopedia, Neurologia, Geriatria"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Alta, Normal, Baixa"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Anexos e Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Anexos e Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste e solte arquivos aqui ou clique para selecionar
            </p>
            <Button type="button" variant="outline" size="sm">
              Selecionar Arquivos
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Formatos suportados: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>

          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lista de Anexos</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Liste os documentos anexados (ex: Exames, Laudos, Receitas)"
                    rows={3}
                    {...field}
                    value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(item => item.trim()))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="referralSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Como Conheceu a Clínica</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Indicação de amigo, Google, Facebook" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="previousTherapist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fisioterapeuta Anterior</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do fisioterapeuta anterior (se houver)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pedidos Especiais</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Solicitações especiais do paciente (horários, preferências, etc.)"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};
