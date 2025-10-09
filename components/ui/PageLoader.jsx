import React from 'react';
import { Stethoscope } from 'lucide-react';
const PageLoader = ({ message = "Carregando DuduFisio-AI...", showProgress = false, progress = 0 }) => {
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" role="status" aria-live="polite" aria-label="Carregando aplicação">
      <div className="relative flex items-center justify-center">
        <Stethoscope className="w-16 h-16 text-sky-500 animate-pulse" aria-hidden="true"/>
        <div className="absolute w-24 h-24 border-t-2 border-b-2 border-sky-200 rounded-full animate-spin" aria-hidden="true"></div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-slate-700 mb-2">
          {message}
        </p>
        
        {showProgress && (<div className="w-64 bg-slate-200 rounded-full h-2 mb-2">
            <div className="bg-sky-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} aria-label={`Progresso: ${progress}%`}></div>
          </div>)}
        
        <p className="text-sm text-slate-500">
          Sistema de Gestão em Fisioterapia
        </p>
      </div>
    </div>);
};
export default PageLoader;
