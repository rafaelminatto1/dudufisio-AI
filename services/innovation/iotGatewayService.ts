import { randomUUID } from 'crypto';

export interface SensorReading {
  sensorId: string;
  timestamp: string;
  metric: 'temperature' | 'humidity' | 'movement' | 'pressure';
  value: number;
  unit: string;
}

export interface DeviceRegistration {
  deviceId: string;
  patientId: string;
  type: 'wearable' | 'pressure_mattress' | 'environment';
  metadata?: Record<string, unknown>;
}

export class IoTGatewayService {
  private readonly devices = new Map<string, DeviceRegistration>();

  registerDevice(registration: DeviceRegistration): string {
    const id = registration.deviceId || randomUUID();
    this.devices.set(id, { ...registration, deviceId: id });
    return id;
  }

  listRegisteredDevices(): DeviceRegistration[] {
    return Array.from(this.devices.values());
  }

  normalizeReading(reading: SensorReading): SensorReading {
    if (reading.metric === 'temperature' && reading.unit.toLowerCase() === 'fahrenheit') {
      const value = (reading.value - 32) * (5 / 9);
      return { ...reading, value: Number(value.toFixed(2)), unit: 'celsius' };
    }
    return reading;
  }

  aggregate(readings: SensorReading[]): Record<string, number> {
    return readings.reduce<Record<string, number>>((acc, reading) => {
      const key = `${reading.metric}`;
      acc[key] = (acc[key] ?? 0) + reading.value;
      return acc;
    }, {});
  }
}

export const iotGatewayService = new IoTGatewayService();
