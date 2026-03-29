import React, { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';

const AuditLogs = () => {
  const [tab, setTab] = useState('history');
  const { tradeHistory, ledger } = useGlobalState();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col shadow-2xl">
      {/* Tab Headers */}
      <div className="flex bg-slate-900 border-b border-slate-800 text-[10px] font-bold">
        <button 
          onClick={() => setTab('history')} 
          className={`flex-1 p-3 transition-all ${tab === 'history' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-400'}`}
        >
          TRADE HISTORY
        </button>
        <button 
          onClick={() => setTab('ledger')} 
          className={`flex-1 p-3 transition-all ${tab === 'ledger' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-400'}`}
        >
          CASH LEDGER
        </button>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto p-4 max-h-[400px]">
        {tab === 'history' ? (
          // Trade History Tab
          <div>
            {tradeHistory.length > 0 ? (
              <table className="w-full text-[10px] text-left">
                <thead className="text-slate-500 font-bold uppercase border-b border-slate-800 mb-2 sticky top-0 bg-slate-900">
                  <tr>
                    <th className="py-2 px-1">Symbol</th>
                    <th className="py-2 px-1">Entry</th>
                    <th className="py-2 px-1">Exit</th>
                    <th className="py-2 px-1 text-right">P&L</th>
                    <th className="py-2 px-1 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tradeHistory.map(h => (
                    <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-1 text-white font-bold">{h.symbol}</td>
                      <td className="py-2 px-1 text-slate-400">${h.entryPrice?.toFixed(2) || 'N/A'}</td>
                      <td className="py-2 px-1 text-slate-400">${h.exitPrice?.toFixed(2) || 'N/A'}</td>
                      <td className={`py-2 px-1 text-right font-bold ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)}
                      </td>
                      <td className="py-2 px-1 text-slate-500 text-right">{h.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 text-xs italic">No trades yet.</p>
            )}
          </div>
        ) : (
          // Cash Ledger Tab
          <div>
            {ledger.length > 0 ? (
              <table className="w-full text-[10px] text-left">
                <thead className="text-slate-500 font-bold uppercase border-b border-slate-800 mb-2 sticky top-0 bg-slate-900">
                  <tr>
                    <th className="py-2 px-1">Type</th>
                    <th className="py-2 px-1">Symbol</th>
                    <th className="py-2 px-1 text-right">Amount</th>
                    <th className="py-2 px-1 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ledger.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-1">
                        <span className={`font-bold ${
                          l.type === 'INITIAL_DEPOSIT' ? 'text-blue-400' :
                          l.type === 'BUY_ORDER' ? 'text-red-400' :
                          l.type === 'SELL_ORDER' ? 'text-green-400' :
                          'text-slate-400'
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="py-2 px-1 text-slate-400">{l.symbol || '—'}</td>
                      <td className={`py-2 px-1 text-right font-mono ${l.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {l.amount >= 0 ? '+' : ''}{l.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-1 text-right text-slate-300 font-mono font-bold">${l.runningBalance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 text-xs italic">No transactions yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
