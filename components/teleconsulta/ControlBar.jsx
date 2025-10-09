// components/teleconsulta/ControlBar.tsx
import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare } from 'lucide-react';
const ControlButton = ({ onClick, children, className = '', title, disabled = false }) => (<button onClick={onClick} title={title} disabled={disabled} className={`p-3 rounded-full transition-colors ${className}`}>
        {children}
    </button>);
const ControlBar = ({ isMicOn, isCameraOn, isScreenSharing = false, onToggleMic, onToggleCamera, onToggleScreenShare, onEndCall }) => {
    return (<div className="flex justify-center items-center gap-4 bg-slate-800/50 p-2 rounded-xl max-w-md mx-auto">
            <ControlButton onClick={onToggleMic} className={isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'} title={isMicOn ? 'Desativar microfone' : 'Ativar microfone'}>
                {isMicOn ? <Mic className="w-6 h-6"/> : <MicOff className="w-6 h-6"/>}
            </ControlButton>
            <ControlButton onClick={onToggleCamera} className={isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'} title={isCameraOn ? 'Desativar câmera' : 'Ativar câmera'}>
                {isCameraOn ? <Video className="w-6 h-6"/> : <VideoOff className="w-6 h-6"/>}
            </ControlButton>
            <ControlButton onClick={onToggleScreenShare} className={isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'} title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'} disabled={!onToggleScreenShare}>
                <ScreenShare className="w-6 h-6"/>
            </ControlButton>
            <ControlButton onClick={onEndCall} className="bg-red-600 hover:bg-red-700" title="Encerrar chamada">
                <PhoneOff className="w-6 h-6"/>
            </ControlButton>
        </div>);
};
export default ControlBar;
