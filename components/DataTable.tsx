
import React from 'react';
import { Finding } from '../types';

interface DataTableProps {
  findings: Finding[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Met':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Not Met':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'N/A':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const DataTable: React.FC<DataTableProps> = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500 dark:text-gray-400">No findings to display for this selection.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Finding Detail</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Tracer</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {findings.map((finding, index) => (
              <tr key={finding.IQA_ID || index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{finding.Department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(finding.Status)}`}>
                    {finding.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-md">{finding['Finding detail'] || finding['Finding']}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{finding['Date Tracer']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
