import React, { useState } from 'react';
import type { AnalysisResult, TradingPlan } from '../types';
import { ChartBarIcon, CalendarIcon, RocketIcon, ZapIcon } from './icons';
import { executeTrade } from '../services/brokerService';
import { SUPPORTED_ASSETS } from '../constants';

interface PriceData {
  price: number;
  isRealTime: boolean;
}

interface MainContentProps {
  symbol: string;
  setSymbol: (s: string) => void;
  date: string;
  setDate: (d: string) => void;
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  currentPrice: PriceData | null;
  onRunAnalysis: () => void;
}

const ResultCard = ({ title, rating, summary }: { title: string, rating: string, summary: string }) => {
    const getRatingColor = (r: string) => {
        const lowerR = r.toLowerCase();
        if (lowerR.includes('buy') || lowerR.includes('positive')) return 'text-green-400';
        if (lowerR.includes('sell') || lowerR.includes('negative')) return 'text-red-400';
        return 'text-yellow-400';
    }

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-300">{title}</h4>
            <p className={`text-lg font-bold ${getRatingColor(rating)}`}>{rating}</p>
            <p className="text-sm text-gray-400 mt-2">{summary}</p>
        </div>
    );
};

const TradingPlanCard = ({ plan, symbol }: { plan: TradingPlan, symbol: string }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{success: boolean, message: string} | null>(null);

  if (!plan) return null;

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    const result = await executeTrade(plan, symbol);
    setExecutionResult(result);
    setIsExecuting(false);
  };

  const renderListItem = (text: string) => (
    <ul className="list-none space-y-1">
      {(text || '').split('•').filter(item => item.trim()).map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1"> • </span>
          <span>{item.trim()}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-gray-800/60 border border-cyan-700/50 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">📋 Rencana Perdagangan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="text-gray-400 font-semibold">🎯 Sinyal</p>
          <p className="text-lg font-bold text-cyan-400">{plan.signal}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg col-span-1 sm:col-span-2 md:col-span-1">
          <p className="text-gray-400 font-semibold">💰 Harga Masuk</p>
          <p className="text-lg font-bold text-white">{plan.entry_price}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="text-gray-400 font-semibold">🛡️ Stop Loss</p>
          <p className="text-lg font-bold text-red-400">{plan.stop_loss}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="text-gray-400 font-semibold">🎯 Take Profit 1</p>
          <p className="text-lg font-bold text-green-400">{plan.take_profit_1}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="text-gray-400 font-semibold">🎯 Take Profit 2</p>
          <p className="text-lg font-bold text-green-400">{plan.take_profit_2}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="text-gray-400 font-semibold">📈 Risiko/Imbalan</p>
          <p className="text-lg font-bold text-white">{plan.risk_reward_ratio}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="text-gray-400 font-semibold">📊 Skor</p>
          <p className="text-lg font-bold text-white">{plan.score}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg col-span-1 sm:col-span-2 md:col-span-1">
          <p className="text-gray-400 font-semibold">⚡ Tingkat Kemenangan</p>
          <p className="text-lg font-bold text-white">{plan.win_rate}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg sm:col-span-2 md:col-span-3">
            <p className="text-gray-400 font-semibold mb-2">💡 Aksi</p>
            <p className="text-lg font-bold text-yellow-400">{plan.action}</p>
        </div>

        <div className="sm:col-span-2 md:col-span-3 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">✅ Alasan</h4>
              <div className="text-gray-400">{renderListItem(plan.reasons)}</div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">⚠️ Risiko</h4>
              <div className="text-gray-400">{renderListItem(plan.risks)}</div>
            </div>
        </div>

        <div className="sm:col-span-2 md:col-span-3 mt-4">
            <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-indigo-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isExecuting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Menghubungkan ke Pialang...
                    </>
                ) : (
                    <><ZapIcon /> Eksekusi Rencana (Simulasi)</>
                )}
            </button>
            {executionResult && (
                <div className={`mt-4 text-center text-sm p-3 rounded-lg ${executionResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {executionResult.message}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};


export const MainContent: React.FC<MainContentProps> = ({ symbol, setSymbol, date, setDate, isLoading, error, result, currentPrice, onRunAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="symbol-select" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1"><ChartBarIcon /> Pilih Aset Kripto</label>
            <select
              id="symbol-select"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                {SUPPORTED_ASSETS.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                        {asset.name} ({asset.symbol})
                    </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="date-input" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1"><CalendarIcon /> Tanggal Analisis</label>
            <input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
             <label className="text-sm font-medium text-gray-400 mb-1 block">&nbsp;</label>
            <button
              onClick={onRunAnalysis}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menganalisis...
                </>
              ) : (
                <><RocketIcon /> Jalankan Analisis AI</>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}
        {result && (
          <div className="space-y-6">
            <div className="bg-gray-800/60 border border-gray-700/50 p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-white mb-2">Keputusan AI: <span className="text-cyan-400">{result.final_decision}</span></h3>
                {currentPrice !== null && (
                    <div className="text-lg mb-4 flex items-center gap-3">
                        <span className="text-gray-400">Harga Saat Ini: </span>
                        <span className="font-bold text-white">${currentPrice.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                )}
                <p className="text-gray-300">{result.justification}</p>
            </div>
            {result.trading_plan && <TradingPlanCard plan={result.trading_plan} symbol={symbol} />}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ResultCard title="Analisis Fundamental" rating={result.source_reports.fundamental_analysis.rating} summary={result.source_reports.fundamental_analysis.analysis_summary} />
                <ResultCard title="Analisis Teknis" rating={result.source_reports.technical_analysis.rating} summary={result.source_reports.technical_analysis.analysis_summary} />
                <ResultCard title="Analisis Sentimen Berita" rating={result.source_reports.sentiment_analysis.rating} summary={result.source_reports.sentiment_analysis.analysis_summary} />
            </div>
          </div>
        )}
         {!isLoading && !result && !error && (
            <div className="text-center py-12 text-gray-500">
                <p>Pilih aset kripto dan klik "Jalankan Analisis AI" untuk memulai.</p>
            </div>
        )}
      </div>
    </div>
  );
};