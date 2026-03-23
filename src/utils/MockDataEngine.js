export class MockDataEngine {
  constructor() {
    this.symbols = [
      'BTC/USD', 'ETH/USD', 'SOL/USD', // Crypto
      'AAPL', 'TSLA', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', // Stocks
      'GOLD', 'SILVER', 'CRUDE OIL', 'COPPER', 'NAT GAS' // Commodities
    ];
    this.marketData = {};
    this.subscribers = [];
    this.intervalId = null;

    this.symbols.forEach(symbol => {
      this.marketData[symbol] = this.generateHistory(symbol);
    });
  }

  generateHistory(symbol) {
    const data = [];
    // Set realistic base prices based on asset type
    let price = 150; 
    if (symbol.includes('BTC')) price = 65000;
    else if (symbol.includes('ETH')) price = 3500;
    else if (symbol === 'GOLD') price = 2100;
    else if (symbol === 'CRUDE OIL') price = 80;
    else if (symbol === 'SILVER') price = 28;
    else if (symbol === 'COPPER') price = 4.5;
    else if (symbol === 'NAT GAS') price = 3.2;
    else if (symbol === 'SOL') price = 210;
    else if (symbol === 'AAPL') price = 185;
    else if (symbol === 'TSLA') price = 245;
    else if (symbol === 'MSFT') price = 425;
    else if (symbol === 'NVDA') price = 875;
    else if (symbol === 'GOOGL') price = 155;
    else if (symbol === 'AMZN') price = 195;
    else if (symbol === 'META') price = 485;

    let time = Math.floor(Date.now() / 1000) - 100 * 60;

    for (let i = 0; i < 100; i++) {
      const open = price;
      const volatility = price * 0.01;
      const close = open + (Math.random() - 0.5) * volatility;
      data.push({
        time: time + i * 60,
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
      this.symbols.forEach(symbol => {
        const history = this.marketData[symbol];
        const lastBar = history[history.length - 1];
        const volatility = lastBar.close * 0.002;
        const nextPrice = lastBar.close + (Math.random() - 0.5) * volatility;
        
        const newBar = {
          time: lastBar.time + 60,
          open: lastBar.close,
          high: Math.max(lastBar.close, nextPrice) + Math.random() * (volatility * 0.2),
          low: Math.min(lastBar.close, nextPrice) - Math.random() * (volatility * 0.2),
          close: nextPrice
        };
        this.marketData[symbol].push(newBar);
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