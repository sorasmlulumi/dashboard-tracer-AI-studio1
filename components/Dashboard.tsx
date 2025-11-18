
import React, { useState, useMemo } from 'react';
import { Finding } from '../types';
import Sidebar from './Sidebar';
import DataTable from './DataTable';
import StatusPieChart from './StatusPieChart';
import FindingsByDeptChart from './FindingsByDeptChart';
import GeminiChatbot from './GeminiChatbot';
import GeminiAnalysisModal from './GeminiAnalysisModal';
import AudioTranscriber from './AudioTranscriber';
import { MenuIcon, CloseIcon, SparklesIcon, VoiceChatIcon, SpeechToTextIcon, AnalysisIcon, LogoutIcon } from './icons';

interface DashboardProps {
  data: Finding[];
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [activeStandard, setActiveStandard] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isTranscriberOpen, setIsTranscriberOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const standards = useMemo(() => {
    const uniqueStandards = new Set(data.map(item => item.Standard).filter(Boolean));
    return ['All', ...Array.from(uniqueStandards)];
  }, [data]);

  const filteredData = useMemo(() => {
    let tempData = data;

    // Filter by standard
    if (activeStandard !== 'All') {
      tempData = tempData.filter(item => item.Standard === activeStandard);
    }

    // Filter by date range
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Adjust for timezone offset from UTC date that input type="date" might produce
        if (start) start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
        if (end) end.setMinutes(end.getMinutes() + end.getTimezoneOffset());

        if (end) end.setHours(23, 59, 59, 999); // Include the whole end day

        tempData = tempData.filter(item => {
            const tracerDateStr = item['Date Tracer'];
            if (!tracerDateStr) return false;
            
            // CSV date is M/D/YYYY
            const tracerDate = new Date(tracerDateStr);
            if (isNaN(tracerDate.getTime())) return false; // Invalid date in CSV

            const isAfterStart = start ? tracerDate >= start : true;
            const isBeforeEnd = end ? tracerDate <= end : true;

            return isAfterStart && isBeforeEnd;
        });
    }

    return tempData;
  }, [data, activeStandard, startDate, endDate]);
  
  const notMetCount = useMemo(() => filteredData.filter(d => d.Status === 'Not Met').length, [filteredData]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
      <Sidebar
        standards={standards}
        activeStandard={activeStandard}
        setActiveStandard={setActiveStandard}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center flex-shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden">
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white ml-2">{activeStandard}</h1>
          </div>
          <div className="flex items-center space-x-2 justify-end w-full sm:w-auto">
             <div className="flex items-center space-x-2 border-r border-gray-200 dark:border-slate-600 pr-2 mr-2">
                <label htmlFor="start-date" className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:block">From:</label>
                <input 
                    type="date" 
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md text-sm w-36 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Start Date"
                />
                <label htmlFor="end-date" className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:block">To:</label>
                <input 
                    type="date" 
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-1 border border-gray-300 rounded-md text-sm w-36 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    min={startDate}
                    aria-label="End Date"
                />
                {(startDate || endDate) && (
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" title="Clear date filter">
                        <CloseIcon className="h-4 w-4" />
                    </button>
                )}
             </div>
            <button onClick={onReset} className="flex items-center p-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600" title="Upload New File">
              <LogoutIcon className="h-5 w-5" />
              <span className="hidden sm:inline ml-1">New File</span>
            </button>
            <button onClick={() => setIsTranscriberOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600" title="Transcribe Audio">
              <SpeechToTextIcon className="h-5 w-5" />
            </button>
            <button onClick={() => setIsAnalysisOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600" title="Gemini Analysis">
              <AnalysisIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Findings</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{filteredData.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Standards</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{standards.length - 1}</p>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-red-500 dark:text-red-400 text-sm font-medium">Not Met</h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500">{notMetCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-green-500 dark:text-green-400 text-sm font-medium">Met / N/A</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">{filteredData.length - notMetCount}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Status Overview</h3>
                <StatusPieChart data={filteredData} />
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">'Not Met' Findings by Department</h3>
                <FindingsByDeptChart data={filteredData} />
             </div>
          </div>

          <DataTable findings={filteredData} />
        </main>
      </div>

       <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none"
        aria-label="Open AI Chatbot"
      >
        <VoiceChatIcon className="h-6 w-6" />
      </button>

      {isChatOpen && <GeminiChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} data={data} />}
      {isAnalysisOpen && <GeminiAnalysisModal isOpen={isAnalysisOpen} onClose={() => setIsAnalysisOpen(false)} data={filteredData} />}
      {isTranscriberOpen && <AudioTranscriber isOpen={isTranscriberOpen} onClose={() => setIsTranscriberOpen(false)} />}
    </div>
  );
};

export default Dashboard;
