import React from 'react';
import { ProcessedEta } from '../types';
import { Sparkles } from 'lucide-react';

interface CompactBusRowProps {
  item: ProcessedEta;
  directionType: 'TSUEN_WAN' | 'KOWLOON';
  isSelected: boolean;
  onSelect: (item: ProcessedEta) => void;
}

export const CompactBusRow: React.FC<CompactBusRowProps> = ({
  item,
  directionType,
  isSelected,
  onSelect,
}) => {
  const isNow = item.displayStatus === 'ARRIVING_NOW';

  return (
    <div
      onClick={() => onSelect(item)}
      className={`rounded-lg px-2 py-1 transition-all duration-150 border flex items-center justify-between gap-1 text-xs select-none cursor-pointer ${
        isSelected
          ? 'bg-amber-300 text-slate-950 border-amber-400 font-bold shadow-md ring-1 ring-amber-400/50'
          : isNow
          ? 'bg-slate-900 border-red-500/40 hover:bg-slate-850 text-slate-200'
          : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-200'
      }`}
    >
      {/* 1. Route Number + 2. 中文終點站名 (font size 80%) */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* 1. Route Number */}
        <span
          className={`font-mono font-black text-xs px-1.5 py-0.5 rounded leading-none shrink-0 min-w-[32px] text-center ${
            isSelected
              ? 'bg-slate-950 text-amber-300'
              : directionType === 'TSUEN_WAN'
              ? 'bg-blue-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {item.route}
        </span>

        {/* 2. 中文終點站名 (80% font size: text-[10px] sm:text-[11px] to prevent truncation) */}
        <span
          className={`font-bold tracking-tight text-[10px] sm:text-[11px] leading-tight truncate ${
            isSelected ? 'text-slate-950' : 'text-slate-100'
          }`}
          title={item.destTc}
        >
          {item.destTc}
        </span>
      </div>

      {/* 3. 到達分鐘 (highlight in red) + 預計時間 */}
      <div className="text-right shrink-0 flex items-center gap-1 font-mono text-[11px]">
        {isNow ? (
          <div className="flex items-center gap-0.5">
            <span
              className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-black text-[10px] animate-pulse ${
                isSelected
                  ? 'bg-red-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              即到
            </span>
            <span
              className={`text-[10px] font-bold ${
                isSelected ? 'text-slate-800' : 'text-slate-400'
              }`}
            >
              {item.clockTimeText}
            </span>
          </div>
        ) : item.minutesRemaining !== null ? (
          <div className="flex items-baseline gap-0.5">
            {/* Remaining minutes highlighted in RED */}
            <span
              className={`font-black text-xs sm:text-sm ${
                isSelected ? 'text-red-700' : 'text-red-500'
              }`}
            >
              {item.minutesRemaining}
            </span>
            <span
              className={`text-[9px] font-bold ${
                isSelected ? 'text-red-700' : 'text-red-500'
              }`}
            >
              分
            </span>
            <span
              className={`text-[10px] ml-0.5 ${
                isSelected ? 'text-slate-800 font-semibold' : 'text-slate-400'
              }`}
            >
              ({item.clockTimeText})
            </span>
          </div>
        ) : (
          <span
            className={`text-[10px] ${
              isSelected ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            未有班次
          </span>
        )}
      </div>
    </div>
  );
};
