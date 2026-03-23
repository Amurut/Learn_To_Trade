import React from 'react';

const MarketOverview = ({ marketState, onSelectAsset }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {Object.entries(marketState).map(([symbol, data]) => {
        const history = Array.isArray(data) ? data : [];
        const latestPrice = history.length > 0 ? history[history.length - 1].close : 0;
        const prevPrice = history.length > 1 ? history[history.length - 2].close : latestPrice;
        const isUp = latestPrice >= prevPrice;
        const priceChange = ((latestPrice - prevPrice) / prevPrice * 100).toFixed(2);

        return (
          <div 
            key={symbol}
            onClick={() => onSelectAsset(symbol)}
            className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{symbol}</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Market Feed</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {isUp ? '▲' : '▼'} LIVE
              </span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-mono font-bold text-white">
                  ${latestPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm font-bold mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{priceChange}%
                </p>
              </div>
              {/* Mini-chart representation */}
              <div className="w-24 h-10">
                <div className={`h-full w-full bg-gradient-to-t ${isUp ? 'from-green-500/20 to-green-500/5' : 'from-red-500/20 to-red-500/5'} rounded-lg`}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketOverview;
