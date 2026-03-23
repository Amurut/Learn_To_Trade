import React, { useState } from 'react';

const TabButton = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
      isActive
        ? 'border-blue-500 text-white bg-blue-500/10'
        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    {title}
  </button>
);

const EquitiesTab = ({ onOpenPosition, livePrice, symbols, selectedSymbol, onSymbolChange }) => {
  const [amount, setAmount] = useState('');

  const handleTrade = (side) => {
    if (amount > 0 && livePrice > 0) {
      onOpenPosition({ side, symbol: selectedSymbol, amount: parseFloat(amount) });
      setAmount('');
    } else {
      alert('Enter a valid amount and wait for price feed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Asset</label>
        <div className="grid grid-cols-2 gap-2">
          {symbols.map((s) => (
            <button
              key={s}
              onClick={() => onSymbolChange(s)}
              className={`py-2 px-3 rounded-md text-sm font-medium border transition-all ${
                selectedSymbol === s
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
        <p className="text-xs text-slate-500 mb-1">Market Price</p>
        <p className="text-3xl font-mono font-bold text-white">
          {livePrice > 0 ? `$${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'}
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Quantity / Size"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <div className="flex gap-3">
          <button
            onClick={() => handleTrade('Long')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-slate-950 font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-transform active:scale-95"
          >
            Buy / Long
          </button>
          <button
            onClick={() => handleTrade('Short')}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-transform active:scale-95"
          >
            Sell / Short
          </button>
        </div>
      </div>
    </div>
  );
};

const OptionsTab = ({ onOpenPosition, livePrice, selectedSymbol }) => {
  // Generate dynamic strikes based on current price
  const strikes = livePrice > 0 
    ? [0.98, 0.99, 1, 1.01, 1.02].map(m => livePrice * m)
    : [145, 150, 155, 160, 165];

  const handleOptionTrade = (side, type, strike) => {
    onOpenPosition({
      side,
      symbol: `${selectedSymbol} ${strike.toFixed(0)} ${type}`,
      amount: 1, // Default to 1 contract
      entryPrice: livePrice // Simplified premium logic
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-4">
        <p className="text-[11px] text-blue-300 leading-tight">
          <strong>Tip:</strong> Buy Calls if you expect prices to rise; Buy Puts if you expect them to fall. Theta represents time decay.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Call</th>
              <th className="px-2 py-3 text-center">Strike</th>
              <th className="px-4 py-3 text-right">Put</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {strikes.map((strike) => (
              <tr key={strike} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <button 
                    onClick={() => handleOptionTrade('Long', 'CALL', strike)}
                    className="text-green-400 hover:underline font-medium"
                  >
                    Buy (Δ 0.5)
                  </button>
                </td>
                <td className="px-2 py-3 text-center font-mono text-white bg-slate-900/50">
                  {strike.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => handleOptionTrade('Long', 'PUT', strike)}
                    className="text-red-400 hover:underline font-medium"
                  >
                    (Δ -0.4) Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CommoditiesTab = ({ onOpenPosition, livePrice }) => {
  const commodities = ['GOLD', 'SILVER', 'CRUDE OIL'];
  
  return (
    <div className="space-y-4">
       <p className="text-xs text-slate-500 italic">Commodity Futures simulation enabled.</p>
       <div className="grid gap-3">
         {commodities.map(c => (
           <div key={c} className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700">
             <span className="font-bold text-sm">{c}</span>
             <button 
               onClick={() => onOpenPosition({ side: 'Long', symbol: c, amount: 10 })}
               className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
             >
               Trade Future
             </button>
           </div>
         ))}
       </div>
    </div>
  );
};

const TradePanel = ({ onOpenPosition, livePrice, symbols, selectedSymbol, onSymbolChange }) => {
  const [activeTab, setActiveTab] = useState('Equities');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="flex bg-slate-900 border-b border-slate-800">
        {['Equities', 'Options', 'Commodities'].map((tab) => (
          <TabButton
            key={tab}
            title={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>
      <div className="p-5 flex-grow overflow-y-auto">
        {activeTab === 'Equities' && (
          <EquitiesTab 
            onOpenPosition={onOpenPosition} 
            livePrice={livePrice} 
            symbols={symbols}
            selectedSymbol={selectedSymbol}
            onSymbolChange={onSymbolChange}
          />
        )}
        {activeTab === 'Options' && (
          <OptionsTab 
            onOpenPosition={onOpenPosition} 
            livePrice={livePrice} 
            selectedSymbol={selectedSymbol}
          />
        )}
        {activeTab === 'Commodities' && (
          <CommoditiesTab onOpenPosition={onOpenPosition} livePrice={livePrice} />
        )}
      </div>
    </div>
  );
};

export default TradePanel;