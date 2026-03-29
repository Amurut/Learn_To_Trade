import React, { createContext, useContext, useState } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [balance, setBalance] = useState(10000);
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [unrealizedPnl, setUnrealizedPnl] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [ledger, setLedger] = useState([
    { id: 1, type: 'INITIAL_DEPOSIT', amount: 10000, runningBalance: 10000, time: new Date().toLocaleTimeString() }
  ]);

  const value = {
    balance,
    setBalance,
    portfolioValue,
    setPortfolioValue,
    positions,
    setPositions,
    unrealizedPnl,
    setUnrealizedPnl,
    tradeHistory,
    setTradeHistory,
    ledger,
    setLedger,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
