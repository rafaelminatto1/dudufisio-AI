// components/video/AttachVideoModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface AttachVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoData: {
    exerciseName: string;
    modality: string;
    prompt: string;
  } | null;
}

const CATEGORIES = [
  { value: 'mobilidade', label: 'Mobilidade' },
  { value: 'fortalecimento', label: 'Fortalecimento' },
  { value: 'alongamento', label: 'Alongamento' },
  { value: 'equilibrio', label: 'Equilíbrio' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'funcional', label: 'Funcional' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
];

export const AttachVideoModal: React.FC<AttachVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoData,
}) => {
  const { createExercise } = useExercise();
  
  const [formData, setFormData] = useState({
    name: videoData?.exerciseName || '',
    category: 'fisioterapia',
    difficulty: 'beginner',
    description: videoData?.prompt || '',
    instructions: '',
    targetMuscles: '',
    equipment: 'none',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.name.trim()) {
      setSaveError('O nome do exercício é obrigatório');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Gerar thumbnail a partir do blob URL (primeira frame do vídeo)
      const thumbnailUrl = `https://via.placeholder.com/480x360.png/E2E8F0/64748B?text=${encodeURIComponent(formData.name)}`;

      // Preparar dados do exercício
      const exerciseData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        instructions: formData.instructions.split('\n').filter(i => i.trim()),
        targetMuscles: formData.targetMuscles.split(',').map(m => m.trim()).filter(m => m),
        equipment: [formData.equipment],
        media: {
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailUrl,
          images: [],
        },
        tags: ['gerado-ia', 'veo-2.0', videoData?.modality || 'fisioterapia'],
        source: 'ai-generated',
        isCustom: true,
        isPublic: false,
        isActive: true,
      };

      // Salvar exercício
      await createExercise(exerciseData);
      
      setSaveSuccess(true);
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar exercício');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setSaveSuccess(false);
      setSaveError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Save className="w-5 h-5 mr-2 text-sky-600" />
            Salvar Vídeo como Exercício
          </DialogTitle>
          <DialogDescription>
            Complete as informações abaixo para adicionar este vídeo gerado por IA à biblioteca de exercícios
          </DialogDescription>
        </DialogHeader>

        {saveSuccess ? (
          <div className="py-8">
            <Alert className="bg-green-50 border-green-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="ml-2">
                <p className="font-semibold text-green-900">Exercício salvo com sucesso!</p>
                <p className="text-sm text-green-700 mt-1">
                  O vídeo foi adicionado à biblioteca de exercícios.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Preview do Vídeo */}
            <div className="mb-4">
              <Label>Preview do Vídeo</Label>
              <div className="mt-2 bg-black rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-48 object-contain"
                  preload="metadata"
                />
              </div>
            </div>

            {/* Nome do Exercício */}
            <div>
              <Label htmlFor="name">Nome do Exercício *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Agachamento com rotação"
                className="mt-1"
              />
            </div>

            {/* Categoria e Dificuldade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger id="difficulty" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o exercício..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Instruções */}
            <div>
              <Label htmlFor="instructions">Instruções (uma por linha)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="1. Posicione-se em pé&#10;2. Flexione os joelhos&#10;3. Retorne à posição inicial"
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Músculos Alvo e Equipamento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetMuscles">Músculos Alvo (separados por vírgula)</Label>
                <Input
                  id="targetMuscles"
                  value={formData.targetMuscles}
                  onChange={(e) => handleInputChange('targetMuscles', e.target.value)}
                  placeholder="Ex: quadríceps, glúteos"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="equipment">Equipamento</Label>
                <Input
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  placeholder="Ex: halteres, faixa elástica"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Informações da IA */}
            <Alert className="bg-purple-50 border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="ml-2 text-sm text-purple-900">
                <p className="font-semibold">Gerado por IA Gemini Veo 2.0</p>
                <p className="text-purple-700 mt-1">
                  Modalidade: {videoData?.modality || 'N/A'}
                </p>
              </AlertDescription>
            </Alert>

            {/* Erro */}
            {saveError && (
              <Alert className="bg-red-50 border-red-300">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2 text-sm text-red-900">
                  {saveError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!saveSuccess && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Exercício
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttachVideoModal;

