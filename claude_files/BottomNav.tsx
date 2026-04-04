import React from 'react';
import { Home, Package, User, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'map', label: 'Mapa', icon: Home },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'character', label: 'Personaje', icon: User },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg min-w-[56px] transition-colors ${
                isActive
                  ? 'text-blue-400'
                  : 'text-gray-500 active:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
