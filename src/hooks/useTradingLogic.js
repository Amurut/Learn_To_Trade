import { useGlobalState } from '../context/GlobalStateContext';

export const useTradingLogic = () => {
  const { positions, setPositions, balance, setBalance, tradeHistory, setTradeHistory } = useGlobalState();

  /**
   * Opens a new trading position.
   * @param {object} params - The parameters for opening a position.
   * @param {'Long' | 'Short'} params.side - The side of the trade.
   * @param {string} params.symbol - The symbol of the asset.
   * @param {number} params.entryPrice - The price at which the position is opened.
   * @param {number} params.size - The size of the position.
   */
  const openPosition = ({ side, symbol, entryPrice, size }) => {
    const cost = Number(entryPrice) * Number(size);
    
    // Check if sufficient cash is available
    if (balance < cost) {
      alert('Insufficient Cash Balance');
      return;
    }
    
    // 1. Deduct the full cost from cash (this is "locked" capital)
    setBalance(prev => prev - cost);
    
    // 2. Store the position with its cost for audit trail
    const newPosition = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      side,
      symbol,
      entryPrice: Number(entryPrice),
      size: Number(size),
      cost: cost, // Store cost for audit log
    };
    setPositions(prevPositions => [...prevPositions, newPosition]);
  };

  /**
   * Closes an existing trading position with Net-Zero accounting.
   * @param {string} positionId - The ID of the position to close.
   * @param {number} currentMarketPrice - The current market price at which the position is closed.
   */
  const closePosition = (positionId, currentMarketPrice) => {
    // 1. Find the position first (outside of setState to prevent double-execution)
    const positionToClose = positions.find(p => p.id === positionId);
    if (!positionToClose) return; // Guard: position must exist

    // 2. Calculate the PNL (profit or loss)
    const isLong = positionToClose.side === 'Long';
    const pnl = isLong
      ? (currentMarketPrice - positionToClose.entryPrice) * positionToClose.size
      : (positionToClose.entryPrice - currentMarketPrice) * positionToClose.size;

    // 3. Calculate return amount (original capital + PNL)
    const initialCapital = positionToClose.entryPrice * positionToClose.size;
    const finalReturn = initialCapital + pnl;

    // 4. FIRST: Remove position from active list (prevents double-close)
    setPositions(prev => prev.filter(p => p.id !== positionId));

    // 5. THEN: Restore capital to balance
    setBalance(oldBalance => {
      const newBalance = oldBalance + finalReturn;
      console.log(`[LEDGER] Close ${positionToClose.symbol}: Cost=$${initialCapital.toFixed(2)} + PNL=$${pnl.toFixed(2)} = Return=$${finalReturn.toFixed(2)} | Old Balance=$${oldBalance.toFixed(2)} → New=$${newBalance.toFixed(2)}`);
      return newBalance;
    });

    // 6. FINALLY: Record to Trade History for audit trail
    setTradeHistory(prevH => [{
      id: `trade-${Date.now()}`,
      symbol: positionToClose.symbol,
      side: positionToClose.side,
      entryPrice: positionToClose.entryPrice,
      exitPrice: currentMarketPrice,
      size: positionToClose.size,
      cost: initialCapital,
      pnl: pnl,
      finalReturn: finalReturn,
      timestamp: new Date().toISOString(),
    }, ...prevH]);
  };

  // The unrealized PnL is the profit or loss that is currently held in open positions.
  // It is the amount of money that an investor would gain or lose if they were to close all their open positions at the current market price.
  // To calculate it, you would need a feed of current prices.
  //
  // For example, you could have a function `updateUnrealizedPnl(currentPrices)`
  // that iterates through open positions and calculates the PnL for each based on the live price,
  // then sums it up and updates the 'unrealizedPnl' state in the GlobalStateContext.
  //
  // const { setUnrealizedPnl } = useGlobalState();
  // const updateUnrealizedPnl = (currentPrices) => {
  //   let pnl = 0;
  //   positions.forEach(position => {
  //     const currentPrice = currentPrices[position.symbol];
  //     if (currentPrice) {
  //       if (position.side === 'Long') {
  //         pnl += (currentPrice - position.entryPrice) * position.size;
  //       } else { // 'Short'
  //         pnl += (position.entryPrice - currentPrice) * position.size;
  //       }
  //     }
  //   });
  //   setUnrealizedPnl(pnl);
  // }

  return { openPosition, closePosition };
};
