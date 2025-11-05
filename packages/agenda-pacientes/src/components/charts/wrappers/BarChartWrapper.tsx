import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';

interface BarChartWrapperProps {
  data: any[];
  xKey: string;
  bars: Array<{
    dataKey: string;
    fill?: string;
    name?: string;
    [key: string]: any;
  }>;
  height?: number;
  [key: string]: any;
}

export default function BarChartWrapper({ data, xKey, bars, height = 300, ...props }: BarChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} {...props}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} {...bar} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

