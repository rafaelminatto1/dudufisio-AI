import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Patient } from '../../types';
import { PatientAttendancePoint } from '../../services/acompanhamentoService';

interface AttendanceChartProps {
    attendanceSeries: Record<string, PatientAttendancePoint[]>;
    patients: Patient[];
}

const statusLabelMap: Record<PatientAttendancePoint['status'], string> = {
    Completed: 'Compareceu',
    Scheduled: 'Agendado',
    NoShow: 'Faltou',
};

const statusValueMap: Record<PatientAttendancePoint['status'], number> = {
    Completed: 1,
    Scheduled: 0.5,
    NoShow: 0,
};

const valueToLabel = (value: number) => {
    if (value >= 0.75) return 'Compareceu';
    if (value >= 0.25) return 'Agendado';
    return 'Faltou';
};

const AttendanceChart: React.FC<AttendanceChartProps> = ({ attendanceSeries, patients }) => {
    const patientIdsWithData = Object.keys(attendanceSeries);
    const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(patientIdsWithData[0]);

    useEffect(() => {
        if (!selectedPatientId && patientIdsWithData.length > 0) {
            setSelectedPatientId(patientIdsWithData[0]);
        }
    }, [patientIdsWithData, selectedPatientId]);

    const chartData = useMemo(() => {
        if (!selectedPatientId) return [];
        const series = attendanceSeries[selectedPatientId] || [];
        return series.map(point => ({
            date: new Date(point.date).toLocaleDateString('pt-BR'),
            status: statusLabelMap[point.status],
            value: statusValueMap[point.status],
        }));
    }, [attendanceSeries, selectedPatientId]);

    const patientOptions = useMemo(() => {
        return patients
            .filter(patient => attendanceSeries[patient.id])
            .map(patient => ({ value: patient.id, label: patient.name }));
    }, [attendanceSeries, patients]);

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">Gráfico de Assiduidade por Paciente</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Visualize o histórico recente de presença e faltas de cada paciente.
                    </p>
                </div>
                <div className="w-full md:w-64">
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                        <SelectContent>
                            {patientOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-slate-500">
                        {!selectedPatientId
                            ? 'Selecione um paciente para visualizar o gráfico.'
                            : 'Ainda não há dados suficientes de presença para esse paciente.'}
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis
                                    domain={[0, 1]}
                                    ticks={[0, 0.5, 1]}
                                    tickFormatter={value => valueToLabel(value as number)}
                                    fontSize={12}
                                />
                                <Tooltip
                                    formatter={(value: number) => valueToLabel(value)}
                                    labelFormatter={(label: string) => `Data: ${label}`}
                                />
                                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendanceChart;

