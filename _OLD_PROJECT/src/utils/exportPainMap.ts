import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { PainMapSnapshot } from '@/src/services/painMaps';
import { PAIN_TYPE_OPTIONS } from '@/src/components/BodyMap';

interface ExportPainMapOptions {
  elementId: string;
  snapshot: PainMapSnapshot;
  patientName: string;
  professionalName?: string;
}

const PAIN_INTENSITY_LABELS: Record<number, string> = {
  0: 'Sem dor',
  1: 'Muito leve',
  2: 'Leve',
  3: 'Leve/Moderada',
  4: 'Moderada',
  5: 'Moderada',
  6: 'Moderada/Forte',
  7: 'Forte',
  8: 'Muito forte',
  9: 'Quase insuportável',
  10: 'Insuportável',
};

const painTypeLabelMap = new Map(
  PAIN_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

export async function exportPainMapToPDF({
  elementId,
  snapshot,
  patientName,
  professionalName,
}: ExportPainMapOptions) {
  const mapElement = document.getElementById(elementId);

  if (!mapElement) {
    throw new Error('Elemento do mapa corporal não encontrado para exportação.');
  }

  const canvas = await html2canvas(mapElement, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFontSize(16);
  pdf.setTextColor('#1d4ed8');
  pdf.text('Mapa Corporal de Dor', 20, 20);

  pdf.setFontSize(12);
  pdf.setTextColor('#0f172a');
  pdf.text(`Paciente: ${patientName}`, 20, 30);
  pdf.text(
    `Data da sessão: ${snapshot.session.sessionDate.toLocaleDateString('pt-BR')}`,
    20,
    37,
  );
  if (professionalName) {
    pdf.text(`Profissional: ${professionalName}`, 20, 44);
  }

  pdf.setDrawColor('#bfdbfe');
  pdf.setLineWidth(0.5);
  pdf.line(20, 48, pageWidth - 20, 48);

  pdf.addImage(imageData, 'PNG', 20, 55, pageWidth - 40, 120);

  pdf.setFontSize(11);
  pdf.text('Legenda de Intensidade', 20, 185);

  const legendEntries: Array<{ label: string; color: [number, number, number] }> = [
    { label: 'Sem dor (0)', color: [219, 234, 254] },
    { label: 'Leve (1-2)', color: [16, 185, 129] },
    { label: 'Moderada (3-4)', color: [251, 191, 36] },
    { label: 'Intensa (5-7)', color: [249, 115, 22] },
    { label: 'Muito intensa (8-10)', color: [239, 68, 68] },
  ];

  let legendY = 192;
  legendEntries.forEach((entry) => {
    pdf.setFillColor(...entry.color);
    pdf.rect(20, legendY - 4, 6, 6, 'F');
    pdf.text(entry.label, 30, legendY);
    legendY += 7;
  });

  pdf.addPage();
  pdf.setFontSize(14);
  pdf.setTextColor('#1d4ed8');
  pdf.text('Detalhamento por Região', 20, 20);

  pdf.setFontSize(11);
  pdf.setTextColor('#0f172a');

  let positionY = 30;
  snapshot.regions.forEach((region, index) => {
    if (positionY > 270) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor('#1d4ed8');
      pdf.text('Detalhamento por Região (cont.)', 20, 20);
      pdf.setFontSize(11);
      pdf.setTextColor('#0f172a');
      positionY = 30;
    }

    const intensityLabel =
      PAIN_INTENSITY_LABELS[Math.round(region.intensity)] ?? `${region.intensity}/10`;
    const painType = painTypeLabelMap.get(region.type) ?? region.type;

    pdf.text(
      `${index + 1}. ${region.regionId.replace(/_/g, ' ').toUpperCase()}`,
      20,
      positionY,
    );
    positionY += 6;

    pdf.text(`• Intensidade: ${region.intensity}/10 (${intensityLabel})`, 25, positionY);
    positionY += 6;

    pdf.text(`• Tipo de dor: ${painType}`, 25, positionY);
    positionY += 6;

    if (region.notes) {
      const lines = pdf.splitTextToSize(`• Observações: ${region.notes}`, pageWidth - 40);
      pdf.text(lines, 25, positionY);
      positionY += 6 * lines.length;
    }

    positionY += 4;
  });

  const safePatientName = patientName.toLowerCase().replace(/\s+/g, '-');
  const exportDate = new Date().toISOString().split('T')[0];
  pdf.save(`mapa-dor-${safePatientName}-${exportDate}.pdf`);
}

