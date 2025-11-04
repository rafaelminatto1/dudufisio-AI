/**
 * BODY MAP MANAGER
 * Componente principal para gerenciamento do mapa corporal de dor
 * Orquestra visualizações, formulários e dados
 */

import React, { useState, useEffect } from 'react';
import type {
  BodyMapSession,
  BodyMapPainRegion,
  BodyMapVisualizationType,
  BodyRegionReference,
  Patient,
} from '../../types';
import * as bodyMapService from '../../services/bodyMapService';
import SVGSimpleBodyMap from './visualizations/SVGSimpleBodyMap';
import SVGDetailedBodyMap from './visualizations/SVGDetailedBodyMap';
import CanvasInteractiveMap from './visualizations/CanvasInteractiveMap';
import ImageAnatomicalMap from './visualizations/ImageAnatomicalMap';
import PainRegionForm from './PainRegionForm';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Grid3x3, 
  Layers, 
  Paintbrush, 
  Image as ImageIcon,
  Plus,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';

interface BodyMapManagerProps {
  patient: Patient;
  sessionId?: string;
  appointmentId?: string;
  readOnly?: boolean;
  onSessionSaved?: (session: BodyMapSession) => void;
}

const VISUALIZATION_TYPES: (BodyMapVisualizationType & { Icon: React.ComponentType<any> })[] = [
  {
    id: 'svg-simple',
    name: 'Simples',
    description: 'Visualização simplificada estilo boneco',
    Icon: Grid3x3,
  },
  {
    id: 'svg-detailed',
    name: 'Detalhado',
    description: 'Visualização anatômica com regiões',
    Icon: Layers,
  },
  {
    id: 'canvas-interactive',
    name: 'Interativo',
    description: 'Canvas com desenho livre',
    Icon: Paintbrush,
  },
  {
    id: 'image-anatomical',
    name: 'Anatômico',
    description: 'Imagem anatômica real',
    Icon: ImageIcon,
  },
];

