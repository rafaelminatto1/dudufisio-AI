import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * Card promocional para acessar o novo Body Map Demo
 */
const BodyMapDemoCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/body-map-demo')}
      className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold text-white uppercase tracking-wide">
            Novo!
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          🎨 Body Map Profissional
        </h3>

        <p className="text-white/90 text-sm mb-4 leading-relaxed">
          Sistema revolucionário de mapeamento de dor com visualização anatômica,
          slider interativo com emojis e comparação entre sessões.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs text-white">
            ✨ 50+ Regiões
          </span>
          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs text-white">
            😊→😭 Emojis
          </span>
          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs text-white">
            📊 Analytics
          </span>
        </div>

        <button
          className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/body-map-demo');
          }}
        >
          <span>Testar Agora</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default BodyMapDemoCard;
