import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Section from '../components/layout/Section';
import { H1, H2, Body, Small, Caption } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import StatsCard from '../components/ui/StatsCard';
import FeatureCard from '../components/ui/FeatureCard';
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  BarChart,
  Heart,
  Clock,
  Shield,
  Video,
  FileText,
  UserCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';

/**
 * HomePage - Página Principal do MoocaFisio
 *
 * Landing page moderna com design Monday.com
 * Serve tanto para usuários não autenticados quanto autenticados
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleDemo = () => {
    if (user) {
      navigate('/teleconsultas');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section variant="white" paddingY="5xl">
        <div className="text-center space-y-xl max-w-4xl mx-auto">
          <div className="space-y-md">
            <Caption className="uppercase tracking-wider text-primary">
              MoocaFisio 2025
            </Caption>
            <H1 className="leading-tight">
              Sistema de Gestão Completo para sua Clínica de Fisioterapia
            </H1>
            <Body className="text-xl text-neutral-textSecondary">
              Simplifique sua rotina, otimize seu tempo e aumente seu faturamento
              com a plataforma mais moderna do mercado.
            </Body>
          </div>

          <div className="flex flex-col sm:flex-row gap-md justify-center pt-lg">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              onClick={handleGetStarted}
            >
              {user ? 'Ir para Dashboard' : 'Começar Gratuitamente'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDemo}
            >
              {user ? 'Ver Teleconsultas' : 'Agendar Demonstração'}
            </Button>
          </div>

          <Small className="text-neutral-textTertiary">
            Sem cartão de crédito • Cancele quando quiser • Suporte em português
          </Small>
        </div>
      </Section>

      {/* Stats Section */}
      <Section variant="gray" paddingY="4xl">
        <div className="space-y-xl">
          <div className="text-center space-y-md max-w-3xl mx-auto">
            <H2>Resultados Comprovados</H2>
            <Body className="text-neutral-textSecondary">
              Milhares de fisioterapeutas já transformaram suas clínicas com o MoocaFisio
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <StatsCard
              title="Clínicas Ativas"
              value="2.500+"
              icon={Heart}
              variant="primary"
              comparison="↑ 45% este ano"
              comparisonType="positive"
            />
            <StatsCard
              title="Pacientes Atendidos"
              value="150K+"
              icon={UserCheck}
              variant="secondary"
              comparison="↑ 200K mês"
              comparisonType="positive"
            />
            <StatsCard
              title="Taxa de Satisfação"
              value="98%"
              icon={TrendingUp}
              variant="success"
              comparison="4.9/5 estrelas"
              comparisonType="neutral"
            />
            <StatsCard
              title="Economia de Tempo"
              value="15h/sem"
              icon={Clock}
              variant="info"
              comparison="vs gestão manual"
              comparisonType="positive"
            />
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section variant="white" paddingY="4xl">
        <div className="space-y-xl">
          <div className="text-center space-y-md max-w-3xl mx-auto">
            <H2>Tudo que você precisa em um só lugar</H2>
            <Body className="text-neutral-textSecondary">
              Funcionalidades completas para gerenciar sua clínica do início ao fim
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            <FeatureCard
              title="Agenda Inteligente"
              description="Gerencie consultas e horários com facilidade"
              icon={Calendar}
              variant="primary"
              features={[
                'Agendamento automático',
                'Notificações por SMS/WhatsApp',
                'Sincronização com Google Calendar',
                'Confirmação de presença',
              ]}
              actionLabel="Explorar Agenda"
              onAction={() => navigate(user ? '/agenda' : '/signup')}
            />

            <FeatureCard
              title="Gestão Financeira"
              description="Controle completo de receitas e despesas"
              icon={DollarSign}
              variant="secondary"
              features={[
                'Emissão de notas fiscais',
                'Relatórios financeiros',
                'Controle de recebimentos',
                'Integração com bancos',
              ]}
              actionLabel="Ver Financeiro"
              onAction={() => navigate(user ? '/financial' : '/signup')}
            />

            <FeatureCard
              title="Prontuário Eletrônico"
              description="Histórico completo dos pacientes"
              icon={FileText}
              variant="accent-blue"
              features={[
                'Evolução de tratamento',
                'Fotos e anexos',
                'Anamnese digital',
                'Assinatura eletrônica',
              ]}
              actionLabel="Conhecer Prontuário"
              onAction={() => navigate(user ? '/patients' : '/signup')}
            />

            <FeatureCard
              title="Teleconsultas"
              description="Atendimento online seguro e profissional"
              icon={Video}
              variant="accent-purple"
              features={[
                'Videoconferência HD',
                'Gravação de sessões',
                'Chat integrado',
                'Compatível com celular',
              ]}
              actionLabel="Ver Teleconsultas"
              onAction={() => navigate(user ? '/teleconsultas' : '/signup')}
            />

            <FeatureCard
              title="Cadastro de Pacientes"
              description="Organize informações de forma eficiente"
              icon={Users}
              variant="accent-orange"
              features={[
                'Perfil completo',
                'Histórico de consultas',
                'Documentos digitalizados',
                'Comunicação integrada',
              ]}
              actionLabel="Ver Pacientes"
              onAction={() => navigate(user ? '/patients' : '/signup')}
            />

            <FeatureCard
              title="Relatórios e Análises"
              description="Tome decisões baseadas em dados"
              icon={BarChart}
              variant="accent-pink"
              features={[
                'Dashboard personalizado',
                'Métricas em tempo real',
                'Exportação de dados',
                'Comparativos mensais',
              ]}
              actionLabel="Ver Relatórios"
              onAction={() => navigate(user ? '/dashboard' : '/signup')}
            />
          </div>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section variant="gray" paddingY="4xl">
        <div className="space-y-xl">
          <div className="text-center space-y-md max-w-3xl mx-auto">
            <H2>O que nossos clientes dizem</H2>
            <Body className="text-neutral-textSecondary">
              Depoimentos reais de fisioterapeutas que transformaram suas clínicas
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {[
              {
                name: 'Dra. Maria Silva',
                role: 'Fisioterapeuta - São Paulo',
                quote: 'O MoocaFisio mudou completamente a forma como gerencio minha clínica. Economizo pelo menos 2 horas por dia!',
                rating: 5,
              },
              {
                name: 'Dr. João Santos',
                role: 'Clínica FisioSaúde - Rio de Janeiro',
                quote: 'A agenda inteligente reduziu em 80% as faltas dos pacientes. Recomendo para todos os colegas!',
                rating: 5,
              },
              {
                name: 'Dra. Ana Costa',
                role: 'Fisioterapeuta - Belo Horizonte',
                quote: 'Simples, intuitivo e poderoso. Exatamente o que eu precisava para crescer meu negócio.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-card p-lg shadow-card hover:shadow-cardHover transition-all duration-300"
              >
                <div className="space-y-md">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-warning text-xl">★</span>
                    ))}
                  </div>
                  <Body className="italic text-neutral-textSecondary">"{testimonial.quote}"</Body>
                  <div>
                    <Body className="font-semibold text-neutral-text">{testimonial.name}</Body>
                    <Small className="text-neutral-textSecondary">{testimonial.role}</Small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="white" paddingY="5xl">
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-4xl text-center text-white">
          <div className="space-y-lg max-w-3xl mx-auto">
            <H2 className="text-white">Pronto para transformar sua clínica?</H2>
            <Body className="text-primary-light text-xl">
              Junte-se a milhares de fisioterapeutas que já modernizaram
              sua gestão com o MoocaFisio
            </Body>
            <div className="flex flex-col sm:flex-row gap-md justify-center pt-lg">
              <Button
                variant="secondary"
                size="lg"
                icon={<ArrowRight size={20} />}
                onClick={handleGetStarted}
              >
                {user ? 'Ir para Dashboard' : 'Começar Agora'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white text-white hover:bg-white/20"
                onClick={() => navigate('/contact')}
              >
                Falar com Vendas
              </Button>
            </div>
            <Small className="text-primary-light block">
              14 dias grátis • Sem compromisso • Cancele quando quiser
            </Small>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section variant="gray" paddingY="2xl">
        <div className="text-center space-y-sm">
          <Caption className="text-neutral-textSecondary">
            © 2025 MoocaFisio. Todos os direitos reservados.
          </Caption>
          <Caption className="text-neutral-textTertiary">
            Desenvolvido com 💜 usando Claude Code
          </Caption>
        </div>
      </Section>
    </div>
  );
}
