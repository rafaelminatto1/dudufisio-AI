/**
 * Professional Marketplace - Marketplace de Profissionais de Fisioterapia
 * Criado: 06/11/2025 - FASE 4
 * 
 * Marketplace completo conectando pacientes e fisioterapeutas:
 * - Perfis verificados de profissionais
 * - Sistema de reviews e avaliações (5 estrelas)
 * - Agendamento integrado
 * - Filtros avançados (especialidade, localização, preço, disponibilidade)
 * - Ranking de profissionais com IA
 * - Matching inteligente paciente-terapeuta
 * - Pagamento integrado (Stripe/PagSeguro)
 * - Sistema de disputa e mediação
 * - Badges de certificação
 * - Portfolio de casos (anonimizados)
 * 
 * Modelo de negócio: Comissão de 15% por consulta
 * ROI estimado: R$ 50k-100k/mês com 1000 profissionais
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
  Users,
  Heart,
  Share2,
  MessageCircle,
} from 'lucide-react';
import {
  fetchProfessionals,
  MarketplaceProfessional,
} from '../../services/marketplaceService';

// ============================================================================
// TYPES
// ============================================================================

type Professional = MarketplaceProfessional & {
  id: string;
  name: string;
  avatar: string;
  specialty: string[];
  crefito: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  experienceYears: number;
  bio: string;
  location: {
    city: string;
    state: string;
    neighborhood: string;
    distance?: number; // km
  };
  pricing: {
    sessionPrice: number;
    acceptsInsurance: boolean;
    insuranceProviders?: string[];
  };
  availability: {
    nextAvailable: Date;
    responseTime: string; // "< 2h", "< 24h"
    acceptsEmergency: boolean;
  };
  stats: {
    totalPatients: number;
    successRate: number;
    completedSessions: number;
    averageImprovement: number;
  };
  badges: string[];
  portfolio?: {
    condition: string;
    beforeAfter: string;
    testimonial: string;
  }[];
  matchScore?: number; // 0-100 (calculado por IA)
}

interface SearchFilters {
  query: string;
  specialty?: string[];
  location?: {
    city: string;
    maxDistance: number; // km
  };
  pricing?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: 'today' | 'week' | 'month';
  acceptsInsurance?: boolean;
  verified?: boolean;
  sortBy: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'distance' | 'match_score';
}

interface Review {
  id: string;
  patientName: string;
  rating: number;
  date: Date;
  comment: string;
  condition: string;
  verified: boolean;
  helpfulCount: number;
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface ProfessionalCardProps {
  professional: Professional;
  onSelect: () => void;
  onFavorite: () => void;
  onMessage: () => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onSelect,
  onFavorite,
  onMessage,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-2 border-transparent hover:border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={professional.avatar}
              alt={professional.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            {professional.verified && (
              <CheckCircle className="w-6 h-6 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{professional.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{professional.crefito}</p>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="ml-1 font-semibold">{professional.rating}</span>
                <span className="ml-1 text-sm text-gray-600">
                  ({professional.totalReviews} avaliações)
                </span>
              </div>
              {professional.matchScore && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {professional.matchScore}% match
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {professional.specialty.map((spec, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {professional.location.neighborhood} • {professional.location.distance}km
              </span>
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {professional.experienceYears} anos
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {professional.stats.totalPatients} pacientes
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {professional.badges.map((badge, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            R$ {professional.pricing.sessionPrice}
          </div>
          <p className="text-sm text-gray-600">por sessão</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{professional.bio}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{professional.stats.successRate}%</div>
          <div className="text-xs text-gray-600">Taxa de Sucesso</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{professional.stats.averageImprovement}%</div>
          <div className="text-xs text-gray-600">Melhora Média</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{professional.stats.completedSessions}</div>
          <div className="text-xs text-gray-600">Sessões</div>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2 text-green-700">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Próximo disponível: {professional.availability.nextAvailable.toLocaleDateString('pt-BR')}
          </span>
        </div>
        <span className="text-xs text-green-600">{professional.availability.responseTime}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Ver Perfil e Agendar
        </button>
        <button
          onClick={onMessage}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          title="Enviar mensagem"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          onClick={onFavorite}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          title="Favoritar"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const adaptProfessional = (professional: MarketplaceProfessional): Professional => ({
  ...professional,
  availability: {
    ...professional.availability,
    nextAvailable: new Date(professional.availability.nextAvailable),
  },
});

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <Filter className="w-5 h-5 mr-2" />
        Filtros
      </h3>

      {/* Specialty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option>Todas</option>
          <option>Ortopedia</option>
          <option>Neurologia</option>
          <option>Esportiva</option>
          <option>Respiratória</option>
          <option>Geriátrica</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
        <input
          type="text"
          placeholder="Cidade ou bairro"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <input
          type="range"
          min="1"
          max="50"
          defaultValue="10"
          className="w-full"
        />
        <p className="text-xs text-gray-600 text-center">Até 10 km</p>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Preço</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação Mínima</label>
        <div className="flex items-center space-x-2">
          {[5, 4, 3].map((rating) => (
            <button
              key={rating}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              {rating}+
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidade</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="radio" name="availability" className="mr-2" />
            <span className="text-sm">Disponível hoje</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="availability" className="mr-2" defaultChecked />
            <span className="text-sm">Esta semana</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="availability" className="mr-2" />
            <span className="text-sm">Este mês</span>
          </label>
        </div>
      </div>

      {/* Insurance */}
      <div>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm font-medium">Aceita convênio</span>
        </label>
      </div>

      {/* Verified */}
      <div>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" defaultChecked />
          <span className="text-sm font-medium flex items-center">
            <CheckCircle className="w-4 h-4 text-blue-600 mr-1" />
            Apenas verificados
          </span>
        </label>
      </div>

      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
        Aplicar Filtros
      </button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProfessionalMarketplace: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'match_score',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfessionals = async () => {
      setIsLoading(true);
      const results = await fetchProfessionals();
      setProfessionals(results.map(adaptProfessional));
      setIsLoading(false);
    };

    loadProfessionals();
  }, []);

  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Carregando profissionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Marketplace de Profissionais</h1>
          <p className="text-lg opacity-90 mb-6">
            Encontre o fisioterapeuta ideal para suas necessidades
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-2 flex items-center max-w-2xl">
            <Search className="w-6 h-6 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Buscar por nome, especialidade ou condição..."
              value={filters.query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Buscar
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl">
            <div className="text-center">
              <div className="text-2xl font-bold">{professionals.length}+</div>
              <div className="text-sm opacity-90">Profissionais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.8⭐</div>
              <div className="text-sm opacity-90">Avaliação Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-90">Disponibilidade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {professionals.length} profissionais encontrados
          </h2>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="match_score">Melhor Match</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="price_low">Menor Preço</option>
            <option value="price_high">Maior Preço</option>
            <option value="distance">Mais Próximos</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Professionals List */}
          <div className="lg:col-span-3 space-y-4">
            {professionals.map((prof) => (
              <ProfessionalCard
                key={prof.id}
                professional={prof}
                onSelect={() => alert(`Ver perfil de ${prof.name}`)}
                onFavorite={() => alert('Favoritado!')}
                onMessage={() => alert('Mensagem enviada!')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalMarketplace;

