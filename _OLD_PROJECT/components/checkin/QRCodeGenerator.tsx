import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { EnrichedAppointment } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Copy, CheckCircle } from 'lucide-react';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: EnrichedAppointment | null;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!appointment) return null;

  // Gerar URL para check-in
  const checkInUrl = `${window.location.origin}/checkin/${appointment.id}`;
  
  // Usar API pública para gerar QR Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${appointment.patientName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code para Check-in</DialogTitle>
          <DialogDescription>
            O paciente pode escanear este código para fazer check-in automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <Card className="p-4 bg-slate-50">
            <div className="space-y-2">
              <div>
                <div className="text-sm text-slate-600">Paciente</div>
                <div className="font-semibold">{appointment.patientName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Horário</div>
                <div className="font-semibold">
                  {format(appointment.startTime, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Tipo</div>
                <div className="font-semibold">{appointment.type}</div>
              </div>
            </div>
          </Card>

          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white border-2 border-slate-200 rounded-lg">
            <img
              src={qrCodeUrl}
              alt="QR Code for check-in"
              className="w-64 h-64"
            />
          </div>

          {/* URL */}
          <Card className="p-3">
            <div className="text-xs text-slate-600 mb-2">URL de Check-in:</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-slate-100 rounded text-xs overflow-auto">
                {checkInUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Baixar QR Code
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Fechar
            </Button>
          </div>

          {/* Instructions */}
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-900">
              <strong className="block mb-1">Como usar:</strong>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>O paciente escaneia o QR Code com a câmera do celular</li>
                <li>Abre automaticamente a página de check-in</li>
                <li>Confirma os dados e faz o check-in</li>
                <li>Você recebe uma notificação instantânea</li>
              </ol>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;


