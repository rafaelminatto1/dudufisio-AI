
import React, { useState } from 'react';
import { CheckCircle, Star, CreditCard, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// Dados dos planos inline para evitar dependências externas
const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Básico',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      '1 profissional',
      '20 pacientes',
      'Agendamento básico',
      'Suporte por email'
    ]
  },
  {
    id: 'professional',
    name: 'Profissional',
    price_monthly: 97.90,
    price_yearly: 990.00,
    popular: true,
    features: [
      '3 profissionais',
      '100 pacientes',
      'Agendamento avançado',
      'Relatórios completos',
      'Integração com parceiros',
      'Suporte prioritário'
    ]
  },
  {
    id: 'clinic',
    name: 'Clínica',
    price_monthly: 297.90,
    price_yearly: 2990.00,
    features: [
      'Profissionais ilimitados',
      'Pacientes ilimitados',
      'Múltiplas unidades',
      'Acesso à API',
      'Suporte dedicado',
      'Treinamento incluso'
    ]
  }
];

const PlanCard: React.FC<{ plan: any }> = ({ plan }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simular processo de assinatura
    setTimeout(() => {
      setIsLoading(false);
      alert(`Redirecionando para assinatura do plano ${plan.name}...`);
    }, 1000);
  };

  return (
    <Card className={`relative ${plan.popular ? 'border-sky-500 shadow-cardActive' : 'border-neutral-border'}`}>
      {plan.popular && (
        <div className="absolute -top-md left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-md py-1 rounded-full text-sm font-semibold bg-primary-light text-primary">
            <Star className="w-4 h-4 mr-sm" /> Mais Popular
          </span>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="my-4">
          <span className="text-4xl font-extrabold">R${plan.price_monthly.toFixed(2).replace('.', ',')}</span>
          <span className="text-base font-medium text-neutral-textSecondary">/mês</span>
          <p className="text-sm text-neutral-textSecondary mt-xs">
            ou R${plan.price_yearly.toFixed(2).replace('.', ',')} por ano
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-md">
        <ul className="space-y-sm">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary-hover' : 'bg-neutral-bgDark text-neutral-text hover:bg-neutral-bgDark'}`}
        >
          {isLoading ? (
            <Zap className="w-4 h-4 mr-sm animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4 mr-sm" />
          )}
          {plan.price_monthly === 0 ? 'Começar Gratuitamente' : 'Assinar Plano'}
        </Button>
      </CardContent>
    </Card>
  );
};

const SubscriptionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-bgAlt py-3xl">
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-text mb-md">
            Planos e Assinatura
          </h1>
          <p className="text-xl text-neutral-textSecondary max-w-2xl mx-auto">
            Escolha o plano que melhor se adapta às necessidades da sua clínica.
          </p>
        </div>

        {/* Features destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-12">
          <div className="text-center">
            <Shield className="w-12 h-12 text-sky-500 mx-auto mb-md" />
            <h3 className="text-lg font-semibold text-neutral-text mb-sm">Segurança Total</h3>
            <p className="text-neutral-textSecondary">Seus dados protegidos com criptografia de nível bancário</p>
          </div>
          <div className="text-center">
            <Zap className="w-12 h-12 text-sky-500 mx-auto mb-md" />
            <h3 className="text-lg font-semibold text-neutral-text mb-sm">Performance</h3>
            <p className="text-neutral-textSecondary">Sistema otimizado para máxima velocidade e confiabilidade</p>
          </div>
          <div className="text-center">
            <CreditCard className="w-12 h-12 text-sky-500 mx-auto mb-md" />
            <h3 className="text-lg font-semibold text-neutral-text mb-sm">Pagamento Seguro</h3>
            <p className="text-neutral-textSecondary">Processamento seguro com as melhores práticas do mercado</p>
          </div>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl items-stretch">
          {SUBSCRIPTION_PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* FAQ ou informações adicionais */}
        <div className="mt-xs6 text-center">
          <h2 className="text-2xl font-bold text-neutral-text mb-md">
            Dúvidas sobre os planos?
          </h2>
          <p className="text-neutral-textSecondary mb-xl">
            Nossa equipe está pronta para ajudar você a escolher o plano ideal.
          </p>
          <Button variant="outline" size="lg">
            Falar com Especialista
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
