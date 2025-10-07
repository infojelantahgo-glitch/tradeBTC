import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import type { AnalysisConfig, AnalysisResult } from './types';
import { runAnalysis } from './services/geminiService';
import { getCurrentPrice } from './services/dataVendorService';
import { DEFAULT_CONFIG } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

interface PriceData {
  price: number;
  isRealTime: boolean;
}

const App: React.FC = () => {
  const [config, setConfig] = useState<AnalysisConfig>(DEFAULT_CONFIG);
  const [symbol, setSymbol] = useState<string>('BTC-USD');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);

  const handleRunAnalysis = useCallback(async () => {
    if (!symbol) {
      setError('Please enter a stock symbol.');
      return;
    }
    if (!process.env.API_KEY) {
        setError("API Key not found. Please ensure it's configured in your environment variables.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentPrice(null);

    try {
      const priceData = await getCurrentPrice(symbol);
      setCurrentPrice(priceData);
      const analysisResult = await runAnalysis(symbol, date, config, priceData.price);
      setResult(analysisResult);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(`An error occurred: ${e.message}`);
      } else {
        setError('An unknown error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, date, config]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar config={config} setConfig={setConfig} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
          <Header />
          <div className="flex-grow">
            <MainContent
              symbol={symbol}
              setSymbol={setSymbol}
              date={date}
              setDate={setDate}
              isLoading={isLoading}
              error={error}
              result={result}
              currentPrice={currentPrice}
              onRunAnalysis={handleRunAnalysis}
            />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
