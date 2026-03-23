import { useGlobalState } from '../context/GlobalStateContext';

export const useTradingLogic = () => {
  const { positions, setPositions, balance, setBalance } = useGlobalState();

  /**
   * Opens a new trading position.
   * @param {object} params - The parameters for opening a position.
   * @param {'Long' | 'Short'} params.side - The side of the trade.
   * @param {string} params.symbol - The symbol of the asset.
   * @param {number} params.entryPrice - The price at which the position is opened.
   * @param {number} params.size - The size of the position.
   */
  const openPosition = ({ side, symbol, entryPrice, size }) => {
    const positionCost = Number(entryPrice) * Number(size);
    const newPosition = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      side,
      symbol,
      entryPrice: Number(entryPrice),
      size: Number(size),
      amount: positionCost,
    };
    setPositions(prevPositions => [...prevPositions, newPosition]);
  };

  /**
   * Closes an existing trading position.
   * @param {string} positionId - The ID of the position to close.
   * @param {number} currentPrice - The current market price at which the position is closed.
   */
  const closePosition = (positionId, currentPrice) => {
    setPositions(prev => prev.filter(p => {
      if (p.id !== positionId) return true;

      let pnl = 0;
      // Check if it's an Option (contains CALL/PUT in symbol)
      if (p.symbol.includes('CALL') || p.symbol.includes('PUT')) {
        const isCall = p.symbol.includes('CALL');
        // Simplified Option Exit: Difference in intrinsic value
        pnl = isCall ? (currentPrice - p.entryPrice) * p.size : (p.entryPrice - currentPrice) * p.size;
      } else {
        // Standard equity position logic
        pnl = p.side === 'Long' ? (currentPrice - p.entryPrice) * p.size : (p.entryPrice - currentPrice) * p.size;
      }

      setBalance(old => old + p.amount + pnl);
      return false;
    }));
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
