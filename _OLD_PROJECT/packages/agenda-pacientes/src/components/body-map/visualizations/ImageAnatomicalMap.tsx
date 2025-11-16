/**
 * IMAGE ANATOMICAL MAP
 * Mapa corporal com imagem anatômica real e overlay de pontos
 * Usa imagens de domínio público ou placeholder
 */

import React, { useRef } from 'react';
import type { BodyMapVisualizationProps } from '../../../types';
import { getPainLevelColor } from '../../../services/bodyMapService';

const ImageAnatomicalMap: React.FC<BodyMapVisualizationProps> = ({
  bodySide,
  painRegions,
  mainComplaint,
  onAddPoint,
  onSelectPoint,
  readOnly = false,
  showLabels = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onAddPoint(x, y);
  };

  const handlePointClick = (region: any, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectPoint(region);
  };

  const filteredRegions = painRegions.filter(r => r.bodySide === bodySide);

  // URLs de imagens anatômicas (placeholder - substituir por imagens reais)
  const imageUrl = bodySide === 'front' 
    ? '/images/body-anatomy-front.png' 
    : '/images/body-anatomy-back.png';

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
      {/* Container da imagem com overlay */}
      <div
        ref={containerRef}
        className={`relative w-full h-full ${!readOnly ? 'cursor-crosshair' : ''}`}
        onClick={handleImageClick}
      >
        {/* Imagem anatômica de fundo */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Fallback: Ilustração SVG se imagem não carregar */}
          <div className="relative w-full max-w-md h-full">
            <img
              src={imageUrl}
              alt={`Corpo humano - ${bodySide === 'front' ? 'frontal' : 'posterior'}`}
              className="w-full h-full object-contain opacity-80"
              onError={(e) => {
                // Fallback para SVG se imagem não existir
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* SVG Fallback */}
            <svg
              viewBox="0 0 300 700"
              className="absolute inset-0 w-full h-full opacity-20"
              style={{ display: 'none' }} // Mostrar apenas se imagem falhar
            >
              {bodySide === 'front' ? (
                <path
                  d="M 150,50 Q 140,40 150,30 Q 160,40 150,50 L 150,90 Q 130,100 120,120 L 110,180 M 150,90 Q 170,100 180,120 L 190,180 M 150,90 L 150,250 Q 140,260 130,270 L 125,450 M 150,250 Q 160,260 170,270 L 175,450 M 110,180 L 90,200 L 85,220 M 190,180 L 210,200 L 215,220"
                  stroke="#94a3b8"
                  strokeWidth="3"
                  fill="none"
                />
              ) : (
                <path
                  d="M 150,50 Q 140,40 150,30 Q 160,40 150,50 L 150,90 Q 130,105 120,130 L 115,190 M 150,90 Q 170,105 180,130 L 185,190 M 150,90 L 150,255 Q 140,265 132,275 L 128,455 M 150,255 Q 160,265 168,275 L 172,455 M 115,190 L 95,210 L 90,230 M 185,190 L 205,210 L 210,230"
                  stroke="#94a3b8"
                  strokeWidth="3"
                  fill="none"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Overlay de pontos de dor */}
        <div className="absolute inset-0 pointer-events-none">
          {filteredRegions.map(region => {
            const isMain = region.id === mainComplaint?.id;
            const color = getPainLevelColor(region.painLevel);
            const size = isMain ? 48 : 32;
            
            return (
              <div
                key={region.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${region.coordinatesX}%`,
                  top: `${region.coordinatesY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Pulso animado para queixa principal */}
                {isMain && (
                  <div
                    className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping"
                    style={{ width: size, height: size }}
                  />
                )}

                {/* Círculo do ponto de dor */}
                <div
                  className={`relative flex items-center justify-center rounded-full shadow-lg cursor-pointer transition-all hover:scale-110 ${
                    isMain ? 'ring-4 ring-amber-400' : 'ring-2 ring-white'
                  }`}
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: color,
                  }}
                  onClick={(e) => handlePointClick(region, e)}
                >
                  {/* Nível de dor */}
                  <span className="text-white font-bold text-sm">
                    {region.painLevel}
                  </span>

                  {/* Indicador de resolvida */}
                  {!region.isActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Badge "PRINCIPAL" */}
                {isMain && showLabels && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                    ⭐ PRINCIPAL
                  </div>
                )}

                {/* Tooltip com informações */}
                {showLabels && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800/95 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    {region.bodyRegion} - {region.painLevel}/10
                    {region.painTypes.length > 0 && (
                      <div className="text-[10px] text-slate-300">{region.painTypes.join(', ')}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Instruções */}
        {!readOnly && filteredRegions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 text-center max-w-sm">
              <div className="text-4xl mb-3">📍</div>
              <div className="font-bold text-slate-800 mb-2">Adicione Pontos de Dor</div>
              <div className="text-sm text-slate-600">
                Clique na imagem onde o paciente sente dor
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legenda flutuante */}
      {showLabels && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 text-xs max-w-xs">
          <div className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-base">📊</span>
            Legenda de Intensidade
          </div>
          
          <div className="space-y-2">
            {[
              { level: 2, label: 'Leve', desc: '1-2' },
              { level: 4, label: 'Moderada', desc: '3-4' },
              { level: 6, label: 'Forte', desc: '5-6' },
              { level: 8, label: 'Muito Forte', desc: '7-8' },
              { level: 10, label: 'Intensa', desc: '9-10' },
            ].map(({ level, label, desc }) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full shadow-sm flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: getPainLevelColor(level) }}
                >
                  {level}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-700">{label}</div>
                  <div className="text-[10px] text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div>
              <span>Resolvida</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 mt-1">
              <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-white text-[10px]">⭐</div>
              <span>Queixa Principal</span>
            </div>
          </div>
        </div>
      )}

      {/* Contador de pontos */}
      {filteredRegions.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm text-white rounded-xl shadow-xl px-4 py-3">
          <div className="text-2xl font-bold">{filteredRegions.length}</div>
          <div className="text-xs text-slate-300">
            {filteredRegions.length === 1 ? 'ponto de dor' : 'pontos de dor'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {filteredRegions.filter(r => r.isActive).length} ativo{filteredRegions.filter(r => r.isActive).length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Botão de ajuda */}
      {!readOnly && (
        <div className="absolute bottom-4 right-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors"
            title="Ajuda"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageAnatomicalMap;

