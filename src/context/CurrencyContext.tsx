
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'usd' | 'lkr' | 'eur';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getSymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencySymbols: Record<Currency, string> = {
    usd: '$',
    lkr: 'Rs ',
    eur: '€'
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('usd');

  const getSymbol = () => currencySymbols[currency];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
