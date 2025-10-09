import { randomUUID } from 'crypto';
export class IoTGatewayService {
    constructor() {
        this.devices = new Map();
    }
    registerDevice(registration) {
        const id = registration.deviceId || randomUUID();
        this.devices.set(id, { ...registration, deviceId: id });
        return id;
    }
    listRegisteredDevices() {
        return Array.from(this.devices.values());
    }
    normalizeReading(reading) {
        if (reading.metric === 'temperature' && reading.unit.toLowerCase() === 'fahrenheit') {
            const value = (reading.value - 32) * (5 / 9);
            return { ...reading, value: Number(value.toFixed(2)), unit: 'celsius' };
        }
        return reading;
    }
    aggregate(readings) {
        return readings.reduce((acc, reading) => {
            const key = `${reading.metric}`;
            acc[key] = (acc[key] ?? 0) + reading.value;
            return acc;
        }, {});
    }
}
export const iotGatewayService = new IoTGatewayService();
