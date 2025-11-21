'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Badge } from '~/components/ui/badge';
import { Slider } from '~/components/ui/slider';
import { Label } from '~/components/ui/label';
import { Download, RotateCcw, History } from 'lucide-react';
import { savePainMap, getPainMapHistory } from '~/lib/actions/painMap';
import { toast } from 'sonner';

interface PainPoint {
  id: string;
  x: number; // Percentual da posição X (0-100)
  y: number; // Percentual da posição Y (0-100)
  intensity: number; // 0-10 (EVA)
  bodyPart: string;
  side?: 'left' | 'right' | 'center';
}

interface BodyPainMapProps {
  patientId: string;
  sessionId?: string;
  initialPoints?: PainPoint[];
  onSave?: (points: PainPoint[]) => void;
}

export function BodyPainMap({
  patientId,
  sessionId,
  initialPoints = [],
  onSave,
}: BodyPainMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [points, setPoints] = useState<PainPoint[]>(initialPoints);
  const [selectedIntensity, setSelectedIntensity] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleBodyClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newPoint: PainPoint = {
        id: `point-${Date.now()}`,
        x,
        y,
        intensity: selectedIntensity,
        bodyPart: getBodyPartFromPosition(x, y, view),
        side: getSideFromPosition(x),
      };

      setPoints([...points, newPoint]);
    },
    [points, selectedIntensity, view]
  );

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await savePainMap({
        patient_id: patientId,
        session_id: sessionId,
        view,
        points,
        created_at: new Date().toISOString(),
      });

      if (result.error) {
        toast.error('Erro ao salvar mapa de dor', {
          description: result.error,
        });
        return;
      }

      toast.success('Mapa de dor salvo com sucesso!');
      onSave?.(points);
    } catch (error) {
      toast.error('Erro ao salvar mapa de dor');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleLoadHistory = async () => {
    const result = await getPainMapHistory(patientId);
    if (result.data) {
      setHistory(result.data);
      setShowHistory(true);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'fill-green-500';
    if (intensity <= 6) return 'fill-yellow-500';
    return 'fill-red-500';
  };

  const getIntensityBorder = (intensity: number) => {
    if (intensity <= 3) return 'stroke-green-700';
    if (intensity <= 6) return 'stroke-yellow-700';
    return 'stroke-red-700';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mapa de Dor Corporal</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadHistory}
            >
              <History className="mr-2 h-4 w-4" />
              Histórico
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de Intensidade EVA */}
        <div className="space-y-2">
          <Label>
            Intensidade da Dor (EVA): {selectedIntensity}/10
          </Label>
          <Slider
            value={[selectedIntensity]}
            onValueChange={(value) => setSelectedIntensity(value[0])}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 - Sem dor</span>
            <span>5 - Dor moderada</span>
            <span>10 - Dor intensa</span>
          </div>
        </div>

        {/* Tabs para Frente/Costas */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'front' | 'back')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Vista Frontal</TabsTrigger>
            <TabsTrigger value="back">Vista Posterior</TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="mt-4">
            <div className="relative border rounded-lg p-4 bg-muted/20">
              <svg
                viewBox="0 0 200 400"
                className="w-full h-auto cursor-crosshair"
                onClick={handleBodyClick}
              >
                {/* Silhueta frontal simplificada */}
                <ellipse cx="100" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" />
                <rect x="85" y="90" width="30" height="80" fill="none" stroke="currentColor" />
                <ellipse cx="70" cy="120" rx="15" ry="40" fill="none" stroke="currentColor" />
                <ellipse cx="130" cy="120" rx="15" ry="40" fill="none" stroke="currentColor" />
                <rect x="85" y="170" width="30" height="100" fill="none" stroke="currentColor" />
                <ellipse cx="70" cy="220" rx="12" ry="50" fill="none" stroke="currentColor" />
                <ellipse cx="130" cy="220" rx="12" ry="50" fill="none" stroke="currentColor" />

                {/* Pontos de dor */}
                {points
                  .filter((p) => p.side !== 'back')
                  .map((point) => (
                    <g key={point.id}>
                      <circle
                        cx={`${point.x * 2}`}
                        cy={`${point.y * 4}`}
                        r="8"
                        className={`${getIntensityColor(point.intensity)} ${getIntensityBorder(point.intensity)} stroke-2`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePoint(point.id);
                        }}
                      />
                      <text
                        x={`${point.x * 2}`}
                        y={`${point.y * 4 - 12}`}
                        textAnchor="middle"
                        className="text-xs font-bold fill-foreground"
                      >
                        {point.intensity}
                      </text>
                    </g>
                  ))}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="back" className="mt-4">
            <div className="relative border rounded-lg p-4 bg-muted/20">
              <svg
                viewBox="0 0 200 400"
                className="w-full h-auto cursor-crosshair"
                onClick={handleBodyClick}
              >
                {/* Silhueta posterior simplificada */}
                <ellipse cx="100" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" />
                <rect x="85" y="90" width="30" height="80" fill="none" stroke="currentColor" />
                <ellipse cx="70" cy="120" rx="15" ry="40" fill="none" stroke="currentColor" />
                <ellipse cx="130" cy="120" rx="15" ry="40" fill="none" stroke="currentColor" />
                <rect x="85" y="170" width="30" height="100" fill="none" stroke="currentColor" />
                <ellipse cx="70" cy="220" rx="12" ry="50" fill="none" stroke="currentColor" />
                <ellipse cx="130" cy="220" rx="12" ry="50" fill="none" stroke="currentColor" />

                {/* Pontos de dor */}
                {points
                  .filter((p) => p.side === 'back')
                  .map((point) => (
                    <g key={point.id}>
                      <circle
                        cx={`${point.x * 2}`}
                        cy={`${point.y * 4}`}
                        r="8"
                        className={`${getIntensityColor(point.intensity)} ${getIntensityBorder(point.intensity)} stroke-2`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePoint(point.id);
                        }}
                      />
                      <text
                        x={`${point.x * 2}`}
                        y={`${point.y * 4 - 12}`}
                        textAnchor="middle"
                        className="text-xs font-bold fill-foreground"
                      >
                        {point.intensity}
                      </text>
                    </g>
                  ))}
              </svg>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legenda */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>0-3 (Leve)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span>4-6 (Moderada)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>7-10 (Intensa)</span>
          </div>
        </div>

        {/* Lista de pontos */}
        {points.length > 0 && (
          <div className="space-y-2">
            <Label>Pontos Registrados ({points.length})</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {points.map((point) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        point.intensity <= 3
                          ? 'default'
                          : point.intensity <= 6
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      EVA {point.intensity}
                    </Badge>
                    <span>{point.bodyPart}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemovePoint(point.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Funções auxiliares
function getBodyPartFromPosition(x: number, y: number, view: 'front' | 'back'): string {
  // Simplificado - em produção, usar um mapa mais detalhado
  if (y < 20) return 'Cabeça';
  if (y < 35) return 'Pescoço';
  if (y < 50) return 'Ombro';
  if (y < 65) return 'Tórax';
  if (y < 80) return 'Abdômen';
  if (y < 95) return 'Quadril';
  if (y < 120) return 'Coxa';
  if (y < 140) return 'Joelho';
  if (y < 160) return 'Perna';
  return 'Pé';
}

function getSideFromPosition(x: number): 'left' | 'right' | 'center' {
  if (x < 40) return 'left';
  if (x > 60) return 'right';
  return 'center';
}

