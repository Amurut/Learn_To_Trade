import React, { createContext, useContext, useState } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [unrealizedPnl, setUnrealizedPnl] = useState(0);

  const value = {
    balance,
    setBalance,
    positions,
    setPositions,
    unrealizedPnl,
    setUnrealizedPnl,
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
