
import React, { useState, useCallback } from 'react';
import { Finding } from '../types';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onDataLoaded: (data: Finding[]) => void;
}

// Robust CSV parser to handle quoted fields, including newlines within them.
const parseCSV = (csvText: string): Finding[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''));

  // Regex to split CSV row, handling quoted fields
  const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;

  return lines.slice(1).map(line => {
    const row: { [key: string]: string } = {};
    let match;
    let headerIndex = 0;
    
    regex.lastIndex = 0;
    
    while ((match = regex.exec(line)) && headerIndex < headers.length) {
      let value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      const header = headers[headerIndex] || `column_${headerIndex}`;
      row[header] = value ? value.trim() : '';
      headerIndex++;
      if (match.index + match[0].length >= line.length) break;
    }
    return row as unknown as Finding;
  });
};


const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsedData = parseCSV(text);
          onDataLoaded(parsedData);
        } catch (error) {
          console.error("Error parsing CSV:", error);
          onDataLoaded([]); // send empty array on error
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file");
        onDataLoaded([]);
        setIsLoading(false);
      };
      reader.readAsText(file, 'UTF-8');
    }
  }, [onDataLoaded]);

  return (
    <div className="w-full max-w-lg">
        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-12 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300">
            <div className="flex flex-col items-center">
                <UploadIcon className="w-12 h-12 text-gray-400" />
                <span className="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">{isLoading ? "Processing..." : "Click to upload a file"}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">CSV only</span>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} disabled={isLoading} />
        </label>
        {isLoading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse"></div>
            </div>
        )}
    </div>
  );
};

export default FileUpload;
