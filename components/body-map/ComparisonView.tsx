/**
 * COMPARISON VIEW
 * Visualização comparativa entre primeira e última sessão do mapa corporal
 */

import React, { useState } from 'react';
import type { BodyMapComparison } from '../../types';
import SVGSimpleBodyMap from './visualizations/SVGSimpleBodyMap';
import { ArrowRight, TrendingDown, TrendingUp, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { getPainLevelColor } from '../../services/bodyMapService';

interface ComparisonViewProps {
  comparison: BodyMapComparison;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparison }) => {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');

  const { firstSession, lastSession, improvements, worsenings, newRegions, resolvedRegions, overallChange } =
    comparison;

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Comparação de Evolução</h2>
            <p className="text-sm text-slate-600 mt-1">
              {new Date(firstSession.sessionDate).toLocaleDateString('pt-BR')} →{' '}
              {new Date(lastSession.sessionDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Indicador de Mudança Geral */}
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${
                overallChange > 0
                  ? 'text-green-600'
                  : overallChange < 0
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`}
            >
              {overallChange > 0 ? (
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-8 h-8" />
                  <span>-{overallChange.toFixed(0)}%</span>
                </div>
              ) : overallChange < 0 ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-8 h-8" />
                  <span>+{Math.abs(overallChange).toFixed(0)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Minus className="w-8 h-8" />
                  <span>0%</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">Mudança Geral</p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">Melhorias</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{improvements.length}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Pioras</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{worsenings.length}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Novas</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{newRegions.length}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Resolvidas</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{resolvedRegions.length}</p>
          </div>
        </div>
      </div>

      {/* Toggle Front/Back */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setSelectedSide('front')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSide === 'front'
                ? 'bg-blue-500 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Vista Frontal
          </button>
          <button
            onClick={() => setSelectedSide('back')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSide === 'back' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Vista Posterior
          </button>
        </div>
      </div>

      {/* Comparação Visual Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primeira Sessão */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Primeira Avaliação</h3>
            <p className="text-sm text-slate-600">
              {new Date(firstSession.sessionDate).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="p-4 min-h-[500px]">
            <SVGSimpleBodyMap
              bodySide={selectedSide}
              painRegions={firstSession.painRegions || []}
              mainComplaint={firstSession.painRegions?.find((r) => r.isMainComplaint)}
              onAddPoint={() => {}}
              onSelectPoint={() => {}}
              readOnly={true}
              showLabels={true}
            />
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Pontos de dor:</span>
              <span className="font-bold text-slate-800">
                {firstSession.painRegions?.filter((r) => r.bodySide === selectedSide).length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">Dor média:</span>
              <span className="font-bold" style={{ 
                color: getPainLevelColor(
                  firstSession.painRegions?.reduce((sum, r) => sum + r.painLevel, 0) /
                    (firstSession.painRegions?.length || 1) || 0
                )
              }}>
                {(
                  firstSession.painRegions?.reduce((sum, r) => sum + r.painLevel, 0) /
                    (firstSession.painRegions?.length || 1) || 0
                ).toFixed(1)}
                /10
              </span>
            </div>
          </div>
        </div>

        {/* Última Sessão */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
            <h3 className="font-bold text-blue-800">Avaliação Atual</h3>
            <p className="text-sm text-blue-700">
              {new Date(lastSession.sessionDate).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="p-4 min-h-[500px]">
            <SVGSimpleBodyMap
              bodySide={selectedSide}
              painRegions={lastSession.painRegions || []}
              mainComplaint={lastSession.painRegions?.find((r) => r.isMainComplaint)}
              onAddPoint={() => {}}
              onSelectPoint={() => {}}
              readOnly={true}
              showLabels={true}
            />
          </div>
          <div className="bg-blue-50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Pontos de dor:</span>
              <span className="font-bold text-slate-800">
                {lastSession.painRegions?.filter((r) => r.bodySide === selectedSide).length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">Dor média:</span>
              <span className="font-bold" style={{ 
                color: getPainLevelColor(
                  lastSession.painRegions?.reduce((sum, r) => sum + r.painLevel, 0) /
                    (lastSession.painRegions?.length || 1) || 0
                )
              }}>
                {(
                  lastSession.painRegions?.reduce((sum, r) => sum + r.painLevel, 0) /
                    (lastSession.painRegions?.length || 1) || 0
                ).toFixed(1)}
                /10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Listas Detalhadas de Mudanças */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Melhorias e Pioras */}
        <div className="space-y-4">
          {/* Melhorias */}
          {improvements.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Melhorias ({improvements.length})
              </h3>
              <ul className="space-y-2">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pioras */}
          {worsenings.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Pioras ({worsenings.length})
              </h3>
              <ul className="space-y-2">
                {worsenings.map((worsening, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{worsening}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Novas Regiões e Resolvidas */}
        <div className="space-y-4">
          {/* Novas Regiões */}
          {newRegions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novas Regiões ({newRegions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {newRegions.map((region, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Regiões Resolvidas */}
          {resolvedRegions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Regiões Resolvidas ({resolvedRegions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {resolvedRegions.map((region, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-sm"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;

