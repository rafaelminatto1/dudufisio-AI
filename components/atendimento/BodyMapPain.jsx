import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Edit, Trash2, Activity } from 'lucide-react';
const BodyMapPain = ({ painPoints, onAddPainPoint, onUpdatePainPoint, onDeletePainPoint }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPoint, setEditingPoint] = useState(null);
    const [activeSide, setActiveSide] = useState('front');
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [formData, setFormData] = useState({
        intensity: 5,
        type: 'aguda',
        description: '',
        muscle: ''
    });
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const bodyParts = [
        'Cabeça', 'Pescoço', 'Ombros', 'Braços', 'Antebraços', 'Mãos',
        'Tórax', 'Abdômen', 'Costas', 'Lombar', 'Quadris', 'Coxas',
        'Joelhos', 'Panturrilhas', 'Pés'
    ];
    const painTypes = [
        { value: 'latejante', label: 'Latejante' },
        { value: 'aguda', label: 'Aguda' },
        { value: 'queimação', label: 'Queimação' },
        { value: 'formigamento', label: 'Formigamento' },
        { value: 'cansaço', label: 'Cansaço' }
    ];
    const getIntensityColor = (intensity) => {
        if (intensity <= 2)
            return '#22c55e'; // green
        if (intensity <= 4)
            return '#eab308'; // yellow
        if (intensity <= 6)
            return '#f97316'; // orange
        if (intensity <= 8)
            return '#ef4444'; // red
        return '#dc2626'; // dark red
    };
    const getIntensityLabel = (intensity) => {
        if (intensity <= 2)
            return 'Leve';
        if (intensity <= 4)
            return 'Moderada';
        if (intensity <= 6)
            return 'Forte';
        if (intensity <= 8)
            return 'Muito Forte';
        return 'Intensa';
    };
    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        // Check if clicking on existing point
        const existingPoint = painPoints.find(point => point.bodyPart === activeSide &&
            Math.abs(point.x - x) < 3 &&
            Math.abs(point.y - y) < 3);
        if (existingPoint) {
            setSelectedPoint(existingPoint);
            return;
        }
        // Add new point
        setFormData({
            intensity: 5,
            type: 'aguda',
            description: '',
            muscle: ''
        });
        setSelectedPoint({
            id: '',
            x,
            y,
            intensity: 5,
            type: 'aguda',
            description: '',
            bodyPart: activeSide,
            muscle: ''
        });
        setIsDialogOpen(true);
    };
    const handleAddPainPoint = () => {
        if (!selectedPoint)
            return;
        onAddPainPoint({
            x: selectedPoint.x,
            y: selectedPoint.y,
            intensity: formData.intensity,
            type: formData.type,
            description: formData.description,
            bodyPart: activeSide,
            muscle: formData.muscle || undefined
        });
        setSelectedPoint(null);
        setIsDialogOpen(false);
    };
    const handleUpdatePainPoint = () => {
        if (!editingPoint)
            return;
        onUpdatePainPoint(editingPoint.id, {
            intensity: formData.intensity,
            type: formData.type,
            description: formData.description,
            muscle: formData.muscle || undefined
        });
        setEditingPoint(null);
        setIsDialogOpen(false);
    };
    const handleEditPoint = (point) => {
        setEditingPoint(point);
        setFormData({
            intensity: point.intensity,
            type: point.type,
            description: point.description,
            muscle: point.muscle || ''
        });
        setIsDialogOpen(true);
    };
    const drawBodyMap = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw body outline (simplified)
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (activeSide === 'front') {
            // Front view body outline
            ctx.ellipse(50, 15, 8, 12, 0, 0, 2 * Math.PI); // head
            ctx.moveTo(50, 27);
            ctx.lineTo(50, 40); // neck
            ctx.moveTo(50, 40);
            ctx.lineTo(40, 55); // left shoulder
            ctx.lineTo(35, 70); // left arm
            ctx.lineTo(30, 85); // left forearm
            ctx.moveTo(50, 40);
            ctx.lineTo(60, 55); // right shoulder
            ctx.lineTo(65, 70); // right arm
            ctx.lineTo(70, 85); // right forearm
            ctx.moveTo(50, 40);
            ctx.lineTo(50, 80); // torso
            ctx.ellipse(50, 80, 15, 20, 0, 0, 2 * Math.PI); // hips
            ctx.moveTo(50, 100);
            ctx.lineTo(45, 120); // left leg
            ctx.lineTo(40, 140); // left thigh
            ctx.lineTo(35, 160); // left calf
            ctx.moveTo(50, 100);
            ctx.lineTo(55, 120); // right leg
            ctx.lineTo(60, 140); // right thigh
            ctx.lineTo(65, 160); // right calf
        }
        else {
            // Back view body outline
            ctx.ellipse(50, 15, 8, 12, 0, 0, 2 * Math.PI); // head
            ctx.moveTo(50, 27);
            ctx.lineTo(50, 40); // neck
            ctx.moveTo(50, 40);
            ctx.lineTo(40, 55); // left shoulder
            ctx.lineTo(35, 70); // left arm
            ctx.lineTo(30, 85); // left forearm
            ctx.moveTo(50, 40);
            ctx.lineTo(60, 55); // right shoulder
            ctx.lineTo(65, 70); // right arm
            ctx.lineTo(70, 85); // right forearm
            ctx.moveTo(50, 40);
            ctx.lineTo(50, 80); // torso
            ctx.ellipse(50, 80, 15, 20, 0, 0, 2 * Math.PI); // hips
            ctx.moveTo(50, 100);
            ctx.lineTo(45, 120); // left leg
            ctx.lineTo(40, 140); // left thigh
            ctx.lineTo(35, 160); // left calf
            ctx.moveTo(50, 100);
            ctx.lineTo(55, 120); // right leg
            ctx.lineTo(60, 140); // right thigh
            ctx.lineTo(65, 160); // right calf
        }
        ctx.stroke();
        // Draw pain points
        painPoints
            .filter(point => point.bodyPart === activeSide)
            .forEach(point => {
            const x = (point.x / 100) * canvas.width;
            const y = (point.y / 100) * canvas.height;
            // Draw pain point
            ctx.fillStyle = getIntensityColor(point.intensity);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
            // Draw border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Draw intensity number
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(point.intensity.toString(), x, y + 3);
        });
    };
    useEffect(() => {
        drawBodyMap();
    }, [painPoints, activeSide]);
    const currentSidePoints = painPoints.filter(point => point.bodyPart === activeSide);
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-red-600"/>
          <span>Mapa Corporal de Dor</span>
        </CardTitle>
        <CardDescription>
          Clique no corpo para indicar pontos de dor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Side Toggle */}
        <div className="flex items-center justify-center space-x-2">
          <Button variant={activeSide === 'front' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSide('front')}>
            Frente
          </Button>
          <Button variant={activeSide === 'back' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSide('back')}>
            Costas
          </Button>
        </div>

        {/* Body Map Canvas */}
        <div className="flex justify-center">
          <div className="relative">
            <canvas ref={canvasRef} width={200} height={200} className="border rounded-lg cursor-crosshair" onClick={handleCanvasClick}/>
            <div className="absolute top-2 left-2 text-xs text-slate-500">
              {activeSide === 'front' ? 'Vista Frontal' : 'Vista Posterior'}
            </div>
          </div>
        </div>

        {/* Pain Points List */}
        {currentSidePoints.length > 0 && (<div className="space-y-2">
            <h4 className="font-semibold text-slate-900">Pontos de Dor ({currentSidePoints.length})</h4>
            <div className="space-y-2">
              {currentSidePoints.map((point) => (<div key={point.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${point.intensity <= 2 ? 'bg-green-500' :
                    point.intensity <= 4 ? 'bg-yellow-500' :
                        point.intensity <= 6 ? 'bg-orange-500' :
                            point.intensity <= 8 ? 'bg-red-500' : 'bg-red-700'}`}/>
                    <div>
                      <div className="font-medium text-slate-900">
                        {point.muscle || 'Ponto de dor'} - {getIntensityLabel(point.intensity)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {point.type} • {point.intensity}/10
                      </div>
                      {point.description && (<div className="text-sm text-slate-500 mt-1">
                          {point.description}
                        </div>)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPoint(point)}>
                      <Edit className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeletePainPoint(point.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>))}
            </div>
          </div>)}

        {/* Instructions */}
        <div className="text-center text-sm text-slate-500">
          <p>Clique no corpo para adicionar pontos de dor</p>
          <p>Clique nos pontos existentes para editar</p>
        </div>
      </CardContent>

      {/* Pain Point Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPoint ? 'Editar Ponto de Dor' : 'Adicionar Ponto de Dor'}
            </DialogTitle>
            <DialogDescription>
              Configure as características da dor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="intensity">Intensidade da Dor</Label>
              <div className="space-y-2">
                <Slider value={[formData.intensity]} onValueChange={([value]) => setFormData({ ...formData, intensity: value })} max={10} min={1} step={1} className="w-full"/>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>1 - Leve</span>
                  <span className="font-medium">{formData.intensity}/10 - {getIntensityLabel(formData.intensity)}</span>
                  <span>10 - Intensa</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Dor</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {painTypes.map((type) => (<SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="muscle">Músculo/Região</Label>
              <Select value={formData.muscle} onValueChange={(value) => setFormData({ ...formData, muscle: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a região"/>
                </SelectTrigger>
                <SelectContent>
                  {bodyParts.map((part) => (<SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva a dor em detalhes" rows={3}/>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingPoint ? handleUpdatePainPoint : handleAddPainPoint}>
                {editingPoint ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>);
};
export default BodyMapPain;
