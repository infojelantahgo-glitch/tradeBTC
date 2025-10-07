
import React from 'react';
import { BotIcon } from './icons';

export const Header: React.FC = () => (
  <header className="mb-6">
    <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
        <BotIcon />
        Trading Agents Dashboard
    </h1>
    <p className="text-gray-400 mt-1">AI-powered analysis — fundamentals, technicals, and news sentiment.</p>
  </header>
);
