
import React from 'react';

export const Footer: React.FC = () => (
  <footer className="text-center mt-8 py-4">
    <p className="text-xs text-gray-500">
      &copy; {new Date().getFullYear()} Trading Agents Dashboard. This is not financial advice.
    </p>
  </footer>
);
