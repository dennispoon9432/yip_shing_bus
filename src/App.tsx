/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { YIP_SHING_STOPS, ProcessedEta } from './types';
import { fetchStopEtas, processEtas } from './services/kmbApi';
import { CompactBusRow } from './components/CompactBusRow';
import {
  RefreshCw,
  Clock,
  AlertCircle,
  Radio,
  Trees,
  Building2,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

const AUTO_REFRESH_INTERVAL = 20; // seconds

interface LockedBusInfo {
  direction: 'TSUEN_WAN' | 'KOWLOON';
  route: string;
  destTc: string;
  serviceType: number;
  expectedEtaMs: number;
}

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Raw API data
  const [kowloonRaw, setKowloonRaw] = useState<any[]>([]);
  const [tsuenWanRaw, setTsuenWanRaw] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(AUTO_REFRESH_INTERVAL);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Robust locked bus state: keeps tracking the exact bus even when ETA timestamp shifts
  const [lockedBus, setLockedBus] = useState<LockedBusInfo | null>(null);

  // Fetch both directions simultaneously
  const loadData = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);

    try {
      const kowloonStopId = YIP_SHING_STOPS.KOWLOON.stopId;
      const tsuenWanStopId = YIP_SHING_STOPS.TSUEN_WAN.stopId;

      const [kData, twData] = await Promise.all([
        fetchStopEtas(kowloonStopId),
        fetchStopEtas(tsuenWanStopId),
      ]);

      setKowloonRaw(kData);
      setTsuenWanRaw(twData);
      setLastUpdated(new Date());
      setRemainingSeconds(AUTO_REFRESH_INTERVAL);
    } catch (err: any) {
      console.error('Error fetching KMB ETA:', err);
      setError(err?.message || '未能獲取九巴即時到站資訊，請稍後重試。');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live timer for clock and auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          loadData();
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData]);

  // Recalculate remaining minutes every 2s
  const [clockTick, setClockTick] = useState<number>(Date.now());
  useEffect(() => {
    const ticker = setInterval(() => {
      setClockTick(Date.now());
    }, 2000);
    return () => clearInterval(ticker);
  }, []);

  // Process data for both directions
  const tsuenWanProcessed = useMemo(() => {
    return processEtas(tsuenWanRaw, new Date());
  }, [tsuenWanRaw, clockTick]);

  const kowloonProcessed = useMemo(() => {
    return processEtas(kowloonRaw, new Date());
  }, [kowloonRaw, clockTick]);

  const tsuenWanArriving = tsuenWanProcessed.arrivingBuses;
  const kowloonArriving = kowloonProcessed.arrivingBuses;

  // Find the exact matching bus even across refreshes and time adjustments
  const lockedBusMatch = useMemo(() => {
    if (!lockedBus) return null;

    const list = lockedBus.direction === 'TSUEN_WAN' ? tsuenWanArriving : kowloonArriving;
    const candidates = list.filter(
      (b) => b.route === lockedBus.route && b.destTc === lockedBus.destTc && b.etaDate !== null
    );

    if (candidates.length === 0) return null;

    // Find candidate whose ETA is closest to expectedEtaMs
    let best = candidates[0];
    let minDiff = Math.abs((best.etaDate?.getTime() ?? 0) - lockedBus.expectedEtaMs);

    for (let i = 1; i < candidates.length; i++) {
      const diff = Math.abs((candidates[i].etaDate?.getTime() ?? 0) - lockedBus.expectedEtaMs);
      if (diff < minDiff) {
        minDiff = diff;
        best = candidates[i];
      }
    }

    // Accept match if within 15-minute window
    if (minDiff <= 15 * 60 * 1000) {
      return {
        bus: best,
        direction: lockedBus.direction,
        dirName: lockedBus.direction === 'TSUEN_WAN' ? '往荃灣' : '往九龍',
        dirColor: lockedBus.direction === 'TSUEN_WAN' ? ('blue' as const) : ('red' as const),
      };
    }

    return null;
  }, [lockedBus, tsuenWanArriving, kowloonArriving]);

  // Keep lockedBus.expectedEtaMs continuously synced with latest API time
  useEffect(() => {
    if (lockedBusMatch && lockedBus) {
      const currentEtaMs = lockedBusMatch.bus.etaDate?.getTime();
      if (currentEtaMs && Math.abs(currentEtaMs - lockedBus.expectedEtaMs) > 1000) {
        setLockedBus((prev) => (prev ? { ...prev, expectedEtaMs: currentEtaMs } : null));
      }
    }
  }, [lockedBusMatch]);

  // Handle clicking a bus row to lock or unlock
  const handleToggleBusSelect = (bus: ProcessedEta, direction: 'TSUEN_WAN' | 'KOWLOON') => {
    const busEtaMs = bus.etaDate?.getTime() ?? Date.now();

    if (
      lockedBus &&
      lockedBus.direction === direction &&
      lockedBus.route === bus.route &&
      lockedBus.destTc === bus.destTc &&
      Math.abs(lockedBus.expectedEtaMs - busEtaMs) < 60000 * 6
    ) {
      // Clicking the same locked bus unlocks it
      setLockedBus(null);
    } else {
      // Lock this specific bus
      setLockedBus({
        direction,
        route: bus.route,
        destTc: bus.destTc,
        serviceType: bus.serviceType,
        expectedEtaMs: busEtaMs,
      });
    }
  };

  // Top banner display bus: locked bus (if selected) or default earliest bus across both directions
  const activeDisplayBus = useMemo(() => {
    if (lockedBusMatch) {
      return { ...lockedBusMatch, isManual: true };
    }

    // Default to the earliest arriving bus across both directions
    const all = [
      ...tsuenWanArriving.map((b) => ({ bus: b, direction: 'TSUEN_WAN' as const, dirName: '往荃灣', dirColor: 'blue' as const, isManual: false })),
      ...kowloonArriving.map((b) => ({ bus: b, direction: 'KOWLOON' as const, dirName: '往九龍', dirColor: 'red' as const, isManual: false })),
    ].filter((x) => x.bus.etaDate !== null);

    all.sort((a, b) => (a.bus.etaDate?.getTime() ?? 0) - (b.bus.etaDate?.getTime() ?? 0));
    return all[0] || null;
  }, [lockedBusMatch, tsuenWanArriving, kowloonArriving]);

  const formatHkTime = (date: Date) => {
    return date.toLocaleTimeString('zh-HK', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const progressPercentage = ((AUTO_REFRESH_INTERVAL - remainingSeconds) / AUTO_REFRESH_INTERVAL) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top micro progress bar */}
      <div className="h-1 w-full bg-slate-850 overflow-hidden sticky top-0 z-40">
        <div
          className="h-full bg-red-600 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
        />
      </div>

      {/* Header & Estimated Arrival Time at Top */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-1 z-30 shadow-md px-3 py-2">
        <div className="max-w-7xl mx-auto space-y-2">
          {/* Top row: Station Title + Live Clock + Refresh */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-[11px] flex items-center justify-center shadow shrink-0">
                九巴
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                葵涌 業成街
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <Radio className="w-2.5 h-2.5 text-red-400 animate-pulse" />
                實時雙向
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatHkTime(currentTime)}</span>
                <span className="text-slate-500 ml-1">({remainingSeconds}s)</span>
              </div>

              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="p-1 sm:px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1 disabled:opacity-50 text-xs"
                title="立即更新"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-red-400 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">更新</span>
              </button>
            </div>
          </div>

          {/* Dedicated Estimated Arrival Time Banner with MAXIMIZED TIME & MINUTES */}
          {activeDisplayBus && (
            <div
              className={`rounded-xl px-3 py-2 transition-all flex items-center justify-between gap-3 shadow-md border ${
                activeDisplayBus.isManual
                  ? 'bg-amber-300 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800/95 text-slate-100 border-slate-700'
              }`}
            >
              {/* Left Side: Route Badge + Direction + Chinese Destination (Spacious & Clean) */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Large Route Badge */}
                <span
                  className={`font-mono font-black text-xl sm:text-3xl px-2.5 py-1 rounded-lg leading-none shrink-0 shadow-xs ${
                    activeDisplayBus.isManual
                      ? 'bg-slate-950 text-amber-300'
                      : activeDisplayBus.dirColor === 'blue'
                      ? 'bg-blue-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {activeDisplayBus.bus.route}
                </span>

                {/* Destination & Direction */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        activeDisplayBus.isManual
                          ? 'bg-slate-950/15 text-slate-900'
                          : activeDisplayBus.dirColor === 'blue'
                          ? 'bg-blue-500/25 text-blue-300'
                          : 'bg-red-500/25 text-red-300'
                      }`}
                    >
                      {activeDisplayBus.dirName}
                    </span>
                    {activeDisplayBus.isManual && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 shrink-0">
                        <Lock className="w-2.5 h-2.5" /> 已鎖定
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-xl font-black truncate mt-0.5">
                    往 {activeDisplayBus.bus.destTc}
                  </div>
                </div>
              </div>

              {/* Right Side: MAXIMIZED ARRIVAL TIME AND MINUTES DISPLAY */}
              <div className="text-right shrink-0 flex items-center gap-2 sm:gap-3">
                <div className="flex items-baseline gap-2 sm:gap-4">
                  {/* Remaining Minutes (Red, Extra Big) */}
                  {activeDisplayBus.bus.displayStatus === 'ARRIVING_NOW' ? (
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-2xl sm:text-4xl md:text-5xl font-black font-mono animate-pulse ${
                          activeDisplayBus.isManual ? 'text-red-700' : 'text-red-500'
                        }`}
                      >
                        即到
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span
                        className={`text-3xl sm:text-5xl md:text-6xl font-black font-mono leading-none tracking-tight ${
                          activeDisplayBus.isManual ? 'text-red-700' : 'text-red-500'
                        }`}
                      >
                        {activeDisplayBus.bus.minutesRemaining}
                      </span>
                      <span
                        className={`text-xs sm:text-lg font-black ml-0.5 ${
                          activeDisplayBus.isManual ? 'text-red-700' : 'text-red-500'
                        }`}
                      >
                        分
                      </span>
                    </div>
                  )}

                  {/* Estimated Clock Arrival Time (Extra Big) */}
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[9px] sm:text-[11px] uppercase tracking-wider font-bold ${
                        activeDisplayBus.isManual ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      預計到站
                    </span>
                    <span
                      className={`text-xl sm:text-3xl md:text-4xl font-black font-mono leading-none ${
                        activeDisplayBus.isManual ? 'text-slate-950' : 'text-white'
                      }`}
                    >
                      {activeDisplayBus.bus.clockTimeText}
                    </span>
                  </div>
                </div>

                {/* Unlock Button if manually locked */}
                {activeDisplayBus.isManual && (
                  <button
                    onClick={() => setLockedBus(null)}
                    className="p-1.5 rounded-lg bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 transition cursor-pointer"
                    title="取消鎖定"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main 2-Column Board: 往荃灣 (Left - Blue) & 往九龍 (Right - Red) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-3">
        {/* Error Alert */}
        {error && !loading && (
          <div className="mb-2 bg-red-950/50 border border-red-500/50 rounded-xl p-2.5 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-500 cursor-pointer"
            >
              重試
            </button>
          </div>
        )}

        {/* 2-Column Side-by-Side Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 items-start">
          {/* ================= LEFT COLUMN: 往荃灣 (BLUE) ================= */}
          <section className="bg-slate-900/60 border border-blue-900/40 rounded-xl overflow-hidden flex flex-col shadow-sm">
            {/* Blue Column Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-2 py-1.5 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-1 min-w-0">
                <Trees className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                <h2 className="text-xs font-black tracking-tight truncate">
                  往荃灣方向
                </h2>
                <span className="text-[9px] font-mono bg-blue-900/60 text-blue-200 px-1 py-0.2 rounded hidden xs:inline">
                  KW123
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-full shrink-0">
                {tsuenWanArriving.length} 班
              </span>
            </div>

            {/* List of Arriving Buses (earliest first on top) */}
            <div className="p-1 sm:p-1.5 space-y-1 min-h-[300px]">
              {loading ? (
                <div className="space-y-1 py-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="h-7 bg-slate-850/60 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              ) : tsuenWanArriving.length > 0 ? (
                tsuenWanArriving.map((item) => {
                  const isSelected = Boolean(
                    lockedBusMatch &&
                      lockedBusMatch.direction === 'TSUEN_WAN' &&
                      lockedBusMatch.bus.id === item.id
                  );
                  return (
                    <CompactBusRow
                      key={item.id}
                      item={item}
                      directionType="TSUEN_WAN"
                      isSelected={isSelected}
                      onSelect={(bus) => handleToggleBusSelect(bus, 'TSUEN_WAN')}
                    />
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  目前暫無即將抵達班次
                </div>
              )}
            </div>
          </section>

          {/* ================= RIGHT COLUMN: 往九龍 (RED) ================= */}
          <section className="bg-slate-900/60 border border-red-900/40 rounded-xl overflow-hidden flex flex-col shadow-sm">
            {/* Red Column Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-2 py-1.5 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-1 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-red-200 shrink-0" />
                <h2 className="text-xs font-black tracking-tight truncate">
                  往九龍方向
                </h2>
                <span className="text-[9px] font-mono bg-red-900/60 text-red-200 px-1 py-0.2 rounded hidden xs:inline">
                  KW410
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-full shrink-0">
                {kowloonArriving.length} 班
              </span>
            </div>

            {/* List of Arriving Buses (earliest first on top) */}
            <div className="p-1 sm:p-1.5 space-y-1 min-h-[300px]">
              {loading ? (
                <div className="space-y-1 py-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="h-7 bg-slate-850/60 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              ) : kowloonArriving.length > 0 ? (
                kowloonArriving.map((item) => {
                  const isSelected = Boolean(
                    lockedBusMatch &&
                      lockedBusMatch.direction === 'KOWLOON' &&
                      lockedBusMatch.bus.id === item.id
                  );
                  return (
                    <CompactBusRow
                      key={item.id}
                      item={item}
                      directionType="KOWLOON"
                      isSelected={isSelected}
                      onSelect={(bus) => handleToggleBusSelect(bus, 'KOWLOON')}
                    />
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  目前暫無即將抵達班次
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-1.5 px-3 text-[10px] text-slate-400 text-center shrink-0">
        <span>九巴 業成街站 · 左欄往荃灣 (藍) / 右欄往九龍 (紅) · 點選班次鎖定頂部大字顯示</span>
      </footer>
    </div>
  );
}
