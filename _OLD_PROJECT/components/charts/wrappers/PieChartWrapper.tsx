import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from '@/components/charts/ChartsLazyOptimized';

interface PieChartWrapperProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  dataKey: string;
  colors?: string[];
  height?: number;
  [key: string]: any;
}

export default function PieChartWrapper({ 
  data, 
  dataKey = 'value', 
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
  height = 300,
  ...props 
}: PieChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart {...props}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

