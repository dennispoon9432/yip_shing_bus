import React from 'react';
import { RouteGroup, ROUTE_EXTRA_INFO } from '../types';
import { Star, Wifi, Clock, ArrowRight, Navigation, Sparkles } from 'lucide-react';

interface GroupedRouteCardProps {
  group: RouteGroup;
  isFavorite: boolean;
  onToggleFavorite: (route: string) => void;
}

export const GroupedRouteCard: React.FC<GroupedRouteCardProps> = ({
  group,
  isFavorite,
  onToggleFavorite,
}) => {
  const extraInfo = ROUTE_EXTRA_INFO[group.route];
  const hasLiveArrivals = group.arrivals.some((a) => a.minutesRemaining !== null);

  return (
    <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-3.5 sm:p-4 hover:border-slate-700 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Route header & destination */}
        <div className="flex items-center gap-3">
          <div className="w-16 py-1.5 px-1 bg-red-600 rounded-xl text-center shadow-md shadow-red-700/30 border border-red-500/50 flex flex-col items-center justify-center shrink-0">
            <span className="text-xl font-black tracking-tight text-white font-mono leading-none">
              {group.route}
            </span>
            {extraInfo?.tag && (
              <span className="text-[9px] font-bold text-red-100 uppercase tracking-tight mt-0.5 px-1 rounded bg-black/20">
                {extraInfo.tag}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">往</span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {group.destTc}
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
              {group.destEn}
            </div>
            {extraInfo?.viaTc && (
              <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-slate-500 shrink-0" />
                <span>經 {extraInfo.viaTc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(group.route)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
          title={isFavorite ? '取消常用路線' : '設為常用路線'}
        >
          <Star
            className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
          />
        </button>
      </div>

      {/* Departures Grid (up to 3 upcoming buses) */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        {hasLiveArrivals ? (
          group.arrivals
            .filter((a) => a.etaDate !== null)
            .map((arr, idx) => {
              const isNow = arr.displayStatus === 'ARRIVING_NOW';
              return (
                <div
                  key={arr.id || idx}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                    isNow
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-sm'
                      : idx === 0
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-mono mb-0.5">
                    第 {idx + 1} 班
                  </span>

                  {isNow ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      即將抵達
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-base sm:text-lg font-black font-mono">
                        {arr.minutesRemaining}
                      </span>
                      <span className="text-[10px] text-slate-400">分</span>
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {arr.clockTimeText}
                  </span>

                  <span className="text-[9px] mt-1 text-slate-400 flex items-center gap-0.5">
                    {arr.isRealTime ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Wifi className="w-2.5 h-2.5" /> GPS
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> 原定
                      </span>
                    )}
                  </span>
                </div>
              );
            })
        ) : (
          <div className="col-span-3 py-2 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
            目前暫無即時班次（非服務時間或只於特定時段服務）
          </div>
        )}
      </div>
    </div>
  );
};
