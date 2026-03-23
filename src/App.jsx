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
  const { balance, positions, unrealizedPnl, setUnrealizedPnl } = useGlobalState();
  const { openPosition, closePosition } = useTradingLogic();
  const [marketState, setMarketState] = useState({});
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = new MockDataEngine();
    engineRef.current.subscribe(setMarketState);
    engineRef.current.start();
    return () => engineRef.current?.stop();
  }, []);

  // Sync PNL with live prices
  useEffect(() => {
    const totalPnl = positions.reduce((acc, pos) => {
      const symbolKey = pos.symbol.split(' ')[0]; // Handle "BTC CALL" → "BTC"
      const data = marketState[symbolKey];
      const price = data?.[data.length - 1]?.close || 0;
      const diff = pos.side === 'Long' ? (price - pos.entryPrice) : (pos.entryPrice - price);
      return acc + (diff * pos.size);
    }, 0);
    setUnrealizedPnl(totalPnl);
  }, [marketState, positions, setUnrealizedPnl]);

  const selectedChartData = useMemo(() => marketState[selectedSymbol] || [], [marketState, selectedSymbol]);
  const livePrice = selectedChartData.length > 0 ? selectedChartData[selectedChartData.length - 1].close : 0;

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-2xl">
        <h1 
          onClick={() => setView('landing')} 
          className="text-xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
        >
          TradeLearner <span className="text-blue-500 text-sm">PRO</span>
        </h1>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">Balance</p>
            <p className="text-green-400 font-mono font-bold">${balance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">Total PNL</p>
            <p className={`font-mono font-bold ${unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
            </p>
          </div>
          <button 
            onClick={() => setIsGlossaryOpen(true)} 
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            GLOSSARY
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto custom-scrollbar">
        {view === 'landing' ? (
          <div className="container mx-auto py-10 px-4">
            <h2 className="text-4xl font-black mb-2 italic">MARKET DASHBOARD</h2>
            <p className="text-slate-500 mb-10">Select an asset to enter the execution terminal.</p>
            <MarketOverview 
              marketState={marketState} 
              onSelectAsset={(s) => { 
                setSelectedSymbol(s); 
                setView('terminal'); 
              }} 
            />
          </div>
        ) : (
          <div className="container mx-auto p-4 grid grid-cols-12 gap-6 h-full overflow-hidden">
            <div className="col-span-12 flex items-center justify-between mb-2">
              <button 
                onClick={() => setView('landing')} 
                className="text-blue-400 hover:text-white transition-colors text-sm font-semibold"
              >
                ← Back to Dashboard
              </button>
              <h2 className="text-xl font-bold">{selectedSymbol} Terminal</h2>
              <div className="w-32"></div>
            </div>

            <div className="col-span-12 lg:col-span-8 overflow-hidden">
              <TradingViewChart data={selectedChartData} symbol={selectedSymbol} />
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
              <TradePanel 
                symbols={Object.keys(marketState)} 
                selectedSymbol={selectedSymbol} 
                onSymbolChange={setSelectedSymbol} 
                onOpenPosition={({side, amount}) => openPosition({
                  side, 
                  symbol: selectedSymbol, 
                  entryPrice: livePrice, 
                  size: amount
                })}
                livePrice={livePrice} 
              />

              {/* Simplified Positions List */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex-grow overflow-y-auto shadow-xl">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Active Positions ({positions.length})</h3>
                {positions.length > 0 ? (
                  positions.map(p => {
                    const assetData = marketState[p.symbol];
                    const currentPrice = Array.isArray(assetData) ? assetData[assetData.length - 1].close : livePrice;
                    const pnl = p.side === 'Long' 
                      ? (currentPrice - p.entryPrice) * p.size 
                      : (p.entryPrice - currentPrice) * p.size;
                    
                    return (
                      <div 
                        key={p.id} 
                        className="flex justify-between items-center mb-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{p.symbol}</p>
                          <p className="text-xs text-slate-500">
                            {p.side === 'Long' ? '📈' : '📉'} {p.side} • Entry: ${p.entryPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right mr-3">
                          <p className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </p>
                        </div>
                        <button 
                          onClick={() => closePosition(p.id, currentPrice)} 
                          className="text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded font-bold transition-colors"
                        >
                          EXIT
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-slate-500 text-sm italic">No active positions. Open a trade to get started.</p>
                )}
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
