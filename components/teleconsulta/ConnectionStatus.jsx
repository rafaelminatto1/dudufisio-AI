import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
export const ConnectionStatus = ({ isConnected, quality, bitrate = 0, latency = 0 }) => {
    const getQualityColor = () => {
        switch (quality) {
            case 'excellent': return 'text-green-400';
            case 'good': return 'text-blue-400';
            case 'fair': return 'text-yellow-400';
            case 'poor': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };
    const getQualityText = () => {
        switch (quality) {
            case 'excellent': return 'Excelente';
            case 'good': return 'Boa';
            case 'fair': return 'Regular';
            case 'poor': return 'Ruim';
            default: return 'Desconhecida';
        }
    };
    const getSignalBars = () => {
        switch (quality) {
            case 'excellent': return 4;
            case 'good': return 3;
            case 'fair': return 2;
            case 'poor': return 1;
            default: return 0;
        }
    };
    return (<div className="flex items-center gap-2 text-sm">
      {isConnected ? (<>
          <div className="flex items-center gap-1">
            <Wifi className="w-4 h-4 text-green-400"/>
            <span className="text-green-400">Conectado</span>
          </div>
          <div className="h-4 w-px bg-slate-600"></div>
          <div className="flex items-center gap-1">
            <Signal className={`w-4 h-4 ${getQualityColor()}`}/>
            <span className={getQualityColor()}>{getQualityText()}</span>
          </div>
          {bitrate > 0 && (<>
              <div className="h-4 w-px bg-slate-600"></div>
              <span className="text-slate-400">
                {Math.round(bitrate)} kbps
              </span>
            </>)}
          {latency > 0 && (<>
              <div className="h-4 w-px bg-slate-600"></div>
              <span className="text-slate-400">
                {Math.round(latency)}ms
              </span>
            </>)}
        </>) : (<div className="flex items-center gap-1">
          <WifiOff className="w-4 h-4 text-red-400"/>
          <span className="text-red-400">Desconectado</span>
        </div>)}
    </div>);
};
export default ConnectionStatus;
