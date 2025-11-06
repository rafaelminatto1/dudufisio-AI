import React, { useState } from 'react';
import Input from '../src/components/ui/Input';
import Badge from '../src/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../src/components/ui/Table';
import Modal from '../src/components/ui/Modal';
import { H1, H2, H3, Body } from '../src/components/ui/Typography';
import Card from '../src/components/ui/Card';
import Button from '../src/components/ui/Button';
import { Search, Mail, User, Check, AlertTriangle, Info } from 'lucide-react';

const ComponentsTestPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-neutral-bgAlt py-4xl px-md">
      <div className="max-w-7xl mx-auto space-y-4xl">
        {/* Header */}
        <div>
          <H1>Monday.com Components Test</H1>
          <Body className="text-neutral-textSecondary mt-sm">
            Validação visual dos componentes recriados
          </Body>
        </div>

        {/* Input Component */}
        <Card>
          <div className="p-xl space-y-lg">
            <H2>Input Component</H2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <Input
                label="Input Padrão"
                placeholder="Digite algo..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              <Input
                label="Input com Ícone"
                placeholder="Buscar..."
                leftIcon={<Search className="w-4 h-4" />}
              />
              
              <Input
                label="Input com Email"
                type="email"
                placeholder="seu@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              
              <Input
                label="Input com Erro"
                placeholder="Digite..."
                error="Este campo é obrigatório"
                variant="error"
              />
              
              <Input
                label="Input Desabilitado"
                placeholder="Desabilitado"
                disabled
                value="Não editável"
              />
              
              <Input
                label="Input com Ícone Direito"
                placeholder="Username"
                rightIcon={<User className="w-4 h-4" />}
              />
            </div>
          </div>
        </Card>

        {/* Badge Component */}
        <Card>
          <div className="p-xl space-y-lg">
            <H2>Badge Component</H2>
            
            <div className="space-y-md">
              <div>
                <H3 className="mb-sm">Variantes</H3>
                <div className="flex flex-wrap gap-sm">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success" icon={<Check className="w-3 h-3" />}>Success</Badge>
                  <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info" icon={<Info className="w-3 h-3" />}>Info</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              
              <div>
                <H3 className="mb-sm">Tamanhos</H3>
                <div className="flex flex-wrap items-center gap-sm">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Table Component */}
        <Card>
          <div className="p-xl space-y-lg">
            <H2>Table Component</H2>
            
            <div>
              <H3 className="mb-sm">Tabela Padrão</H3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead sortable sortDirection="asc">Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead sortable>Status</TableHead>
                    <TableHead align="right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>João Silva</TableCell>
                    <TableCell>joao@email.com</TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm">Ativo</Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maria Santos</TableCell>
                    <TableCell>maria@email.com</TableCell>
                    <TableCell>
                      <Badge variant="warning" size="sm">Pendente</Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pedro Costa</TableCell>
                    <TableCell>pedro@email.com</TableCell>
                    <TableCell>
                      <Badge variant="error" size="sm">Inativo</Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div>
              <H3 className="mb-sm">Tabela com Striping</H3>
              <Table striped>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead align="right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>001</TableCell>
                    <TableCell>Produto A</TableCell>
                    <TableCell align="right">R$ 99,90</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>002</TableCell>
                    <TableCell>Produto B</TableCell>
                    <TableCell align="right">R$ 149,90</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>003</TableCell>
                    <TableCell>Produto C</TableCell>
                    <TableCell align="right">R$ 199,90</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* Modal Component */}
        <Card>
          <div className="p-xl space-y-lg">
            <H2>Modal Component</H2>
            
            <div className="flex flex-wrap gap-sm">
              <Button onClick={() => setModalOpen(true)}>
                Abrir Modal
              </Button>
            </div>
          </div>
        </Card>

        {/* Modal Instance */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Exemplo de Modal"
          description="Este é um modal seguindo o design Monday.com"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </>
          }
        >
          <div className="space-y-md">
            <Body>
              Este modal demonstra o componente recriado seguindo o design system Monday.com.
            </Body>
            <Input
              label="Nome"
              placeholder="Digite seu nome..."
            />
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>
        </Modal>

        {/* Success Card */}
        <Card className="border-2 border-success bg-success-light">
          <div className="p-lg">
            <div className="flex items-center gap-md">
              <Check className="w-6 h-6 text-success" />
              <div>
                <H3 className="text-success">Todos os componentes criados com sucesso!</H3>
                <Body className="text-success mt-xs">
                  Input, Badge, Table e Modal estão prontos para uso.
                </Body>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComponentsTestPage;

