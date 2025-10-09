import React from 'react';
import { Heart, Activity, FileText } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
export const HealthForm = ({ form }) => {
    return (<div className="space-y-6">
      {/* Histórico Médico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5"/>
            Histórico Médico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="medicalHistory.previousSurgeries" render={({ field }) => (<FormItem>
                <FormLabel>Cirurgias Anteriores</FormLabel>
                <FormControl>
                  <Textarea placeholder="Liste as cirurgias realizadas (ex: Apendicectomia em 2010)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.chronicDiseases" render={({ field }) => (<FormItem>
                <FormLabel>Doenças Crônicas</FormLabel>
                <FormControl>
                  <Textarea placeholder="Liste as doenças crônicas (ex: Diabetes, Hipertensão)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.familyHistory" render={({ field }) => (<FormItem>
                <FormLabel>Histórico Familiar</FormLabel>
                <FormControl>
                  <Textarea placeholder="Doenças na família (ex: Diabetes na família materna)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>
        </CardContent>
      </Card>

      {/* Sintomas Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5"/>
            Sintomas Atuais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="medicalHistory.currentSymptoms" render={({ field }) => (<FormItem>
                <FormLabel>Sintomas Principais</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva os sintomas atuais (ex: Dor lombar, Rigidez matinal)" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.painLevel" render={({ field }) => (<FormItem>
                <FormLabel>Nível de Dor (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="10" placeholder="5" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.painLocation" render={({ field }) => (<FormItem>
                <FormLabel>Localização da Dor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Região lombar, Joelho direito" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.painDuration" render={({ field }) => (<FormItem>
                <FormLabel>Duração dos Sintomas</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2 semanas, 3 meses" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>
        </CardContent>
      </Card>

      {/* Hábitos de Vida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5"/>
            Hábitos de Vida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="medicalHistory.exerciseFrequency" render={({ field }) => (<FormItem>
                <FormLabel>Frequência de Exercícios</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 3x por semana, Sedentário" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.smoking" render={({ field }) => (<FormItem>
                <FormLabel>Tabagismo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Não fuma, Ex-fumante há 5 anos" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.alcohol" render={({ field }) => (<FormItem>
                <FormLabel>Consumo de Álcool</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Social, Não consome" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>

          <FormField control={form.control} name="medicalHistory.sleep" render={({ field }) => (<FormItem>
                <FormLabel>Qualidade do Sono</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 7-8h por noite, Insônia" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>)}/>
        </CardContent>
      </Card>
    </div>);
};
