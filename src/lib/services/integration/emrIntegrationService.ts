import { createServerComponentClient } from '~/lib/supabase/server';

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
  data_mapping: Record<string, any>;
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
  error_log?: Record<string, any>;
  duration_seconds?: number;
  imported_by: string;
  created_at: string;
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
}

/**
 * Service para integração com sistemas EMR/EHR externos via HL7 FHIR
 * Adaptado para Next.js App Router
 */
export class EMRIntegrationService {
  /**
   * Lista sistemas externos configurados
   */
  static async getExternalSystems() {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - external_systems table not in schema yet
      const { data, error } = await (supabase as any).from('external_systems').select('*').eq('is_active', true).order('system_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching external systems:', error);
      return { data: null, error };
    }
  }

  /**
   * Adiciona sistema externo
   */
  static async addExternalSystem(system: Partial<ExternalSystem>) {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - external_systems table not in schema yet
      const { data, error } = await (supabase as any).from('external_systems').insert(system).select().single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding external system:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca histórico de importações
   */
  static async getImportHistory(limit: number = 50) {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - data_imports table not in schema yet
      const { data, error } = await (supabase as any).from('data_imports').select('*').order('import_date', { ascending: false }).limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching import history:', error);
      return { data: null, error };
    }
  }

  /**
   * Importa dados de sistema externo via FHIR
   */
  static async importFromFHIR(
    systemId: string,
    resourceType: string
  ): Promise<{ data: DataImport | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();
      const startTime = Date.now();

      // Buscar configuração do sistema
      // @ts-expect-error - external_systems table not in schema yet
      const { data: system, error: systemError } = await (supabase as any).from('external_systems').select('*').eq('id', systemId).single();

      if (systemError || !system) {
        throw new Error('External system not found');
      }

      // Criar registro de importação
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

      // @ts-expect-error - data_imports table not in schema yet
      const { data: createdImport, error: importError } = await (supabase as any).from('data_imports').insert(importRecord).select().single();

      if (importError) throw importError;

      // Buscar dados do FHIR (simulado - em produção faria requisição real)
      const fhirData = await this.fetchFHIRResource(
        system.base_url || '',
        resourceType,
        system.auth_type
      );

      // Processar e importar dados
      const result = await this.processFHIRData(
        supabase,
        fhirData,
        resourceType,
        system.data_mapping
      );

      // Atualizar registro de importação
      const duration = (Date.now() - startTime) / 1000;
      // @ts-expect-error - data_imports table not in schema yet
      const { data: updatedImport, error: updateError } = await (supabase as any)
        .from('data_imports')
        .update({
          records_total: result.total,
          records_imported: result.imported,
          records_failed: result.failed,
          records_skipped: result.skipped,
          status: result.failed > 0 ? 'partial' : 'completed',
          duration_seconds: duration,
          error_log: result.errors.length > 0 ? result.errors : null,
        })
        .eq('id', createdImport.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar última sincronização do sistema
      // @ts-expect-error - external_systems table not in schema yet
      await (supabase as any).from('external_systems').update({ last_sync_at: new Date().toISOString() }).eq('id', systemId);

      return { data: updatedImport, error: null };
    } catch (error) {
      console.error('Error importing from FHIR:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca recurso FHIR de sistema externo
   */
  private static async fetchFHIRResource(
    baseUrl: string,
    resourceType: string,
    authType: string
  ): Promise<FHIRResource[]> {
    // Simulado - em produção faria requisição HTTP real
    // Exemplo: GET {baseUrl}/fhir/{resourceType}
    return [];
  }

  /**
   * Processa dados FHIR e importa no banco
   */
  private static async processFHIRData(
    supabase: any,
    fhirData: FHIRResource[],
    resourceType: string,
    dataMapping: Record<string, any>
  ) {
    let imported = 0;
    let failed = 0;
    const skipped = 0;
    const errors: any[] = [];

    for (const resource of fhirData) {
      try {
        // Mapear dados FHIR para formato interno
        const mappedData = this.mapFHIRToInternal(resource, resourceType, dataMapping);

        // Importar no banco baseado no tipo
        await this.importResource(supabase, resourceType, mappedData);
        imported++;
      } catch (error: any) {
        failed++;
        errors.push({
          resource: resource.id,
          error: error.message,
        });
      }
    }

    return {
      total: fhirData.length,
      imported,
      failed,
      skipped,
      errors,
    };
  }

  /**
   * Mapeia recurso FHIR para formato interno
   */
  private static mapFHIRToInternal(
    resource: FHIRResource,
    resourceType: string,
    dataMapping: Record<string, any>
  ): Record<string, any> {
    // Simplificado - em produção faria mapeamento completo baseado em dataMapping
    return {
      external_id: resource.id,
      resource_type: resourceType,
      data: resource,
    };
  }

  /**
   * Importa recurso no banco de dados
   */
  private static async importResource(
    supabase: any,
    resourceType: string,
    data: Record<string, any>
  ) {
    // Baseado no tipo de recurso, importar na tabela apropriada
    switch (resourceType) {
      case 'Patient':
        await supabase.from('patients').insert(data);
        break;
      case 'Appointment':
        await supabase.from('appointments').insert(data);
        break;
      default:
        // Armazenar em tabela genérica de dados externos
        await (supabase as any).from('external_data').insert({
          resource_type: resourceType,
          data: data.data,
        });
    }
  }

  /**
   * Sincroniza dados com sistema externo
   */
  static async syncWithExternalSystem(systemId: string) {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - external_systems table not in schema yet
      const { data: system } = await (supabase as any).from('external_systems').select('*').eq('id', systemId).single();

      if (!system) {
        throw new Error('System not found');
      }

      // Sincronizar diferentes tipos de recursos
      const resourceTypes = ['Patient', 'Appointment', 'Observation'];
      const results = [];

      for (const resourceType of resourceTypes) {
        const result = await this.importFromFHIR(systemId, resourceType);
        results.push({ resourceType, ...result });
      }

      return { data: results, error: null };
    } catch (error) {
      console.error('Error syncing with external system:', error);
      return { data: null, error };
    }
  }
}

