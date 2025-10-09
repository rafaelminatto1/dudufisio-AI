// pages/partner-portal/PartnerExerciseLibraryPage.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Play, Heart, Star, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
// Dados mock para demonstração
const mockExercises = [
    {
        id: '1',
        name: 'Flexão de Braço',
        category: 'Força',
        description: 'Exercício clássico para fortalecimento do peitoral e tríceps',
        difficulty: 'Iniciante',
        duration: '3 séries de 10-15',
        equipment: ['Nenhum'],
        muscleGroups: ['Peitoral', 'Tríceps', 'Deltoide'],
        instructions: [
            'Deite-se de bruços no chão',
            'Posicione as mãos na largura dos ombros',
            'Mantenha o corpo alinhado',
            'Desça até quase tocar o chão',
            'Empurre para cima até a posição inicial'
        ],
        imageUrl: '/api/placeholder/300/200',
        videoUrl: '/api/placeholder/video',
        isFavorite: true,
        rating: 4.5
    },
    {
        id: '2',
        name: 'Agachamento',
        category: 'Força',
        description: 'Exercício fundamental para membros inferiores',
        difficulty: 'Iniciante',
        duration: '3 séries de 12-15',
        equipment: ['Nenhum'],
        muscleGroups: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
        instructions: [
            'Fique em pé com os pés na largura dos ombros',
            'Mantenha o peito erguido',
            'Desça como se fosse sentar em uma cadeira',
            'Mantenha os joelhos alinhados com os pés',
            'Suba até a posição inicial'
        ],
        imageUrl: '/api/placeholder/300/200',
        isFavorite: false,
        rating: 4.8
    },
    {
        id: '3',
        name: 'Prancha',
        category: 'Core',
        description: 'Exercício isométrico para fortalecimento do core',
        difficulty: 'Intermediário',
        duration: '3 séries de 30-60 segundos',
        equipment: ['Nenhum'],
        muscleGroups: ['Abdômen', 'Lombar', 'Ombros'],
        instructions: [
            'Deite-se de bruços',
            'Apoie-se nos antebraços e pontas dos pés',
            'Mantenha o corpo em linha reta',
            'Contraia o abdômen',
            'Mantenha a posição pelo tempo determinado'
        ],
        imageUrl: '/api/placeholder/300/200',
        isFavorite: true,
        rating: 4.2
    },
    {
        id: '4',
        name: 'Burpee',
        category: 'Cardio',
        description: 'Exercício completo que combina força e cardio',
        difficulty: 'Avançado',
        duration: '3 séries de 8-12',
        equipment: ['Nenhum'],
        muscleGroups: ['Corpo todo'],
        instructions: [
            'Comece em pé',
            'Agache e coloque as mãos no chão',
            'Salte os pés para trás',
            'Faça uma flexão',
            'Salte os pés de volta',
            'Salte para cima com os braços estendidos'
        ],
        imageUrl: '/api/placeholder/300/200',
        isFavorite: false,
        rating: 4.0
    }
];
const categories = ['Todos', 'Força', 'Core', 'Cardio', 'Flexibilidade', 'Equilíbrio'];
const PartnerExerciseLibraryPage = () => {
    const [exercises] = useState(mockExercises);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isLoading] = useState(false);
    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, exercises]);
    const handlePlayVideo = (exercise) => {
        if (exercise.videoUrl) {
            alert(`Reproduzindo vídeo: ${exercise.name}`);
        }
        else {
            alert('Vídeo não disponível para este exercício');
        }
    };
    const handleToggleFavorite = (exerciseId) => {
        alert(`Exercício ${exerciseId} adicionado aos favoritos!`);
    };
    const handleSuggestExercise = () => {
        alert('Funcionalidade de sugestão de exercício será implementada em breve!');
    };
    return (<div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            Biblioteca de Exercícios
                        </h1>
                        <p className="text-xl text-slate-600">
                            Consulte os exercícios da clínica e sugira novas adições.
                        </p>
                    </div>
                    <Button onClick={handleSuggestExercise} className="bg-sky-500 hover:bg-sky-600">
                        <Plus className="w-4 h-4 mr-2"/>
                        Sugerir Exercício
                    </Button>
                </div>

                {/* Filtros e Busca */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <Input type="text" placeholder="Buscar por nome, descrição ou grupo muscular..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                            </div>
                            <div className="flex gap-2">
                                {categories.map(category => (<Button key={category} variant={selectedCategory === category ? "default" : "outline"} onClick={() => setSelectedCategory(category)} size="sm">
                                        {category}
                                    </Button>))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-sky-600">{filteredExercises.length}</div>
                            <div className="text-sm text-slate-600">Exercícios Encontrados</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {exercises.filter(ex => ex.isFavorite).length}
                            </div>
                            <div className="text-sm text-slate-600">Favoritos</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {[...new Set(exercises.map(ex => ex.category))].length}
                            </div>
                            <div className="text-sm text-slate-600">Categorias</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {exercises.filter(ex => ex.difficulty === 'Iniciante').length}
                            </div>
                            <div className="text-sm text-slate-600">Para Iniciantes</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Exercícios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-80 w-full rounded-lg"/>))) : filteredExercises.length === 0 ? (<div className="col-span-full text-center p-10 text-slate-500">
                            <Search className="w-16 h-16 mx-auto mb-4 text-slate-300"/>
                            <p className="text-lg font-semibold">Nenhum exercício encontrado</p>
                            <p className="text-sm">Tente ajustar os filtros ou termos de busca</p>
                        </div>) : (filteredExercises.map(exercise => (<Card key={exercise.id} className="group hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-1">{exercise.name}</CardTitle>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary">{exercise.category}</Badge>
                                                <Badge variant={exercise.difficulty === 'Iniciante' ? 'default' :
                exercise.difficulty === 'Intermediário' ? 'secondary' : 'destructive'}>
                                                    {exercise.difficulty}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(exercise.id)}>
                                            <Heart className={`w-4 h-4 ${exercise.isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}/>
                                        </Button>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-slate-600">{exercise.description}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">Duração:</span>
                                            <span className="text-slate-600">{exercise.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">Equipamento:</span>
                                            <span className="text-slate-600">{exercise.equipment.join(', ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">Grupos Musculares:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {exercise.muscleGroups.map(muscle => (<Badge key={muscle} variant="outline" className="text-xs">
                                                        {muscle}
                                                    </Badge>))}
                                            </div>
                                        </div>
                                        {exercise.rating && (<div className="flex items-center gap-2 text-sm">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current"/>
                                                <span className="font-medium">{exercise.rating}</span>
                                                <span className="text-slate-600">/ 5.0</span>
                                            </div>)}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={() => handlePlayVideo(exercise)} className="flex-1" size="sm">
                                            <Play className="w-4 h-4 mr-2"/>
                                            Ver Exercício
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => alert(`Instruções: ${exercise.instructions.join('; ')}`)}>
                                            <Download className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>)))}
                </div>
            </div>
        </div>);
};
export default PartnerExerciseLibraryPage;
