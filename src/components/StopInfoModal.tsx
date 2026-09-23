import React from 'react';
import { YIP_SHING_STOPS } from '../types';
import { X, MapPin, Bus, ExternalLink, Info, ShieldCheck } from 'lucide-react';

interface StopInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: 'KOWLOON' | 'TSUEN_WAN';
}

export const StopInfoModal: React.FC<StopInfoModalProps> = ({
  isOpen,
  onClose,
  direction,
}) => {
  if (!isOpen) return null;

  const currentStop = YIP_SHING_STOPS[direction];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentStop.lat},${currentStop.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                葵涌 業成街巴士站資訊
              </h2>
              <p className="text-xs text-slate-400">Yip Shing Street Stop Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Selected Stop Details */}
        <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">當前方向</span>
            <span className="font-bold text-red-400 text-sm">{currentStop.directionName}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">九巴站柱編號</span>
            <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800">
              {currentStop.poleCode}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">API 車站識別碼</span>
            <span className="font-mono text-slate-400 text-[11px] truncate max-w-[190px]">
              {currentStop.stopId}
            </span>
          </div>

          <div className="py-1">
            <span className="text-slate-400 block mb-0.5">車站位置</span>
            <span className="text-slate-200">{currentStop.locationTc}</span>
          </div>

          <div className="py-1">
            <span className="text-slate-400 block mb-0.5">主要前往區域</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentStop.primaryDestinations.map((dest) => (
                <span
                  key={dest}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
                >
                  {dest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Map Link */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <MapPin className="w-4 h-4 text-red-400" />
          <span>在 Google 地圖中查看此站位置</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
        </a>

        {/* Open Data Attribution */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span>本程式採用香港政府 DATA.GOV.HK 及九龍巴士 (KMB) 官方實時到站開放數據 API，班次預測每 20 秒自動同步更新。</span>
          </div>
        </div>
      </div>
    </div>
  );
};
