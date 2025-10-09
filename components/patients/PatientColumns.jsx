import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
const getStatusBadge = (status) => {
    const variants = {
        Active: 'bg-green-100 text-green-800 hover:bg-green-200',
        Inactive: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        Discharged: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    };
    const labels = {
        Active: 'Ativo',
        Inactive: 'Inativo',
        Discharged: 'Alta'
    };
    return (<Badge className={variants[status]}>
      {labels[status]}
    </Badge>);
};
const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
export const columns = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4"/>
        </Button>);
        },
        cell: ({ row }) => {
            const patient = row.original;
            return (<div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={patient.avatarUrl} alt={patient.name}/>
            <AvatarFallback className="text-xs">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{patient.name}</div>
            <div className="text-sm text-muted-foreground">{patient.cpf}</div>
          </div>
        </div>);
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("email")}</div>;
        },
    },
    {
        accessorKey: "phone",
        header: "Telefone",
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("phone")}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            return getStatusBadge(status);
        },
    },
    {
        accessorKey: "conditions",
        header: "Condições",
        cell: ({ row }) => {
            const conditions = row.original.conditions;
            return (<div className="flex flex-wrap gap-1">
          {conditions.slice(0, 2).map((condition, index) => (<Badge key={index} variant="outline" className="text-xs">
              {condition}
            </Badge>))}
          {conditions.length > 2 && (<Badge variant="outline" className="text-xs">
              +{conditions.length - 2}
            </Badge>)}
        </div>);
        },
    },
    {
        accessorKey: "totalSessions",
        header: ({ column }) => {
            return (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Sessões
          <ArrowUpDown className="ml-2 h-4 w-4"/>
        </Button>);
        },
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue("totalSessions")}</div>;
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const patient = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(patient.id)}>
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta?.onView?.(patient)}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onEdit?.(patient)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => meta?.onDelete?.(patient.id)}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>);
        },
    },
];
