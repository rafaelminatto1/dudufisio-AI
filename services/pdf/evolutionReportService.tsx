/**
 * Service para geração de relatórios PDF de evolução
 * Usa react-pdf para criar documentos profissionais
 */

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf,
  Font 
} from '@react-pdf/renderer';
import { SessionEvolution, Patient, Therapist, PrescribedExercise } from '@/types';
import { formatDate } from '@/lib/utils';

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #2563eb',
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  clinicInfo: {
    fontSize: 9,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1e40af',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    padding: 6,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 5,
    color: '#1f2937',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 3,
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  patientInfoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 80,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 10,
    flex: 1,
    color: '#1f2937',
  },
  conductItem: {
    marginBottom: 8,
    paddingLeft: 10,
    borderLeft: '3 solid #2563eb',
  },
  conductCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  conductDetails: {
    fontSize: 10,
    color: '#374151',
    marginLeft: 10,
  },
  exerciseTable: {
    marginTop: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    fontWeight: 'bold',
    borderBottom: '2 solid #d1d5db',
  },
  exerciseCol1: {
    width: '40%',
    fontSize: 10,
    paddingHorizontal: 5,
  },
  exerciseCol2: {
    width: '15%',
    fontSize: 10,
    textAlign: 'center',
  },
  exerciseCol3: {
    width: '15%',
    fontSize: 10,
    textAlign: 'center',
  },
  exerciseCol4: {
    width: '30%',
    fontSize: 10,
    paddingHorizontal: 5,
  },
  painBox: {
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 5,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  painValue: {
    textAlign: 'center',
  },
  painNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b45309',
  },
  painLabel: {
    fontSize: 9,
    color: '#78350f',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
    fontSize: 8,
    color: '#9ca3af',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    marginTop: 40,
    borderTop: '1 solid #000',
    width: 200,
    paddingTop: 5,
    textAlign: 'center',
  },
});

interface EvolutionPDFDocumentProps {
  patient: Patient;
  evolution: SessionEvolution;
  therapist: Therapist;
  prescribedExercises?: PrescribedExercise[];
}

