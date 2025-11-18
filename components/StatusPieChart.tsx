
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Finding } from '../types';

interface StatusPieChartProps {
  data: Finding[];
}

const COLORS = {
  'Met': '#10B981',       // Green-500
  'Not Met': '#EF4444',  // Red-500
  'N/A': '#6B7280',      // Gray-500
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const statusCounts = data.reduce((acc, finding) => {
      const status = finding.Status || 'N/A';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#A0AEC0'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.9)', 
            borderColor: '#475569',
            borderRadius: '0.5rem',
          }}
          itemStyle={{ color: '#E2E8F0' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;
