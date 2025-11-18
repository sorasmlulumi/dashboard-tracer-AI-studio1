
import React from 'react';
import { SparklesIcon, CloseIcon } from './icons';

interface SidebarProps {
  standards: string[];
  activeStandard: string;
  setActiveStandard: (standard: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ standards, activeStandard, setActiveStandard, isOpen, setIsOpen }) => {
  
  const handleItemClick = (standard: string) => {
    setActiveStandard(standard);
    if (window.innerWidth < 1024) { // Close sidebar on mobile after selection
      setIsOpen(false);
    }
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-white text-lg font-bold ml-2">Tracer AI</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-4 flex-1 px-2 space-y-1">
        <p className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Standards</p>
        {standards.map((standard) => (
          <a
            key={standard}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(standard);
            }}
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeStandard === standard
                ? 'bg-slate-900 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {standard}
          </a>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden transition-opacity ease-in-out duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
          <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-slate-800 transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              {sidebarContent}
          </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-slate-800">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
