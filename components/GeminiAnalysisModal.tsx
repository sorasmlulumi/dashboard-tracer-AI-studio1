
import React, { useState, useEffect } from 'react';
import { getAnalysis } from '../services/geminiService';
import { Finding } from '../types';
import { CloseIcon, SparklesIcon } from './icons';

interface GeminiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Finding[];
}

const GeminiAnalysisModal: React.FC<GeminiAnalysisModalProps> = ({ isOpen, onClose, data }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && data.length > 0) {
      const performAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        const result = await getAnalysis(data);
        setAnalysis(result);
        setIsLoading(false);
      };
      performAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, data]);

  if (!isOpen) return null;

  // Basic markdown to HTML renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements = lines.map((line, index) => {
      if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 dark:text-gray-200">{line.substring(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-4 mb-2 dark:text-gray-100">{line.substring(3)}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={index} className="font-bold my-1 dark:text-gray-300">{line.substring(2, line.length - 2)}</p>;
      if (line.startsWith('* ')) return <li key={index} className="ml-5 list-disc dark:text-gray-300">{line.substring(2)}</li>;
      return <p key={index} className="mb-2 dark:text-gray-300">{line}</p>;
    });
    return <>{elements}</>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold ml-2 dark:text-white">Gemini AI Analysis</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <SparklesIcon className="w-16 h-16 text-blue-500 animate-pulse" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing data with Gemini Pro...</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {renderMarkdown(analysis)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiAnalysisModal;
