/**
 * Página de Perfil do Paciente
 * MoocaFisio - App para Pacientes
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { getPatientData, logout } from '../services/patientAuthService';
import PatientLayout from '../components/PatientLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Mail, Phone, Calendar, LogOut } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function PatientProfilePage() {
  const patient = getPatientData();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRemote = location.pathname.startsWith('/patient/');
  const basePath = isRemote ? '/patient' : '';
  
  const handleLogout = () => {
    logout();
    navigate(`${basePath}/login`, { replace: true });
  };
  
  if (!patient) {
    return (
      <PatientLayout>
        <Card>
          <p className="text-center text-neutral-textSecondary">
            Erro ao carregar dados do perfil
          </p>
        </Card>
      </PatientLayout>
    );
  }
  
  return (
    <PatientLayout>
      {/* Header */}
      <div className="mb-lg">
        <h1 className="text-h2 text-neutral-text mb-sm">
          Meu Perfil
        </h1>
        <p className="text-body text-neutral-textSecondary">
          Suas informações pessoais
        </p>
      </div>
      
      {/* Profile Card */}
      <Card className="mb-lg">
        <div className="flex flex-col md:flex-row items-center gap-lg">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {patient.photoUrl ? (
              <img
                src={patient.photoUrl}
                alt={patient.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-h3 text-neutral-text font-semibold mb-sm">
              {patient.name}
            </h2>
            <div className="space-y-sm text-body text-neutral-textSecondary">
              {patient.email && (
                <div className="flex items-center gap-sm justify-center md:justify-start">
                  <Mail className="w-4 h-4" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-sm justify-center md:justify-start">
                  <Phone className="w-4 h-4" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.dateOfBirth && (
                <div className="flex items-center gap-sm justify-center md:justify-start">
                  <Calendar className="w-4 h-4" />
                  <span>Nascimento: {formatDate(patient.dateOfBirth)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* About App */}
      <Card className="mb-lg">
        <h3 className="text-h4 text-neutral-text font-semibold mb-md">
          Sobre o App
        </h3>
        <p className="text-body text-neutral-textSecondary mb-md">
          O <strong>MoocaFisio</strong> é seu parceiro na recuperação e manutenção da saúde. 
          Aqui você pode acessar seus exercícios prescritos, acompanhar sua evolução e 
          manter contato com seu fisioterapeuta.
        </p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-md">
          <p className="text-small text-primary">
            💡 <strong>Dica:</strong> Para melhor resultado, realize seus exercícios regularmente 
            e marque-os como concluídos para acompanhar seu progresso.
          </p>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <Card className="mb-lg">
        <h3 className="text-h4 text-neutral-text font-semibold mb-md">
          Ações Rápidas
        </h3>
        <div className="space-y-md">
          <button
            onClick={() => navigate(`${basePath}/exercises`)}
            className="w-full p-md rounded-lg border border-neutral-border hover:bg-neutral-bgAlt transition-colors text-left"
          >
            <p className="text-body text-neutral-text font-medium">
              Ver Meus Exercícios
            </p>
            <p className="text-small text-neutral-textSecondary">
              Acesse todos os exercícios prescritos
            </p>
          </button>
          
          <button
            onClick={() => navigate(`${basePath}/dashboard`)}
            className="w-full p-md rounded-lg border border-neutral-border hover:bg-neutral-bgAlt transition-colors text-left"
          >
            <p className="text-body text-neutral-text font-medium">
              Ver Estatísticas
            </p>
            <p className="text-small text-neutral-textSecondary">
              Acompanhe seu progresso e evolução
            </p>
          </button>
        </div>
      </Card>
      
      {/* Support */}
      <Card className="mb-lg">
        <h3 className="text-h4 text-neutral-text font-semibold mb-md">
          Precisa de Ajuda?
        </h3>
        <p className="text-body text-neutral-textSecondary mb-md">
          Entre em contato com sua clínica de fisioterapia:
        </p>
        <div className="space-y-sm">
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary hover:underline"
          >
            WhatsApp: (11) 99999-9999
          </a>
          <a
            href="mailto:contato@moocafisio.com.br"
            className="block text-primary hover:underline"
          >
            Email: contato@moocafisio.com.br
          </a>
        </div>
      </Card>
      
      {/* Logout */}
      <Card>
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={handleLogout}
          className="flex items-center justify-center gap-md"
        >
          <LogOut className="w-5 h-5" />
          Sair do Aplicativo
        </Button>
        <p className="text-small text-neutral-textSecondary text-center mt-md">
          Você pode entrar novamente com seu código de acesso
        </p>
      </Card>
    </PatientLayout>
  );
}