const BodyMapManager: React.FC<BodyMapManagerProps> = ({
  patient,
  sessionId,
  appointmentId,
  readOnly = false,
  onSessionSaved,
}) => {
  // Estado principal
  const [currentSession, setCurrentSession] = useState<BodyMapSession | null>(null);
  const [painRegions, setPainRegions] = useState<BodyMapPainRegion[]>([]);
  const [bodyRegions, setBodyRegions] = useState<BodyRegionReference[]>([]);
  
  // UI Estado
  const [selectedVisualization, setSelectedVisualization] = useState<BodyMapVisualizationType['id']>('svg-simple');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [showLabels, setShowLabels] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Formulário
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<BodyMapPainRegion | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<{ x: number; y: number } | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, [patient.id, sessionId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar regiões de referência
      const regions = await bodyMapService.getBodyRegionsReference();
      setBodyRegions(regions);

      // Se tem sessionId, carregar sessão existente
      if (sessionId) {
        const session = await bodyMapService.getBodyMapSession(sessionId);
        if (session) {
          setCurrentSession(session);
          setPainRegions(session.painRegions || []);
        }
      } else {
        // Criar nova sessão
        await createNewSession();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const mainPathology = patient.main_pathology_region || patient.main_diagnosis || 'Não especificada';
      
      const newSession = await bodyMapService.createBodyMapSession({
        patientId: patient.id,
        sessionId,
        appointmentId,
        mainComplaintRegion: mainPathology,
        mainComplaintDescription: patient.main_pathology,
        sessionDate: new Date(),
        overallPainLevel: 0,
        painFree: false,
        createdBy: 'current_user', // TODO: Get from auth
      });

      setCurrentSession(newSession);

      // Se tem patologia principal, pré-marcar no mapa
      if (patient.main_pathology_region) {
        // TODO: Calcular coordenadas baseado na região
        // Por ora, adicionar no centro
        await handleAddPoint(50, 30);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleAddPoint = async (x: number, y: number) => {
    if (readOnly || !currentSession) return;
    
    setPendingCoordinates({ x, y });
    setEditingRegion(null);
    setShowForm(true);
  };

  const handleSelectPoint = (region: BodyMapPainRegion) => {
    if (readOnly) return;
    
    setEditingRegion(region);
    setPendingCoordinates(null);
    setShowForm(true);
  };

  const handleSaveRegion = async (data: Partial<BodyMapPainRegion>) => {
    if (!currentSession) return;

    try {
      if (editingRegion) {
        // Atualizar região existente
        const updated = await bodyMapService.updatePainRegion(editingRegion.id, data);
        setPainRegions(prev => prev.map(r => r.id === updated.id ? updated : r));
      } else if (pendingCoordinates) {
        // Criar nova região
        const isMainComplaint = patient.main_pathology_region === data.bodyRegion;
        
        const newRegion = await bodyMapService.addPainRegion({
          bodyMapSessionId: currentSession.id,
          patientId: patient.id,
          bodySide: activeSide,
          coordinatesX: pendingCoordinates.x,
          coordinatesY: pendingCoordinates.y,
          isMainComplaint,
          isActive: true,
          ...data as any,
        });
        
        setPainRegions(prev => [...prev, newRegion]);
      }

      setShowForm(false);
      setEditingRegion(null);
      setPendingCoordinates(null);

      // Recalcular analytics
      await bodyMapService.recalculateAnalytics(patient.id);

      if (onSessionSaved && currentSession) {
        onSessionSaved(currentSession);
      }
    } catch (error) {
      console.error('Error saving region:', error);
      alert('Erro ao salvar região de dor');
    }
  };

  const handleResolveRegion = async (regionId: string) => {
    try {
      await bodyMapService.resolvePainRegion(regionId, 'current_user'); // TODO: Get from auth
      
      // Atualizar lista
      setPainRegions(prev => 
        prev.map(r => 
          r.id === regionId 
            ? { ...r, isActive: false, resolvedAt: new Date() }
            : r
        )
      );

      setShowForm(false);
      setEditingRegion(null);
    } catch (error) {
      console.error('Error resolving region:', error);
      alert('Erro ao resolver região de dor');
    }
  };

  const handleMarkPainFree = async () => {
    if (!currentSession) return;

    if (confirm('Marcar esta sessão como "sem dor"? Todas as regiões de dor serão marcadas como resolvidas.')) {
      try {
        const updated = await bodyMapService.markSessionPainFree(currentSession.id);
        setCurrentSession(updated);
        setPainRegions(prev => prev.map(r => ({ ...r, isActive: false, resolvedAt: new Date() })));
      } catch (error) {
        console.error('Error marking pain free:', error);
        alert('Erro ao marcar sessão sem dor');
      }
    }
  };

  // Componente de visualização selecionado
  const VisualizationComponent = React.useMemo(() => {
    switch (selectedVisualization) {
      case 'svg-detailed':
        return SVGDetailedBodyMap;
      case 'canvas-interactive':
        return CanvasInteractiveMap;
      case 'image-anatomical':
        return ImageAnatomicalMap;
      default:
        return SVGSimpleBodyMap;
    }
  }, [selectedVisualization]);

  const mainComplaint = painRegions.find(r => r.isMainComplaint);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando mapa corporal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Informações da sessão */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              Mapa Corporal de Dor
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {currentSession?.sessionDate 
                  ? new Date(currentSession.sessionDate).toLocaleDateString('pt-BR')
                  : 'Nova sessão'
                }
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {painRegions.filter(r => r.isActive).length} pontos ativos
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkPainFree}
                disabled={currentSession?.painFree}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar Sem Dor
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
                className="flex items-center gap-2"
              >
                {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Legenda
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Queixa Principal em destaque */}
      {patient.main_pathology && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-400 rounded-full p-2">
              <AlertCircle className="w-5 h-5 text-amber-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 mb-1">Queixa Principal do Paciente</h3>
              <p className="text-amber-800">{patient.main_pathology}</p>
              {patient.main_pathology_region && (
                <Badge className="mt-2 bg-amber-400 text-amber-900">
                  {patient.main_pathology_region}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seletor de visualização */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tipo de Visualização</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {VISUALIZATION_TYPES.map(({ id, name, description, Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedVisualization(id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedVisualization === id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-2 ${
                selectedVisualization === id ? 'text-blue-600' : 'text-slate-600'
              }`} />
              <div className="text-sm font-medium text-slate-800">{name}</div>
              <div className="text-xs text-slate-500 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Visualização Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Corporal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Toggle Front/Back */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveSide('front')}
                className={`flex-1 py-3 font-medium transition-colors ${
                  activeSide === 'front'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Vista Frontal
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`flex-1 py-3 font-medium transition-colors ${
                  activeSide === 'back'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Vista Posterior
              </button>
            </div>

            {/* Área de visualização */}
            <div className="p-4 min-h-[600px]">
              <VisualizationComponent
                bodySide={activeSide}
                painRegions={painRegions}
                mainComplaint={mainComplaint}
                onAddPoint={handleAddPoint}
                onSelectPoint={handleSelectPoint}
                readOnly={readOnly}
                showLabels={showLabels}
              />
            </div>
          </div>
        </div>

        {/* Lista de Pontos */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Pontos de Dor ({painRegions.length})
            </h3>

            {painRegions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum ponto registrado</p>
                {!readOnly && (
                  <p className="text-xs mt-1">Clique no mapa para adicionar</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {painRegions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => handleSelectPoint(region)}
                    disabled={readOnly}
                    className="w-full text-left p-3 rounded-lg border-2 border-slate-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: bodyMapService.getPainLevelColor(region.painLevel) }}
                      >
                        {region.painLevel}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          {region.bodyRegion}
                          {region.isMainComplaint && (
                            <Badge className="bg-amber-400 text-amber-900 text-xs">
                              PRINCIPAL
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {region.painTypes.join(', ')}
                        </div>
                        {!region.isActive && (
                          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolvida
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PainRegionForm
            region={editingRegion || undefined}
            bodySide={activeSide}
            coordinatesX={pendingCoordinates?.x || editingRegion?.coordinatesX || 50}
            coordinatesY={pendingCoordinates?.y || editingRegion?.coordinatesY || 50}
            bodyRegions={bodyRegions}
            isMainComplaint={patient.main_pathology_region ? false : undefined}
            onSave={handleSaveRegion}
            onCancel={() => {
              setShowForm(false);
              setEditingRegion(null);
              setPendingCoordinates(null);
            }}
            onResolve={handleResolveRegion}
          />
        </div>
      )}
    </div>
  );
};

export default BodyMapManager;

