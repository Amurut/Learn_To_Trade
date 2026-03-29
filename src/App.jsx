import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import MarketOverview from './components/MarketOverview.jsx';
import TradePanel from './components/TradePanel.jsx';
import TradingViewChart from './components/TradingViewChart.jsx';
import GlossarySidebar from './components/GlossarySidebar.jsx';
import { useGlobalState } from './context/GlobalStateContext.jsx';
import { useTradingLogic } from './hooks/useTradingLogic.js';
import { MockDataEngine } from './utils/MockDataEngine.js';

function App() {
  const [view, setView] = useState('landing'); 
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const { balance, positions, unrealizedPnl, setUnrealizedPnl, portfolioValue, setPortfolioValue } = useGlobalState();
  const { openPosition, closePosition } = useTradingLogic();
  const [marketState, setMarketState] = useState({});
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = new MockDataEngine();
    engineRef.current.subscribe((allData) => {
      // FIX: Force React to see a new object reference every 2 seconds
      setMarketState({ ...allData });
    });
    engineRef.current.start();
    return () => engineRef.current?.stop();
  }, []);

  // Sync PNL with live prices and calculate portfolio value
  useEffect(() => {
    // 1. Calculate total unrealized PNL for all open positions
    const totalPnl = positions.reduce((acc, pos) => {
      const symbolKey = pos.symbol.split(' ')[0];
      const data = marketState[symbolKey];
      if (!data || data.length === 0) return acc;
      
      const price = data[data.length - 1].close;
      const diff = pos.side === 'Long' ? (price - pos.entryPrice) : (pos.entryPrice - price);
      return acc + (diff * pos.size);
    }, 0);

    setUnrealizedPnl(totalPnl);
    
    // 2. Calculate current market value of all positions (only active non-closed positions)
    const currentMarketValue = positions.reduce((acc, pos) => {
      const symbolKey = pos.symbol.split(' ')[0];
      const data = marketState[symbolKey];
      if (!data || data.length === 0) return acc;
      
      const marketPrice = data[data.length - 1].close;
      
      if (pos.side === 'Long') {
        // For Long: market value = current market price * size
        // This represents what the position is worth in the market RIGHT NOW
        return acc + (marketPrice * pos.size);
      } else {
        // For Short: market value = what we owe - current debt
        // Short math: if we shorted at $100 and price is now $90, we profit $10
        // Market value of our obligation = entry price * size - (current price - entry) * size
        // Which simplifies to: entry * size - current * size + entry * size = (entry - current) * size + entry * size
        // Actually simpler: our liability is the current price * size, our credit is entry price * size
        // Net position value = entry * size - current * size = (entry - current) * size
        const pnl = (pos.entryPrice - marketPrice) * pos.size;
        return acc + pnl; // Only count the PNL for shorts, not the capital
      }
    }, 0);

    // 3. Portfolio Value = Cash Balance + Current Market Value of Holdings
    // This ensures: closing a position immediately credits the cash and removes it from portfolio
    setPortfolioValue(balance + currentMarketValue);
  }, [marketState, positions, balance, setUnrealizedPnl, setPortfolioValue]);

  const handleOpenPosition = ({ symbol, side, amount }) => {
    const targetSymbol = symbol || selectedSymbol;
    const assetKey = targetSymbol.split(' ')[0];
    const assetData = marketState[assetKey];
    const currentPrice = Array.isArray(assetData)
      ? assetData[assetData.length - 1]?.close
      : 0;

    if (currentPrice > 0) {
      openPosition({
        side,
        symbol: targetSymbol,
        entryPrice: currentPrice,
        size: parseFloat(amount),
      });
    } else {
      alert('Market data unavailable. Please wait for the price feed.');
    }
  };

  const selectedChartData = useMemo(() => marketState[selectedSymbol] || [], [marketState, selectedSymbol]);
  const livePrice = selectedChartData.length > 0 ? selectedChartData[selectedChartData.length - 1].close : 0;

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-2xl">
        <h1 onClick={() => setView('landing')} className="text-xl font-bold cursor-pointer">
          TradeLearner <span className="text-blue-500 text-sm">PRO</span>
        </h1>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4 md:gap-8">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Portfolio Value</p>
            <p className="text-white font-mono font-bold text-sm sm:text-lg">${portfolioValue.toFixed(2)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Available Cash</p>
            <p className="text-green-400 font-mono font-bold text-sm sm:text-lg">${balance.toFixed(2)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total PNL</p>
            <p className={`font-mono font-bold text-sm sm:text-lg ${unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
            </p>
          </div>
          <button onClick={() => setIsGlossaryOpen(true)} className="bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold">
            GLOSSARY
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 container mx-auto custom-scrollbar">
        {view === 'landing' ? (
          <MarketOverview 
            marketState={marketState} 
            onSelectAsset={(s) => { setSelectedSymbol(s); setView('terminal'); }} 
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="w-full lg:w-2/3 flex flex-col min-h-[400px] lg:h-full">
              <div className="mb-2 flex justify-between items-center">
                <button onClick={() => setView('landing')} className="text-blue-400 text-sm font-bold">← BACK</button>
                <h2 className="text-lg font-bold">{selectedSymbol}</h2>
              </div>
              <TradingViewChart data={selectedChartData} symbol={selectedSymbol} />
            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-6 h-full">
              <TradePanel 
                symbols={Object.keys(marketState)} 
                selectedSymbol={selectedSymbol} 
                onSymbolChange={setSelectedSymbol} 
                onOpenPosition={handleOpenPosition}
                livePrice={livePrice} 
              />

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 min-h-[300px] lg:flex-grow overflow-hidden">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Active Positions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 font-bold uppercase border-b border-slate-800">
                      <tr>
                        <th className="px-2 py-2">Asset</th>
                        <th className="px-2 py-2">Side</th>
                        <th className="px-2 py-2">Size</th>
                        <th className="px-2 py-2">PNL</th>
                        <th className="px-2 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.length > 0 ? positions.map(p => {
                        const assetKey = p.symbol.split(' ')[0];
                        const assetData = marketState[assetKey] || [];
                        const currentPrice = assetData.length > 0 ? assetData[assetData.length - 1].close : livePrice;
                        const pnl = p.side === 'Long' ? (currentPrice - p.entryPrice) * p.size : (p.entryPrice - currentPrice) * p.size;
                        return (
                          <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800">
                            <td className="px-2 py-2">{p.symbol}</td>
                            <td className="px-2 py-2">{p.side}</td>
                            <td className="px-2 py-2">{p.size}</td>
                            <td className={`px-2 py-2 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</td>
                            <td className="px-2 py-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closePosition(p.id, currentPrice);
                                }} 
                                className="text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2 py-1 rounded"
                              >
                                EXIT
                              </button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="5" className="text-center py-4 text-slate-500">No active positions.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <GlossarySidebar isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}

export default App;