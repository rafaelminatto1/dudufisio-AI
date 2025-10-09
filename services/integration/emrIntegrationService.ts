/**
 * EMR/EHR Integration Service
 * Serviço para integração com sistemas externos via HL7 FHIR
 */

import { supabase } from '../../lib/supabase';
import axios from 'axios';

export interface ExternalSystem {
  id: string;
  system_name: string;
  system_type: string;
  base_url?: string;
  api_endpoint?: string;
  auth_type: string;
  is_active: boolean;
  last_sync_at?: string;
  next_sync_at?: string;
  sync_frequency?: string;
  data_mapping: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DataImport {
  id: string;
  external_system_id?: string;
  import_date: string;
  import_type: string;
  data_type: string;
  records_total: number;
  records_imported: number;
  records_failed: number;
  records_skipped: number;
  status: string;
  source_file_url?: string;
  error_log?: any;
  duration_seconds?: number;
  imported_by: string;
  created_at: string;
}

class EMRIntegrationService {
  /**
   * Buscar sistemas externos configurados
   */
  async getExternalSystems(): Promise<ExternalSystem[]> {
    const { data, error } = await supabase
      .from('external_systems')
      .select('*')
      .eq('is_active', true)
      .order('system_name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Adicionar sistema externo
   */
  async addExternalSystem(system: Partial<ExternalSystem>): Promise<ExternalSystem> {
    const { data, error } = await supabase
      .from('external_systems')
      .insert(system)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar histórico de importações
   */
  async getImportHistory(limit: number = 50): Promise<DataImport[]> {
    const { data, error } = await supabase
      .from('data_imports')
      .select('*')
      .order('import_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Importar dados de sistema externo (FHIR)
   */
  async importFromFHIR(systemId: string, resourceType: string): Promise<DataImport> {
    const importRecord: Partial<DataImport> = {
      external_system_id: systemId,
      import_date: new Date().toISOString(),
      import_type: 'incremental',
      data_type: resourceType,
      records_total: 0,
      records_imported: 0,
      records_failed: 0,
      records_skipped: 0,
      status: 'in_progress',
      imported_by: 'system',
    };

    // Criar registro de import
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .insert(importRecord)
      .select()
      .single();

    if (importError) throw importError;

    try {
      // Buscar configuração do sistema
      const { data: system } = await supabase
        .from('external_systems')
        .select('*')
        .eq('id', systemId)
        .single();

      if (!system) throw new Error('Sistema não encontrado');

      // Fazer request para API FHIR
      const startTime = Date.now();
      const response = await this.fetchFHIRResources(system, resourceType);
      const endTime = Date.now();

      // Processar recursos
      const results = await this.processFHIRResources(response.data, system.data_mapping);

      // Atualizar registro de import
      await supabase
        .from('data_imports')
        .update({
          records_total: results.total,
          records_imported: results.imported,
          records_failed: results.failed,
          records_skipped: results.skipped,
          status: results.failed === 0 ? 'completed' : 'partial',
          duration_seconds: Math.floor((endTime - startTime) / 1000),
        })
        .eq('id', importData.id);

      return importData;
    } catch (error: any) {
      // Marcar import como falhado
      await supabase
        .from('data_imports')
        .update({
          status: 'failed',
          error_log: { message: error.message, stack: error.stack },
        })
        .eq('id', importData.id);

      throw error;
    }
  }

  /**
   * Exportar dados para formato FHIR
   */
  async exportToFHIR(patientId: string, resourceTypes: string[]): Promise<any> {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [] as any[],
    };

    // Para cada tipo de recurso, buscar e converter
    for (const resourceType of resourceTypes) {
      const resources = await this.convertToFHIR(patientId, resourceType);
      fhirBundle.entry.push(...resources);
    }

    // Registrar export
    await supabase.from('data_exports').insert({
      export_date: new Date().toISOString(),
      export_type: 'filtered',
      data_type: resourceTypes.join(','),
      records_total: fhirBundle.entry.length,
      records_exported: fhirBundle.entry.length,
      records_failed: 0,
      status: 'completed',
      format: 'fhir_json',
      exported_by: 'system',
    });

    return fhirBundle;
  }

  /**
   * Buscar recursos FHIR em cache
   */
  async getFHIRResources(patientId: string, resourceType?: string) {
    let query = supabase
      .from('fhir_resources')
      .select('*')
      .eq('patient_id', patientId);

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Fazer request para API FHIR
   */
  private async fetchFHIRResources(system: ExternalSystem, resourceType: string) {
    const url = `${system.base_url}/${resourceType}`;
    
    // Configurar autenticação baseado no tipo
    const headers: any = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    };

    // Adicionar autenticação (simplificado)
    // Na produção, descriptografar credentials_encrypted
    
    return await axios.get(url, { headers });
  }

  /**
   * Processar recursos FHIR e salvar no banco
   */
  private async processFHIRResources(resources: any, mapping: any) {
    let total = 0;
    let imported = 0;
    let failed = 0;
    let skipped = 0;

    const entries = resources.entry || [];
    total = entries.length;

    for (const entry of entries) {
      try {
        const resource = entry.resource;
        
        // Mapear campos FHIR para nosso schema
        const mappedData = this.mapFHIRResource(resource, mapping);
        
        // Salvar no banco
        await this.saveResource(resource.resourceType, mappedData);
        
        // Cache FHIR resource
        await supabase.from('fhir_resources').upsert({
          resource_type: resource.resourceType,
          resource_id: resource.id,
          patient_id: mappedData.patient_id,
          fhir_version: 'R4',
          resource_data: resource,
          last_sync_at: new Date().toISOString(),
        });

        imported++;
      } catch (error) {
        console.error('Erro ao processar recurso:', error);
        failed++;
      }
    }

    return { total, imported, failed, skipped };
  }

  /**
   * Mapear recurso FHIR para schema interno
   */
  private mapFHIRResource(resource: any, mapping: any) {
    // Implementação simplificada
    // Na produção, usar field_mappings table
    return {
      patient_id: resource.subject?.reference?.split('/')[1],
      // ... outros mapeamentos
    };
  }

  /**
   * Salvar recurso no banco
   */
  private async saveResource(resourceType: string, data: any) {
    // Mapear tipo FHIR para tabela do Supabase
    const tableMapping: Record<string, string> = {
      Patient: 'patients',
      Appointment: 'appointments',
      Observation: 'observations',
      // ... outros
    };

    const table = tableMapping[resourceType];
    if (!table) {
      throw new Error(`Tipo de recurso não suportado: ${resourceType}`);
    }

    const { error } = await supabase.from(table).upsert(data);
    if (error) throw error;
  }

  /**
   * Converter dados internos para FHIR
   */
  private async convertToFHIR(patientId: string, resourceType: string) {
    // Implementação simplificada
    // Buscar dados e converter para formato FHIR R4
    const resources: any[] = [];

    switch (resourceType) {
      case 'Patient':
        const { data: patient } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();
        
        if (patient) {
          resources.push({
            resource: this.patientToFHIR(patient),
          });
        }
        break;
      
      // Adicionar outros tipos conforme necessário
    }

    return resources;
  }

  /**
   * Converter paciente para formato FHIR
   */
  private patientToFHIR(patient: any) {
    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        {
          system: 'http://rnds.saude.gov.br/fhir/r4/NamingSystem/cpf',
          value: patient.cpf,
        },
      ],
      name: [
        {
          use: 'official',
          text: patient.full_name,
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: patient.phone,
          use: 'mobile',
        },
        {
          system: 'email',
          value: patient.email,
        },
      ],
      gender: patient.gender === 'M' ? 'male' : 'female',
      birthDate: patient.birth_date,
      address: [
        {
          use: 'home',
          text: `${patient.address_street}, ${patient.address_number}`,
          city: patient.address_city,
          state: patient.address_state,
          postalCode: patient.address_zip_code,
          country: 'BR',
        },
      ],
    };
  }
}

export const emrIntegrationService = new EMRIntegrationService();




