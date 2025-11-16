import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';

interface LineChartWrapperProps {
  data: any[];
  xKey: string;
  lines: Array<{
    dataKey: string;
    stroke?: string;
    name?: string;
    [key: string]: any;
  }>;
  height?: number;
  [key: string]: any;
}

export default function LineChartWrapper({ data, xKey, lines, height = 300, ...props }: LineChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} {...props}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line key={line.dataKey} {...line} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

