import React from 'react';
import {
  Film,
  Scissors,
  Crop,
  Subtitles,
  Image as ImageIcon,
  Smile,
  ZoomIn,
  Sparkles,
} from 'lucide-react';

export type SidebarTab =
  | 'media'
  | 'split'
  | 'crop'
  | 'captions'
  | 'logo'
  | 'stickers'
  | 'zoom';

interface EditorSidebarProps {
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  captionsCount: number;
  clipsCount: number;
  keyframesCount: number;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeSidebarTab,
  setActiveSidebarTab,
  captionsCount,
  clipsCount,
  keyframesCount,
}) => {
  const tabs = [
    {
      id: 'media' as SidebarTab,
      label: 'Media',
      icon: Film,
      badge: null,
    },
    {
      id: 'split' as SidebarTab,
      label: 'Split & Clips',
      icon: Scissors,
      badge: clipsCount > 0 ? `${clipsCount}` : null,
    },
    {
      id: 'crop' as SidebarTab,
      label: 'Crop & Frame',
      icon: Crop,
      badge: null,
    },
    {
      id: 'captions' as SidebarTab,
      label: 'Captions',
      icon: Subtitles,
      badge: captionsCount > 0 ? `${captionsCount}` : null,
    },
    {
      id: 'logo' as SidebarTab,
      label: 'Logo / Watermark',
      icon: ImageIcon,
      badge: null,
    },
    {
      id: 'stickers' as SidebarTab,
      label: 'Stickers',
      icon: Smile,
      badge: null,
    },
    {
      id: 'zoom' as SidebarTab,
      label: 'Smart Zoom',
      icon: ZoomIn,
      badge: keyframesCount > 0 ? `${keyframesCount}` : null,
    },
  ];

  return (
    <aside className="w-16 bg-[#090d16] border-r border-slate-800 flex flex-col items-center py-3 select-none shrink-0 z-20">
      <div className="flex flex-col gap-2 w-full px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSidebarTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSidebarTab(tab.id)}
              className={`group relative w-full flex flex-col items-center justify-center py-2.5 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5 mb-1 shrink-0" />
              <span className="truncate w-full text-center leading-none text-[9px]">
                {tab.label.split(' ')[0]}
              </span>

              {tab.badge && (
                <span
                  className={`absolute top-1 right-1 px-1 rounded-full text-[8px] font-mono leading-tight ${
                    isActive ? 'bg-white text-blue-900 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
