import React from 'react';
import { YIP_SHING_STOPS } from '../types';
import { ArrowRight, Navigation, Building2, Trees } from 'lucide-react';

interface DirectionSelectorProps {
  selectedDirection: 'KOWLOON' | 'TSUEN_WAN';
  onSelectDirection: (direction: 'KOWLOON' | 'TSUEN_WAN') => void;
  kowloonArrivingCount: number;
  tsuenWanArrivingCount: number;
}

export const DirectionSelector: React.FC<DirectionSelectorProps> = ({
  selectedDirection,
  onSelectDirection,
  kowloonArrivingCount,
  tsuenWanArrivingCount,
}) => {
  const kowloonConfig = YIP_SHING_STOPS.KOWLOON;
  const tsuenWanConfig = YIP_SHING_STOPS.TSUEN_WAN;

  return (
    <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 p-2 sm:p-3 sticky top-[61px] sm:top-[69px] z-20 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
          {/* Direction 1: 往九龍 */}
          <button
            type="button"
            onClick={() => onSelectDirection('KOWLOON')}
            className={`relative flex flex-col items-start text-left p-2.5 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              selectedDirection === 'KOWLOON'
                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 scale-[1.01]'
                : 'bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5">
                <Building2
                  className={`w-4 h-4 ${
                    selectedDirection === 'KOWLOON' ? 'text-red-100' : 'text-slate-400'
                  }`}
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80 font-mono">
                  站柱 {kowloonConfig.poleCode}
                </span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  selectedDirection === 'KOWLOON'
                    ? 'bg-white/20 text-white backdrop-blur-xs'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {kowloonArrivingCount} 班
              </span>
            </div>

            <div className="flex items-center gap-1.5 w-full">
              <span className="text-base sm:text-lg font-black tracking-tight">
                {kowloonConfig.directionName}
              </span>
              <ArrowRight
                className={`w-4 h-4 transition-transform ${
                  selectedDirection === 'KOWLOON' ? 'translate-x-0.5' : 'text-slate-500'
                }`}
              />
            </div>

            <div
              className={`text-[11px] truncate w-full mt-0.5 ${
                selectedDirection === 'KOWLOON' ? 'text-red-100/90' : 'text-slate-400'
              }`}
            >
              尖沙咀 · 奧運/旺角 · 藍田/觀塘
            </div>
          </button>

          {/* Direction 2: 往荃灣方向 */}
          <button
            type="button"
            onClick={() => onSelectDirection('TSUEN_WAN')}
            className={`relative flex flex-col items-start text-left p-2.5 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              selectedDirection === 'TSUEN_WAN'
                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 scale-[1.01]'
                : 'bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5">
                <Trees
                  className={`w-4 h-4 ${
                    selectedDirection === 'TSUEN_WAN' ? 'text-red-100' : 'text-slate-400'
                  }`}
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80 font-mono">
                  站柱 {tsuenWanConfig.poleCode}
                </span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  selectedDirection === 'TSUEN_WAN'
                    ? 'bg-white/20 text-white backdrop-blur-xs'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tsuenWanArrivingCount} 班
              </span>
            </div>

            <div className="flex items-center gap-1.5 w-full">
              <span className="text-base sm:text-lg font-black tracking-tight">
                {tsuenWanConfig.directionName}
              </span>
              <ArrowRight
                className={`w-4 h-4 transition-transform ${
                  selectedDirection === 'TSUEN_WAN' ? 'translate-x-0.5' : 'text-slate-500'
                }`}
              />
            </div>

            <div
              className={`text-[11px] truncate w-full mt-0.5 ${
                selectedDirection === 'TSUEN_WAN' ? 'text-red-100/90' : 'text-slate-400'
              }`}
            >
              荃灣(石圍角/如心) · 葵盛 · 梨木樹 · 青衣
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
