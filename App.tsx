
import React, { useState } from 'react';
import { Finding } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [data, setData] = useState<Finding[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = (parsedData: Finding[]) => {
    if (parsedData.length > 0) {
      setData(parsedData);
      setError(null);
    } else {
      setError("Failed to parse CSV or the file is empty. Please check the file format and content.");
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      {data ? (
        <Dashboard data={data} onReset={handleReset} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <SparklesIcon className="w-12 h-12 text-blue-500" />
                    <h1 className="text-4xl font-bold ml-2 bg-gradient-to-r from-blue-500 to-teal-400 text-transparent bg-clip-text">Tracer Intelligence Dashboard</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Upload your compliance tracer CSV to begin analysis.</p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} />
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default App;
