'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCog, Plus } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email: string
  role: string
  created_at: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Função',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
          {role === 'admin' ? 'Administrador' : role === 'therapist' ? 'Fisioterapeuta' : 'Paciente'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Cadastrado em',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return date.toLocaleDateString('pt-BR')
    },
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCog className="h-8 w-8" />
          Gestão de Usuários
        </h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Gerencie todos os usuários cadastrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchKey="email"
              searchPlaceholder="Buscar por email..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
