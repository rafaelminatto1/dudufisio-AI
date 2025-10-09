/**
 * Colunas da tabela de exercícios com DataTable
 */
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '../ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react';
// Mapa de cores para dificuldade
const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
    advanced: 'bg-orange-100 text-orange-800 border-orange-200',
    expert: 'bg-red-100 text-red-800 border-red-200',
};
// Mapa de labels para dificuldade
const difficultyLabels = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    expert: 'Expert',
};
export const createExerciseColumns = (onEdit, onDelete, onView, onDuplicate) => [
    {
        accessorKey: 'name',
        header: 'Nome do Exercício',
        cell: ({ row }) => {
            const exercise = row.original;
            return (<div className="flex flex-col">
          <span className="font-medium text-gray-900">{exercise.name}</span>
          <span className="text-sm text-gray-500 truncate max-w-xs">
            {exercise.description}
          </span>
        </div>);
        },
    },
    {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => {
            const exercise = row.original;
            // Aqui deveria buscar o nome da categoria pelo ID
            // Por enquanto, mostrando o ID truncado
            return (<Badge variant="outline" className="font-normal">
          {exercise.category ? exercise.category.substring(0, 8) : 'Sem categoria'}
        </Badge>);
        },
    },
    {
        accessorKey: 'difficulty',
        header: 'Dificuldade',
        cell: ({ row }) => {
            const difficulty = row.original.difficulty;
            return (<Badge className={difficultyColors[difficulty]}>
          {difficultyLabels[difficulty]}
        </Badge>);
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'targetMuscles',
        header: 'Músculos Alvo',
        cell: ({ row }) => {
            const muscles = row.original.targetMuscles;
            return (<div className="flex flex-wrap gap-1">
          {muscles.slice(0, 2).map((muscle, index) => (<Badge key={index} variant="secondary" className="text-xs">
              {muscle}
            </Badge>))}
          {muscles.length > 2 && (<Badge variant="secondary" className="text-xs">
              +{muscles.length - 2}
            </Badge>)}
        </div>);
        },
    },
    {
        accessorKey: 'equipment',
        header: 'Equipamentos',
        cell: ({ row }) => {
            const equipment = row.original.equipment;
            const equipmentLabels = {
                none: 'Nenhum',
                dumbbell: 'Halteres',
                barbell: 'Barra',
                resistance_band: 'Faixa',
                stability_ball: 'Bola',
                mat: 'Tapete',
                chair: 'Cadeira',
                wall: 'Parede',
                other: 'Outro',
            };
            return (<div className="flex flex-wrap gap-1">
          {equipment.slice(0, 2).map((eq, index) => (<Badge key={index} variant="outline" className="text-xs">
              {equipmentLabels[eq] || eq}
            </Badge>))}
          {equipment.length > 2 && (<Badge variant="outline" className="text-xs">
              +{equipment.length - 2}
            </Badge>)}
        </div>);
        },
    },
    {
        accessorKey: 'usageCount',
        header: 'Uso',
        cell: ({ row }) => {
            return (<div className="text-center">
          <span className="text-sm font-medium">{row.original.usageCount}</span>
          <span className="text-xs text-gray-500 ml-1">vezes</span>
        </div>);
        },
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (<Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>);
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: 'actions',
        header: 'Ações',
        cell: ({ row, table }) => {
            const exercise = row.original;
            const meta = table.options.meta;
            return (<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.onView(exercise)}>
              <Eye className="mr-2 h-4 w-4"/>
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onEdit(exercise)}>
              <Edit className="mr-2 h-4 w-4"/>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onDuplicate(exercise)}>
              <Copy className="mr-2 h-4 w-4"/>
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta?.onDelete(exercise)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4"/>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>);
        },
    },
];
