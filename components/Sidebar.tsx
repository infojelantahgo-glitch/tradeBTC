
import React from 'react';
import type { AnalysisConfig } from '../types';
import { AI_PROVIDERS, GEMINI_MODELS, DATA_VENDORS } from '../constants';
import { CogIcon, CubeIcon, BeakerIcon, CheckCircleIcon } from './icons';

interface SidebarProps {
  config: AnalysisConfig;
  setConfig: React.Dispatch<React.SetStateAction<AnalysisConfig>>;
}

const SelectInput = ({ label, value, onChange, options, id }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], id: string }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig }) => {
  const handleDataVendorChange = (vendor: keyof typeof config.dataVendors, value: string) => {
    setConfig(prev => ({
      ...prev,
      dataVendors: { ...prev.dataVendors, [vendor]: value }
    }));
  };

  return (
    <aside className="w-full lg:w-80 bg-gray-800/50 backdrop-blur-sm p-6 border-r border-gray-700/50 flex-shrink-0">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><CogIcon /> AI Configuration</h2>
          <div className="mt-4 space-y-4">
            <SelectInput id="ai-provider" label="AI Provider" value={config.aiProvider} onChange={(e) => setConfig(p => ({ ...p, aiProvider: e.target.value }))} options={AI_PROVIDERS} />
            <SelectInput id="ai-model" label="AI Model" value={config.aiModel} onChange={(e) => setConfig(p => ({ ...p, aiModel: e.target.value }))} options={GEMINI_MODELS} />
            <div className="bg-green-900/50 border border-green-700 text-green-300 text-xs rounded-md p-3 flex items-center gap-2">
              <CheckCircleIcon />
              <span>API Key is loaded automatically from your environment.</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><CubeIcon /> Data Vendors</h2>
          <div className="mt-4 space-y-4">
            <SelectInput id="core-stock-api" label="Core Stock API" value={config.dataVendors.coreStockApi} onChange={(e) => handleDataVendorChange('coreStockApi', e.target.value)} options={DATA_VENDORS.core} />
            <SelectInput id="technical-api" label="Technical Indicators" value={config.dataVendors.technicalIndicators} onChange={(e) => handleDataVendorChange('technicalIndicators', e.target.value)} options={DATA_VENDORS.technical} />
            <SelectInput id="fundamental-api" label="Fundamental Data" value={config.dataVendors.fundamentalData} onChange={(e) => handleDataVendorChange('fundamentalData', e.target.value)} options={DATA_VENDORS.fundamental} />
            <SelectInput id="news-api" label="News Data" value={config.dataVendors.newsData} onChange={(e) => handleDataVendorChange('newsData', e.target.value)} options={DATA_VENDORS.news} />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BeakerIcon /> AI Parameters</h2>
          <div className="mt-4 space-y-4">
            <div>
                <label htmlFor="debate-rounds" className="block text-sm font-medium text-gray-400 mb-1">Debate Rounds: {config.debateRounds}</label>
                <input
                    id="debate-rounds"
                    type="range"
                    min="1"
                    max="5"
                    value={config.debateRounds}
                    onChange={(e) => setConfig(p => ({...p, debateRounds: parseInt(e.target.value, 10)}))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
            <div className="flex items-center">
                <input
                    id="debug-mode"
                    type="checkbox"
                    checked={config.debugMode}
                    onChange={(e) => setConfig(p => ({...p, debugMode: e.target.checked}))}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-300">
                    Activate Debug Mode
                </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
