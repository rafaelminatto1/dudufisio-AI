'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface SOAPFormProps {
  treatment?: any;
}

export function SOAPForm({ treatment }: SOAPFormProps) {
  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar save via Server Action
    console.log('Saving SOAP:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subjective">Subjetivo (S)</Label>
        <Textarea
          id="subjective"
          placeholder="Queixas e relatos do paciente..."
          value={formData.subjective}
          onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="objective">Objetivo (O)</Label>
        <Textarea
          id="objective"
          placeholder="Achados objetivos da avaliação..."
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="assessment">Avaliação (A)</Label>
        <Textarea
          id="assessment"
          placeholder="Análise e interpretação..."
          value={formData.assessment}
          onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="plan">Plano (P)</Label>
        <Textarea
          id="plan"
          placeholder="Plano de tratamento..."
          value={formData.plan}
          onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">Salvar Evolução</Button>
    </form>
  );
}

