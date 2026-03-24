import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

const TradingViewChart = ({ symbol, data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const maSeriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    maSeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

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

  const calculateMA = (data, period) => {
    const res = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue;
      const subset = data.slice(i - period + 1, i + 1);
      const sum = subset.reduce((acc, val) => acc + val.close, 0);
      res.push({ time: data[i].time, value: sum / period });
    }
    return res;
  };

  useEffect(() => {
    if (candlestickSeriesRef.current && data && data.length > 0) {
      // FIX: Force set data to ensure the chart visuals match the state exactly
      candlestickSeriesRef.current.setData(data);

      if (data.length >= 20 && maSeriesRef.current) {
        const maData = calculateMA(data, 20);
        maSeriesRef.current.setData(maData);
      }

      if (chartRef.current) {
        chartRef.current.timeScale().scrollToPosition(0, false);
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
      </div>
      <div ref={chartContainerRef} className="flex-grow w-full min-h-[350px]" />
    </div>
  );
};

export default TradingViewChart;