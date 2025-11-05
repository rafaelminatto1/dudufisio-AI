/**
 * Exemplos práticos de uso do Sistema Tipográfico MoocaFisio
 * 
 * Este arquivo serve como referência visual e de código para desenvolvedores
 * implementarem a hierarquia tipográfica corretamente em novos componentes.
 */

import React from 'react';
import { H1, H2, H3, Body, Small, Caption, NumericValue, Label } from '../ui/Typography';
import Card, { CardHeader, CardContent } from '../ui/Card';

/**
 * Exemplo 1: Cabeçalho de Página Completo
 */
export const PageHeaderExample = () => (
  <header className="space-y-2">
    <H1>Dashboard de Acompanhamento</H1>
    <Body>
      Monitore a evolução dos seus pacientes e identifique oportunidades de intervenção
      precoce para melhores resultados clínicos.
    </Body>
  </header>
);

/**
 * Exemplo 2: Card de Métrica Financeira
 */
export const MetricCardExample = () => (
  <Card className="bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
    <Small className="text-green-700 mb-2 block">Faturamento do Mês</Small>
    <NumericValue className="text-green-900">R$ 125.430,00</NumericValue>
    <Small className="text-green-600 mt-2 block font-medium">
      ↑ 18.3% vs mês anterior
    </Small>
    <Caption className="mt-2 text-green-600">
      Última atualização: há 5 minutos
    </Caption>
  </Card>
);

/**
 * Exemplo 3: Card de Informações do Paciente
 */
export const PatientInfoCardExample = () => (
  <Card>
    <CardHeader>
      <H3>Informações Pessoais</H3>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <Small className="text-gray-500">Nome Completo</Small>
        <Body className="font-medium">Maria Silva Santos</Body>
      </div>
      <div>
        <Small className="text-gray-500">CPF</Small>
        <Body className="font-medium">123.456.789-00</Body>
      </div>
      <div>
        <Small className="text-gray-500">Data de Nascimento</Small>
        <Body className="font-medium">15/03/1985</Body>
        <Caption className="mt-1">39 anos</Caption>
      </div>
      <div>
        <Small className="text-gray-500">Última Consulta</Small>
        <Body className="font-medium">02/11/2025</Body>
        <Caption className="mt-1">há 3 dias</Caption>
      </div>
    </CardContent>
  </Card>
);

/**
 * Exemplo 4: Formulário com Labels
 */
export const FormExample = () => (
  <form className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="nome">Nome Completo</Label>
      <input
        id="nome"
        type="text"
        placeholder="Digite o nome completo"
        className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <Caption>Este nome será usado em todos os documentos oficiais</Caption>
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <input
        id="email"
        type="email"
        placeholder="exemplo@email.com"
        className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <Small className="text-red-600">* Campo obrigatório</Small>
    </div>

    <div className="space-y-2">
      <Label htmlFor="telefone">Telefone</Label>
      <input
        id="telefone"
        type="tel"
        placeholder="(11) 98765-4321"
        className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <Caption>Formato: (DDD) 9XXXX-XXXX</Caption>
    </div>
  </form>
);

/**
 * Exemplo 5: Lista de Pacientes
 */
