import React from 'react';

interface JitsiMeetingProps {
  roomName: string;
  displayName?: string;
  onReady?: () => void;
  onClose?: () => void;
  onQualityChange?: (quality: string) => void;
}

/**
 * Placeholder para JitsiMeeting
 * 
 * Este componente foi movido ou removido.
 * Para funcionalidade de teleconsulta, use os componentes em /components/teleconsulta
 */
export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName,
  displayName = 'Participante',
  onReady,
  onClose
}) => {
  React.useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
        <h2 className="text-2xl font-bold mb-4">Teleconsulta</h2>
        <p className="text-gray-600 mb-4">
          Sala: <strong>{roomName}</strong>
        </p>
        <p className="text-gray-600 mb-4">
          Usuário: {displayName}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-sm text-blue-800">
            ℹ️ Este é um placeholder. Para funcionalidade completa de teleconsulta,
            configure os componentes em /components/teleconsulta
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
};

export default JitsiMeeting;

