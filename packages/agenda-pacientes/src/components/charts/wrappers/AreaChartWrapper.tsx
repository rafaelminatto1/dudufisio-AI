import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';

interface AreaChartWrapperProps {
  data: any[];
  xKey: string;
  areas: Array<{
    dataKey: string;
    stroke?: string;
    fill?: string;
    name?: string;
    [key: string]: any;
  }>;
  height?: number;
  [key: string]: any;
}

export default function AreaChartWrapper({ data, xKey, areas, height = 300, ...props }: AreaChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} {...props}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {areas.map((area) => (
          <Area key={area.dataKey} {...area} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

