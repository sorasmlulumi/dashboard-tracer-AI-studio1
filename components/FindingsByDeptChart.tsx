import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Finding } from '../types';

interface FindingsByDeptChartProps {
  data: Finding[];
}

const FindingsByDeptChart: React.FC<FindingsByDeptChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const deptCounts = data
      .filter(finding => finding.Status === 'Not Met')
      .reduce((acc, finding) => {
        const dept = finding.Department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(deptCounts)
      .map(([name, count]) => ({ name, 'Not Met': count }))
      // FIX: Corrected the explicit type for the sort callback arguments to match the object shape and resolve type conflicts.
      .sort((a: { name: string; 'Not Met': any }, b: { name: string; 'Not Met': any }) => b['Not Met'] - a['Not Met']);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
        <XAxis 
            dataKey="name" 
            angle={-20} 
            textAnchor="end" 
            height={60} 
            tick={{ fontSize: 10, fill: 'rgb(156 163 175)' }} 
            interval={0}
        />
        <YAxis tick={{ fontSize: 12, fill: 'rgb(156 163 175)' }}/>
        <Tooltip
            contentStyle={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                borderColor: '#475569',
                borderRadius: '0.5rem',
            }}
             itemStyle={{ color: '#E2E8F0' }}
        />
        <Legend />
        <Bar dataKey="Not Met" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FindingsByDeptChart;