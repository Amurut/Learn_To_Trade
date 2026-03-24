export class MockDataEngine {
  constructor() {
    this.symbols = [
      'BTC/USD', 'ETH/USD', 'SOL/USD', 
      'AAPL', 'TSLA', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META',
      'GOLD', 'SILVER', 'CRUDE OIL', 'COPPER', 'NAT GAS'
    ];
    this.marketData = {};
    this.subscribers = [];
    this.intervalId = null;
    this.tickCount = 0;

    this.symbols.forEach(symbol => {
      this.marketData[symbol] = this.generateHistory(symbol);
    });
  }

  generateHistory(symbol) {
    const data = [];
    let price = 150; 
    if (symbol.includes('BTC')) price = 65000;
    else if (symbol.includes('ETH')) price = 3500;
    else if (symbol === 'GOLD') price = 2100;
    else if (symbol === 'CRUDE OIL') price = 80;
    else if (symbol === 'TSLA') price = 245;

    // FIX: Start history 200 minutes ago so the 100th bar ends 100 minutes ago.
    // This leaves plenty of "room" for the live feed to start.
    let startTime = Math.floor(Date.now() / 1000) - 200 * 60;

    for (let i = 0; i < 100; i++) {
      const open = price;
      const volatility = price * 0.01;
      const close = open + (Math.random() - 0.5) * volatility;
      data.push({
        time: startTime + i * 60,
        open,
        high: Math.max(open, close) + Math.random() * (volatility * 0.5),
        low: Math.min(open, close) - Math.random() * (volatility * 0.5),
        close
      });
      price = close;
    }
    return data;
  }

  start() {
    this.intervalId = setInterval(() => {
      this.tickCount++;
      this.symbols.forEach(symbol => {
        const history = this.marketData[symbol];
        const lastBar = history[history.length - 1];
        const volatility = lastBar.close * 0.002;
        const nextPrice = lastBar.close + (Math.random() - 0.5) * volatility;
        
        // FIX: Ensure the new bar time is strictly increasing.
        // We use the tickCount to move forward by 60 seconds every time.
        const newBar = {
          time: lastBar.time + 60,
          open: lastBar.close,
          high: Math.max(lastBar.close, nextPrice) + Math.random() * (volatility * 0.2),
          low: Math.min(lastBar.close, nextPrice) - Math.random() * (volatility * 0.2),
          close: nextPrice
        };
        
        // Use a new array reference to ensure React sees the change
        this.marketData[symbol] = [...history, newBar];
      });
      this.subscribers.forEach(cb => cb({ ...this.marketData }));
    }, 2000);
  }

  stop() { 
    if (this.intervalId) clearInterval(this.intervalId); 
  }

  subscribe(callback) { 
    this.subscribers.push(callback); 
  }
}