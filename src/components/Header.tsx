import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Bus, MapPin, Radio } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refreshIntervalSeconds: number;
  remainingSeconds: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  lastUpdated,
  refreshIntervalSeconds,
  remainingSeconds,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHkTime = (date: Date) => {
    return date.toLocaleTimeString('zh-HK', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const progressPercentage = ((refreshIntervalSeconds - remainingSeconds) / refreshIntervalSeconds) * 100;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top micro progress bar for auto-refresh */}
      <div className="h-1 w-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-red-600 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Stop Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30 flex-shrink-0">
              <span className="font-black text-xs tracking-tighter leading-tight text-center">
                九巴
                <br />
                <span className="text-[10px] font-bold tracking-normal opacity-90">KMB</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  葵涌 業成街
                  <span className="hidden xs:inline-block text-xs font-normal text-slate-400">
                    Yip Shing Street
                  </span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                  實時到站
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>青山公路－葵涌段 · 香港九龍及新界專營巴士</span>
              </p>
            </div>
          </div>

          {/* Right Controls: Live Clock & Refresh */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatHkTime(currentTime)}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {remainingSeconds}s 後更新
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="立即更新到站時間"
              title="立即更新到站時間"
              className={`p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm`}
            >
              <RefreshCw
                className={`w-4 h-4 text-red-400 ${isRefreshing ? 'animate-spin text-red-500' : ''}`}
              />
              <span className="text-xs font-medium hidden sm:inline">
                {isRefreshing ? '更新中…' : '更新'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