export const PatientListExample = () => {
  const patients = [
    { id: '1', name: 'João Pedro Costa', cpf: '123.456.789-00', lastVisit: '02/11/2025', status: 'Ativo' },
    { id: '2', name: 'Ana Carolina Lima', cpf: '987.654.321-00', lastVisit: '01/11/2025', status: 'Ativo' },
    { id: '3', name: 'Carlos Eduardo Silva', cpf: '456.789.123-00', lastVisit: '28/10/2025', status: 'Inativo' },
  ];

  return (
    <div className="space-y-3">
      {patients.map(patient => (
        <Card key={patient.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Body className="font-medium text-gray-900">{patient.name}</Body>
              <Small className="mt-1 block text-gray-600">CPF: {patient.cpf}</Small>
              <Caption className="mt-1 block">Última consulta: {patient.lastVisit}</Caption>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              patient.status === 'Ativo' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {patient.status}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * Exemplo 6: Seção com Hierarquia Completa
 */
export const FullHierarchyExample = () => (
  <section className="space-y-8">
    <header>
      <H1 className="mb-2">Dashboard Financeiro</H1>
      <Body>Acompanhe o desempenho financeiro da clínica em tempo real.</Body>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 border border-primary-200">
        <Small className="text-primary-700 mb-2 block">Total de Pacientes</Small>
        <NumericValue className="text-primary-900">247</NumericValue>
        <Small className="text-green-600 mt-2 block font-medium">↑ 12 novos este mês</Small>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
        <Small className="text-green-700 mb-2 block">Faturamento</Small>
        <NumericValue className="text-green-900">R$ 125.4K</NumericValue>
        <Small className="text-green-600 mt-2 block font-medium">↑ 18.3% vs anterior</Small>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
        <Small className="text-blue-700 mb-2 block">Consultas do Mês</Small>
        <NumericValue className="text-blue-900">1,234</NumericValue>
        <Small className="text-blue-600 mt-2 block font-medium">↑ 8.5% vs anterior</Small>
      </Card>
    </div>

    <div>
      <H2 className="mb-4">Relatórios Recentes</H2>
      <Card>
        <CardHeader>
          <H3>Análise Mensal - Outubro 2025</H3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Body>
            O mês de outubro apresentou crescimento significativo em todas as métricas principais.
            O aumento de 18.3% no faturamento reflete tanto o crescimento da base de pacientes
            quanto o aumento no ticket médio por consulta.
          </Body>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Small className="text-gray-600">Taxa de Comparecimento</Small>
              <Body className="font-bold text-gray-900 mt-1">94.5%</Body>
            </div>
            <div>
              <Small className="text-gray-600">Satisfação do Paciente</Small>
              <Body className="font-bold text-gray-900 mt-1">4.8/5.0</Body>
            </div>
            <div>
              <Small className="text-gray-600">Tempo Médio de Atendimento</Small>
              <Body className="font-bold text-gray-900 mt-1">45 min</Body>
            </div>
          </div>
          <Caption>Dados atualizados em 05/11/2025 às 14:30</Caption>
        </CardContent>
      </Card>
    </div>
  </section>
);

/**
 * Exemplo 7: Estados de Erro e Sucesso
 */
export const StatusMessagesExample = () => (
  <div className="space-y-4">
    {/* Sucesso */}
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <Body className="font-medium text-green-900">Paciente cadastrado com sucesso!</Body>
      <Small className="text-green-700 mt-1 block">
        O paciente foi adicionado ao sistema e já pode agendar consultas.
      </Small>
    </div>

    {/* Aviso */}
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <Body className="font-medium text-yellow-900">Atenção: Documento pendente</Body>
      <Small className="text-yellow-700 mt-1 block">
        O termo de consentimento ainda não foi assinado por este paciente.
      </Small>
    </div>

    {/* Erro */}
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <Body className="font-medium text-red-900">Erro ao processar pagamento</Body>
      <Small className="text-red-700 mt-1 block">
        Não foi possível processar o pagamento. Verifique os dados do cartão.
      </Small>
      <Caption className="text-red-600 mt-2">Código de erro: PAY_001</Caption>
    </div>

    {/* Info */}
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <Body className="font-medium text-blue-900">Manutenção programada</Body>
      <Small className="text-blue-700 mt-1 block">
        O sistema estará em manutenção no dia 10/11/2025 das 2h às 4h da manhã.
      </Small>
    </div>
  </div>
);

/**
 * Componente demonstrativo completo
 */
export default function TypographyExamplesShowcase() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div>
        <H1 className="mb-2">Exemplos do Sistema Tipográfico</H1>
        <Body>
          Veja exemplos práticos de como usar os componentes tipográficos do MoocaFisio
          para criar interfaces consistentes e acessíveis.
        </Body>
      </div>

      <section className="space-y-6">
        <H2>1. Cabeçalho de Página</H2>
        <PageHeaderExample />
      </section>

      <section className="space-y-6">
        <H2>2. Card de Métrica</H2>
        <MetricCardExample />
      </section>

      <section className="space-y-6">
        <H2>3. Informações do Paciente</H2>
        <PatientInfoCardExample />
      </section>

      <section className="space-y-6">
        <H2>4. Formulário</H2>
        <FormExample />
      </section>

      <section className="space-y-6">
        <H2>5. Lista de Pacientes</H2>
        <PatientListExample />
      </section>

      <section className="space-y-6">
        <H2>6. Hierarquia Completa</H2>
        <FullHierarchyExample />
      </section>

      <section className="space-y-6">
        <H2>7. Mensagens de Status</H2>
        <StatusMessagesExample />
      </section>
    </div>
  );
}

