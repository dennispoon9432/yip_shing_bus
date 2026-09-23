import React from 'react';
import { ProcessedEta, ROUTE_EXTRA_INFO } from '../types';
import { ArrowRight, Wifi, Clock, Star, Bell, BellRing, Sparkles, Navigation } from 'lucide-react';

interface ArrivalCardProps {
  item: ProcessedEta;
  isFavorite: boolean;
  onToggleFavorite: (route: string) => void;
  isAlarmSet: boolean;
  onToggleAlarm: (item: ProcessedEta) => void;
}

export const ArrivalCard: React.FC<ArrivalCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  isAlarmSet,
  onToggleAlarm,
}) => {
  const extraInfo = ROUTE_EXTRA_INFO[item.route];
  const isNow = item.displayStatus === 'ARRIVING_NOW';
  const isUnder5Mins = item.minutesRemaining !== null && item.minutesRemaining <= 5 && !isNow;

  return (
    <div
      className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border ${
        isNow
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20'
          : isUnder5Mins
          ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500/70 shadow-md'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Route Badge & Destination */}
        <div className="flex items-center gap-3 min-w-0">
          {/* KMB Red Route Badge */}
          <div className="relative shrink-0">
            <div className="w-16 sm:w-20 py-1.5 sm:py-2 px-1 bg-red-600 rounded-xl text-center shadow-md shadow-red-700/30 border border-red-500/50 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono leading-none">
                {item.route}
              </span>
              {extraInfo?.tag && (
                <span className="text-[9px] font-bold text-red-100 uppercase tracking-tight mt-0.5 px-1 rounded bg-black/20">
                  {extraInfo.tag}
                </span>
              )}
            </div>
            {item.etaSeq > 1 && (
              <span className="absolute -bottom-1.5 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow">
                第 {item.etaSeq} 班
              </span>
            )}
          </div>

          {/* Destination & Routing */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">往</span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {item.destTc}
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 truncate uppercase tracking-wider font-mono">
              {item.destEn}
            </div>

            {/* Via info */}
            {extraInfo?.viaTc && (
              <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-slate-500 shrink-0" />
                <span>經 {extraInfo.viaTc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Arrival Countdown & Badges */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Time Countdown Box */}
          <div className="text-right">
            {isNow ? (
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black bg-emerald-500 text-slate-950 animate-pulse shadow-md shadow-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  即將抵達
                </span>
                <span className="text-[11px] font-mono text-emerald-400 mt-0.5 font-medium">
                  {item.clockTimeText}
                </span>
              </div>
            ) : item.minutesRemaining !== null ? (
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                      isUnder5Mins ? 'text-amber-400' : 'text-slate-100'
                    }`}
                  >
                    {item.minutesRemaining}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isUnder5Mins ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    分鐘
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  預計 {item.clockTimeText}
                </span>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-xs text-slate-400">暫無班次</span>
              </div>
            )}

            {/* GPS or Scheduled badge */}
            <div className="flex items-center justify-end gap-1 mt-1">
              {item.isRealTime ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
                  <Wifi className="w-2.5 h-2.5" />
                  GPS 實時
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  {item.remarkTc || '原定班次'}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons (Favorite & Alarm) */}
          <div className="flex flex-col gap-1 border-l border-slate-800 pl-2 sm:pl-3">
            {/* Star Favorite */}
            <button
              onClick={() => onToggleFavorite(item.route)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
              title={isFavorite ? '取消常用路線' : '設為常用路線'}
              aria-label="常用路線"
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Reminder Alert */}
            {item.minutesRemaining !== null && item.minutesRemaining > 2 && (
              <button
                onClick={() => onToggleAlarm(item)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isAlarmSet
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
                }`}
                title={isAlarmSet ? '取消到站提醒' : '設定到站前 2 分鐘提醒'}
                aria-label="到站提醒"
              >
                {isAlarmSet ? (
                  <BellRing className="w-4 h-4 animate-bounce text-red-400" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
