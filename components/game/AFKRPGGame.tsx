'use client';

import React, { useEffect, useState } from 'react';
import { GameEngine } from './GameEngine';
import { GameHUD } from '../ui/GameHUD';
import { BottomNav } from '../ui/BottomNav';
import { CharacterPanel } from '../panels/CharacterPanel';
import { InventoryPanel } from '../panels/InventoryPanel';
import { MapPanel } from '../panels/MapPanel';
import { SettingsPanel } from '../panels/SettingsPanel';
import { useGameStore } from '../../stores/gameStore';
import { generateInitialItems } from '../../utils/itemGenerator';

const AFKRPGGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameStore = useGameStore();
  const { gameState } = useGameStore();
  
  useEffect(() => {
    // Load saved game on mount
    gameStore.loadGame();
  }, []);
  
  useEffect(() => {
    if (canvasRef.current && !gameEngine) {
      const engine = new GameEngine(canvasRef.current, gameStore);
      setGameEngine(engine);
    }
    
    return () => {
      if (gameEngine) {
        gameEngine.destroy();
      }
    };
  }, []);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      gameStore.saveGame();
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, []);
  
  const startNewWave = () => {
    if (gameEngine) {
      gameEngine.startWave(gameStore.gameState.currentWave);
    }
  };

  // Función para manejar el cambio de tab con toggle
  const handleTabChange = (tab: string) => {
    if (activeTab === tab) {
      // Si el tab actual es el mismo, cerrar el panel
      setActiveTab('map');
    } else {
      // Si es un tab diferente, abrir el nuevo panel
      setActiveTab(tab);
    }
  };

  // Determinar si mostrar el panel lateral
  const showSidePanel = activeTab === 'character' || activeTab === 'inventory';
  const isInventoryPanel = activeTab === 'inventory';
  
  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Game HUD */}
      <GameHUD startNewWave={startNewWave} />
      
      {/* PIXI.js Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute top-12 transition-all duration-300 ${
          showSidePanel ? 'w-2/3' : 'w-full'
        } ${isInventoryPanel ? 'right-0' : 'left-0'}`}
        style={{ height: 'calc(100vh - 120px)' }}
      />
      
      {/* Side Panel for Character (Right Side) */}
      {activeTab === 'character' && (
        <div className="absolute top-12 right-0 w-1/3 h-full bg-gray-900/95 border-l border-gray-700 overflow-y-auto">
          <CharacterPanel />
        </div>
      )}
      
      {/* Side Panel for Inventory (Left Side) */}
      {activeTab === 'inventory' && (
        <div className="absolute top-12 left-0 w-1/3 h-full bg-gray-900/95 border-r border-gray-700 overflow-y-auto">
          <InventoryPanel />
        </div>
      )}
      
      {/* Full Screen Content for Map and Settings */}
      {!showSidePanel && (
        <div className="absolute top-12 left-0 right-0 bottom-16 overflow-y-auto bg-gray-900/90">
          {activeTab === 'map' && <MapPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
};

export default AFKRPGGame;