// Componente do documento PDF
const EvolutionPDFDocument: React.FC<EvolutionPDFDocumentProps> = ({
  patient,
  evolution,
  therapist,
  prescribedExercises = []
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.clinicName}>MoocaFisio</Text>
        <Text style={styles.clinicInfo}>
          Relatório de Evolução Fisioterapêutica
        </Text>
        <Text style={styles.clinicInfo}>
          moocafisio.com.br • noreply@moocafisio.com.br
        </Text>
      </View>

      {/* Informações do Paciente */}
      <View style={styles.patientInfo}>
        <View style={styles.patientInfoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Paciente:</Text>
            <Text style={styles.infoValue}>{patient.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF:</Text>
            <Text style={styles.infoValue}>{patient.cpf || 'Não informado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data Nasc.:</Text>
            <Text style={styles.infoValue}>
              {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Não informado'}
            </Text>
          </View>
        </View>
        <View style={styles.patientInfoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sessão:</Text>
            <Text style={styles.infoValue}>#{evolution.sessionNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{formatDate(evolution.sessionDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Terapeuta:</Text>
            <Text style={styles.infoValue}>{therapist.name}</Text>
          </View>
          {evolution.duration && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duração:</Text>
              <Text style={styles.infoValue}>{evolution.duration} minutos</Text>
            </View>
          )}
        </View>
      </View>

      {/* S - Subjetivo */}
      {evolution.subjective && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>S - Avaliação Subjetiva</Text>
          <Text style={styles.text}>{evolution.subjective}</Text>
        </View>
      )}

      {/* O - Objetivo */}
      {evolution.objective && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O - Avaliação Objetiva</Text>
          <Text style={styles.text}>{evolution.objective}</Text>
        </View>
      )}

      {/* A - Avaliação */}
      {evolution.assessment && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A - Avaliação/Análise</Text>
          <Text style={styles.text}>{evolution.assessment}</Text>
        </View>
      )}

      {/* P - Plano (Condutas) */}
      {evolution.conducts && evolution.conducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>P - Plano (Condutas Realizadas)</Text>
          {evolution.conducts.map((conduct, index) => (
            <View key={conduct.id} style={styles.conductItem}>
              <Text style={styles.conductCategory}>{conduct.name}</Text>
              {conduct.details && (
                <Text style={styles.conductDetails}>Região/Parâmetros: {conduct.details}</Text>
              )}
              {conduct.duration && (
                <Text style={styles.conductDetails}>Duração: {conduct.duration}</Text>
              )}
              {conduct.equipment && (
                <Text style={styles.conductDetails}>Equipamento: {conduct.equipment}</Text>
              )}
              {conduct.notes && (
                <Text style={styles.conductDetails}>Obs: {conduct.notes}</Text>
              )}
            </View>
          ))}
          {evolution.planGeneralNotes && (
            <Text style={[styles.text, { marginTop: 10 }]}>{evolution.planGeneralNotes}</Text>
          )}
        </View>
      )}

      {/* Exercícios Prescritos */}
      {prescribedExercises.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercícios Prescritos</Text>
          <View style={styles.exerciseTable}>
            {/* Header */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseCol1}>Exercício</Text>
              <Text style={styles.exerciseCol2}>Séries</Text>
              <Text style={styles.exerciseCol3}>Reps</Text>
              <Text style={styles.exerciseCol4}>Carga/Tempo</Text>
            </View>
            {/* Rows */}
            {prescribedExercises.map((ex) => (
              <View key={ex.id} style={styles.exerciseRow}>
                <Text style={styles.exerciseCol1}>{ex.exercise.name}</Text>
                <Text style={styles.exerciseCol2}>{ex.sets}</Text>
                <Text style={styles.exerciseCol3}>{ex.reps}</Text>
                <Text style={styles.exerciseCol4}>
                  {ex.load || ex.duration || '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Nível de Dor */}
      {(evolution.painLevel !== undefined) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolução da Dor (EVA)</Text>
          <View style={styles.painBox}>
            <View style={styles.painValue}>
              <Text style={styles.painNumber}>{evolution.painLevel}</Text>
              <Text style={styles.painLabel}>Nível de Dor</Text>
            </View>
          </View>
        </View>
      )}

      {/* Assinatura */}
      <View style={{ marginTop: 40 }}>
        <View style={styles.signature}>
          <Text style={{ fontSize: 10 }}>{therapist.name}</Text>
          <Text style={{ fontSize: 8, color: '#6b7280' }}>
            {therapist.crefito ? `CREFITO: ${therapist.crefito}` : 'Fisioterapeuta'}
          </Text>
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text>Gerado em {formatDate(new Date().toISOString())}</Text>
        <Text>MoocaFisio - Sistema de Gestão Fisioterapêutica</Text>
      </View>
    </Page>
  </Document>
);

/**
 * Gera o PDF e retorna como Blob
 */
export async function generateEvolutionPDF(
  patient: Patient,
  evolution: SessionEvolution,
  therapist: Therapist,
  prescribedExercises?: PrescribedExercise[]
): Promise<Blob> {
  const doc = (
    <EvolutionPDFDocument
      patient={patient}
      evolution={evolution}
      therapist={therapist}
      prescribedExercises={prescribedExercises}
    />
  );

  const blob = await pdf(doc).toBlob();
  return blob;
}

/**
 * Gera o PDF e faz download automático
 */
export async function downloadEvolutionPDF(
  patient: Patient,
  evolution: SessionEvolution,
  therapist: Therapist,
  prescribedExercises?: PrescribedExercise[]
): Promise<void> {
  const blob = await generateEvolutionPDF(patient, evolution, therapist, prescribedExercises);
  
  // Criar nome do arquivo
  const date = formatDate(evolution.sessionDate).replace(/\//g, '-');
  const patientName = patient.name.replace(/\s+/g, '_');
  const filename = `evolucao_${patientName}_${date}.pdf`;

  // Download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

