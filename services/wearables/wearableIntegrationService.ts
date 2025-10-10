/**
 * Wearable Integration Service
 * Serviço base para integração com dispositivos wearables
 */

import { supabase } from '../../lib/supabase';

export interface WearableData {
  id?: string;
  patient_id: string;
  source: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin';
  data_type: 'steps' | 'heart_rate' | 'sleep' | 'calories' | 'distance' | 'exercise';
  value: number;
  unit: string;
  recorded_at: string;
  metadata?: any;
  created_at?: string;
}

export interface WearableConnection {
  id?: string;
  patient_id: string;
  device_type: string;
  is_connected: boolean;
  last_sync_at?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  created_at?: string;
}

class WearableIntegrationService {
  /**
   * Verificar conexões de wearables do paciente
   */
  async getConnections(patientId: string): Promise<WearableConnection[]> {
    const { data, error } = await supabase
      .from('wearable_connections')
      .select('*')
      .eq('patient_id', patientId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Salvar dados de wearable no banco
   */
  async saveWearableData(data: WearableData): Promise<WearableData> {
    const { data: saved, error } = await supabase
      .from('wearable_data')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return saved;
  }

  /**
   * Buscar dados de wearable
   */
  async getWearableData(
    patientId: string,
    dataType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<WearableData[]> {
    let query = supabase
      .from('wearable_data')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (dataType) {
      query = query.eq('data_type', dataType);
    }
    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Sincronizar dados de dispositivo
   */
  async syncDevice(patientId: string, deviceType: string): Promise<number> {
    console.log(`[Wearables] Sincronizando ${deviceType} para paciente ${patientId}`);

    const connection = await this.getDeviceConnection(patientId, deviceType);
    
    if (!connection?.is_connected) {
      throw new Error(`Dispositivo ${deviceType} não conectado`);
    }

    let syncedCount = 0;

    switch (deviceType) {
      case 'apple_health':
        syncedCount = await this.syncAppleHealth(patientId, connection);
        break;
      case 'google_fit':
        syncedCount = await this.syncGoogleFit(patientId, connection);
        break;
      case 'fitbit':
        syncedCount = await this.syncFitbit(patientId, connection);
        break;
      case 'garmin':
        syncedCount = await this.syncGarmin(patientId, connection);
        break;
      default:
        throw new Error(`Dispositivo não suportado: ${deviceType}`);
    }

    // Atualizar timestamp de última sincronização
    await supabase
      .from('wearable_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);

    console.log(`[Wearables] ${syncedCount} registros sincronizados`);

    return syncedCount;
  }

  /**
   * Conectar dispositivo
   */
  async connectDevice(
    patientId: string,
    deviceType: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<WearableConnection> {
    const connection: Partial<WearableConnection> = {
      patient_id: patientId,
      device_type: deviceType,
      is_connected: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      last_sync_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('wearable_connections')
      .upsert(connection)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Desconectar dispositivo
   */
  async disconnectDevice(patientId: string, deviceType: string): Promise<void> {
    const { error } = await supabase
      .from('wearable_connections')
      .update({ is_connected: false })
      .eq('patient_id', patientId)
      .eq('device_type', deviceType);

    if (error) throw error;
  }

  /**
   * Buscar conexão de dispositivo
   */
  private async getDeviceConnection(
    patientId: string,
    deviceType: string
  ): Promise<WearableConnection | null> {
    const { data, error } = await supabase
      .from('wearable_connections')
      .select('*')
      .eq('patient_id', patientId)
      .eq('device_type', deviceType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Sincronizar Apple Health (placeholder)
   */
  private async syncAppleHealth(patientId: string, connection: WearableConnection): Promise<number> {
    // Em produção: usar HealthKit API
    // Por enquanto: simulação
    console.log('[Apple Health] Sincronizando dados...');
    
    const mockData: WearableData[] = [
      {
        patient_id: patientId,
        source: 'apple_health',
        data_type: 'steps',
        value: 8500,
        unit: 'steps',
        recorded_at: new Date().toISOString(),
      },
      {
        patient_id: patientId,
        source: 'apple_health',
        data_type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        recorded_at: new Date().toISOString(),
      },
    ];

    for (const data of mockData) {
      await this.saveWearableData(data);
    }

    return mockData.length;
  }

  /**
   * Sincronizar Google Fit (placeholder)
   */
  private async syncGoogleFit(patientId: string, connection: WearableConnection): Promise<number> {
    console.log('[Google Fit] Sincronizando dados...');
    
    // Em produção: usar Google Fit API
    const mockData: WearableData[] = [
      {
        patient_id: patientId,
        source: 'google_fit',
        data_type: 'steps',
        value: 9200,
        unit: 'steps',
        recorded_at: new Date().toISOString(),
      },
    ];

    for (const data of mockData) {
      await this.saveWearableData(data);
    }

    return mockData.length;
  }

  /**
   * Sincronizar Fitbit (placeholder)
   */
  private async syncFitbit(patientId: string, connection: WearableConnection): Promise<number> {
    console.log('[Fitbit] Sincronizando dados...');
    
    // Em produção: usar Fitbit Web API
    const mockData: WearableData[] = [
      {
        patient_id: patientId,
        source: 'fitbit',
        data_type: 'sleep',
        value: 7.5,
        unit: 'hours',
        recorded_at: new Date().toISOString(),
        metadata: { quality: 'good', deep_sleep: 2.5 },
      },
    ];

    for (const data of mockData) {
      await this.saveWearableData(data);
    }

    return mockData.length;
  }

  /**
   * Sincronizar Garmin (placeholder)
   */
  private async syncGarmin(patientId: string, connection: WearableConnection): Promise<number> {
    console.log('[Garmin] Sincronizando dados...');
    
    // Em produção: usar Garmin Connect API
    const mockData: WearableData[] = [
      {
        patient_id: patientId,
        source: 'garmin',
        data_type: 'exercise',
        value: 45,
        unit: 'minutes',
        recorded_at: new Date().toISOString(),
        metadata: { activity_type: 'running', distance_km: 6.5 },
      },
    ];

    for (const data of mockData) {
      await this.saveWearableData(data);
    }

    return mockData.length;
  }

  /**
   * Calcular métricas agregadas
   */
  async calculateAggregateMetrics(patientId: string, period: 'day' | 'week' | 'month' = 'week') {
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.getWearableData(
      patientId,
      undefined,
      startDate.toISOString()
    );

    const metrics = {
      total_steps: this.sumByType(data, 'steps'),
      avg_heart_rate: this.avgByType(data, 'heart_rate'),
      total_sleep_hours: this.sumByType(data, 'sleep'),
      total_calories: this.sumByType(data, 'calories'),
      total_distance_km: this.sumByType(data, 'distance'),
      exercise_minutes: this.sumByType(data, 'exercise'),
    };

    return metrics;
  }

  private sumByType(data: WearableData[], type: string): number {
    return data
      .filter(d => d.data_type === type)
      .reduce((sum, d) => sum + d.value, 0);
  }

  private avgByType(data: WearableData[], type: string): number {
    const filtered = data.filter(d => d.data_type === type);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, d) => sum + d.value, 0) / filtered.length;
  }
}

export const wearableIntegrationService = new WearableIntegrationService();









