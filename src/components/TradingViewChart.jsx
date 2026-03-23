import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

const TradingViewChart = ({ symbol, data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const maSeriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize the professional chart engine
    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { 
        borderColor: '#334155', 
        timeVisible: true,
        secondsVisible: false 
      },
    });

    // FIX: Using the modular addSeries API for v4/v5 compatibility
    candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Add 20-day Moving Average as a LineSeries
    maSeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    // Handle responsive resizing
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Function to calculate n-period Moving Average
  const calculateMA = (data, period) => {
    const res = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue;
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
      res.push({ time: data[i].time, value: sum / period });
    }
    return res;
  };

  // Update data when the asset or price changes
  useEffect(() => {
    if (candlestickSeriesRef.current && data) {
      // Lightweight charts expects an array for the initial load
      // Ensure data is sorted by time to avoid "Value is undefined" errors
      if (Array.isArray(data) && data.length > 0) {
        candlestickSeriesRef.current.setData(data);
        
        // Calculate and apply 20-day Moving Average
        if (data.length > 20) {
          const maData = calculateMA(data, 20);
          if (maSeriesRef.current && maData.length > 0) {
            maSeriesRef.current.setData(maData);
          }
        }
      } else if (!Array.isArray(data) && data.time) {
        // Handle real-time single tick updates
        candlestickSeriesRef.current.update(data);
      }
    }
  }, [data, symbol]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-bold text-white tracking-tight">
                {symbol} <span className="text-slate-500 font-normal text-sm ml-2">Real-time Feed</span>
            </h2>
        </div>
        <div className="flex space-x-2">
          <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-400 font-mono uppercase">
            Interval: 1m
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-grow w-full min-h-[350px]" />
    </div>
  );
};

export default TradingViewChart;