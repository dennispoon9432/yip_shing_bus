import React from 'react';
import { Search, Star, ListOrdered, Layers, X } from 'lucide-react';

interface RouteFilterBarProps {
  availableRoutes: string[];
  selectedRoute: string | null;
  onSelectRoute: (route: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showOnlyFavorites: boolean;
  onToggleFavoritesOnly: () => void;
  favoriteCount: number;
  viewMode: 'timeline' | 'grouped';
  onViewModeChange: (mode: 'timeline' | 'grouped') => void;
}

export const RouteFilterBar: React.FC<RouteFilterBarProps> = ({
  availableRoutes,
  selectedRoute,
  onSelectRoute,
  searchQuery,
  onSearchChange,
  showOnlyFavorites,
  onToggleFavoritesOnly,
  favoriteCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="space-y-3">
      {/* Top search & view toggle row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜尋路線或目的地 (如: 35A, 尖沙咀, 藍田, 荃灣)..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              title="清除搜尋"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Toggle & Favorite Filter */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Favorites filter button */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showOnlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="只顯示常用收藏路線"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                showOnlyFavorites ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
              }`}
            />
            <span>常用</span>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle: Timeline vs Grouped */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="時間排序：即將到站先排在最前"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">到站時間軸</span>
              <span className="xs:hidden">即時</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('grouped')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="按路線分類顯示"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">路線分組</span>
              <span className="xs:hidden">分組</span>
            </button>
          </div>
        </div>
      </div>

      {/* Route Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onSelectRoute(null)}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition cursor-pointer ${
            selectedRoute === null
              ? 'bg-slate-200 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          全部路線 ({availableRoutes.length})
        </button>

        {availableRoutes.map((route) => {
          const isSelected = selectedRoute === route;
          return (
            <button
              key={route}
              onClick={() => onSelectRoute(isSelected ? null : route)}
              className={`px-2.5 py-1.5 rounded-lg font-bold font-mono tracking-tight shrink-0 transition cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400/50'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {route}
            </button>
          );
        })}
      </div>
    </div>
  );
};
