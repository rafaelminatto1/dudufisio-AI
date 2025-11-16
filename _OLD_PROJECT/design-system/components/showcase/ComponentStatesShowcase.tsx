import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../layout/Card';
import { Button } from '../inputs/Button';
import { Input } from '../inputs/Input';
import { Select } from '../inputs/Select';

export const ComponentStatesShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectOptions = [
    { value: 'option1', label: 'Opção 1' },
    { value: 'option2', label: 'Opção 2' },
    { value: 'option3', label: 'Opção 3' },
  ];

  const handleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Estados Visuais Completos
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Demonstração de todos os estados visuais dos componentes do design system
        </p>
      </div>

      {/* Button States */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Estados de Botão
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Variações de Estilo
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Estados de Interação
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="secondary" disabled>Disabled Secondary</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
              <Button variant="primary" isLoading>Loading</Button>
              <Button variant="secondary" isLoading>Loading Secondary</Button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Tamanhos
            </h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large</Button>
              <Button size="xl" variant="primary">Extra Large</Button>
              <Button size="full" variant="primary">Full Width</Button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Com Ícones
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" leftIcon="🚀">Com Ícone Esquerdo</Button>
              <Button variant="secondary" rightIcon="✨">Com Ícone Direito</Button>
              <Button variant="outline" leftIcon="🎯" rightIcon="🎉">Com Ambos</Button>
              <Button variant="ghost" isLoading isLoadingText="Processando...">
                Loading com Texto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input States */}
      <Card variant="outlined">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Estados de Input
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Estados Básicos
              </h4>
              <Input
                placeholder="Input padrão"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                placeholder="Input com label"
                label="Nome Completo"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                placeholder="Input com placeholder"
                label="Email"
                type="email"
                helperText="Digite seu email profissional"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Estados de Validação
              </h4>
              <Input
                placeholder="Input de sucesso"
                label="Senha"
                type="password"
                state="success"
                helperText="Senha forte!"
              />
              <Input
                placeholder="Input com erro"
                label="Confirmação de Senha"
                type="password"
                state="error"
                helperText="As senhas não coincidem"
              />
              <Input
                placeholder="Input com aviso"
                label="Data de Nascimento"
                state="warning"
                helperText="Formato: DD/MM/AAAA"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Estados de Interação
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Input desabilitado"
                label="Campo Bloqueado"
                disabled
                value="Valor fixo"
              />
              <Input
                placeholder="Input readonly"
                label="Campo Somente Leitura"
                readOnly
                value="Não pode ser alterado"
              />
              <Input
                placeholder="Input required"
                label="Campo Obrigatório *"
                required
                helperText="Este campo é obrigatório"
              />
              <Input
                placeholder="Input com máscara"
                label="CPF"
                maxLength={14}
                helperText="Formato: 000.000.000-00"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Variações de Tamanho
            </h4>
            <div className="space-y-4">
              <Input size="sm" placeholder="Small input" label="Pequeno" />
              <Input size="md" placeholder="Medium input" label="Médio" />
              <Input size="lg" placeholder="Large input" label="Grande" />
              <Input size="full" placeholder="Full width input" label="Largura Total" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select States */}
      <Card variant="filled">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Estados de Select
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Estados Básicos
              </h4>
              <Select
                options={selectOptions}
                placeholder="Selecione uma opção"
                value={selectValue}
                onChange={(value) => setSelectValue(value)}
              />
              <Select
                options={selectOptions}
                placeholder="Select com label"
                label="Categoria"
                value={selectValue}
                onChange={(value) => setSelectValue(value)}
              />
              <Select
                options={selectOptions}
                placeholder="Select com helper text"
                label="Status"
                helperText="Escolha o status do pedido"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Estados de Validação
              </h4>
              <Select
                options={selectOptions}
                placeholder="Select de sucesso"
                label="Prioridade"
                state="success"
                helperText="Prioridade definida com sucesso"
              />
              <Select
                options={selectOptions}
                placeholder="Select com erro"
                label="Cidade"
                state="error"
                helperText="Por favor, selecione uma cidade"
              />
              <Select
                options={selectOptions}
                placeholder="Select com aviso"
                label="Método de Pagamento"
                state="warning"
                helperText="Verifique as condições de pagamento"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Estados de Interação
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                options={selectOptions}
                placeholder="Select desabilitado"
                label="Campo Bloqueado"
                disabled
                value="option1"
              />
              <Select
                options={selectOptions}
                placeholder="Select required"
                label="Campo Obrigatório *"
                required
                helperText="Este campo é obrigatório"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Variações Avançadas
            </h4>
            <div className="space-y-4">
              <Select
                options={selectOptions}
                placeholder="Select com busca"
                label="País"
                searchable
                helperText="Digite para buscar"
              />
              <Select
                options={selectOptions}
                placeholder="Select múltiplo"
                label="Habilidades"
                multiple
                helperText="Selecione várias opções"
              />
              <Select
                options={selectOptions}
                placeholder="Select limpável"
                label="Departamento"
                clearable
                helperText="Clique no X para limpar"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card States */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Estados de Card
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Card Padrão</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Estado padrão do card com estilo básico
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Card Elevado</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Card com sombra elevada para destaque
                </p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Card Contornado</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Card com borda delineada
                </p>
              </CardContent>
            </Card>

            <Card variant="filled">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Card Preenchido</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Card com fundo preenchido
                </p>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-white">Card Gradiente</h4>
                <p className="text-sm text-white/80">
                  Card com fundo em gradiente
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Card Interativo</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Card com efeito hover interativo
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};