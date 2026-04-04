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

const AFKRPGGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const engineRef = React.useRef<GameEngine | null>(null);
  const gameStore = useGameStore();
  const { gameState, offlineRewards, setOfflineRewards } = useGameStore();

  useEffect(() => {
    // Load saved game on mount
    gameStore.loadGame();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = new GameEngine(canvasRef.current, useGameStore.getState);
    engineRef.current = engine;
    setGameEngine(engine);

      // Auto-arrancar: si hay boss pendiente, el overlay lo gestiona;
      // de lo contrario iniciar la wave actual automáticamente
    const startTimeout = setTimeout(() => {
      const state = useGameStore.getState().gameState;
      if (!(state.isInBossWave && !state.isFighting)) {
        engine.startWave(state.currentWave);
      }
    }, 800);

    const readyTimeout = setTimeout(() => {
      setIsEngineReady(true);
    }, 1200);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(readyTimeout);
      engine.destroy();
      engineRef.current = null;
      setGameEngine(null);
    };
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      gameStore.saveGame();
    }, 30000);

    return () => clearInterval(saveInterval);
  }, []);

  // Cambiar el fondo del canvas según el tab activo
  useEffect(() => {
    if (gameEngine) {
      const isFullScreen = activeTab === 'map' || activeTab === 'settings';
      gameEngine.setFullScreenMode(isFullScreen);

      if (activeTab === 'map') {
        setTimeout(() => {
          gameEngine.setFullScreenMode(true);
        }, 100);
      }
    }
  }, [activeTab, gameEngine]);

  // Cambiar el fondo cuando se seleccione uno diferente
  useEffect(() => {
    if (gameEngine && gameState.currentBackground) {
      gameEngine.changeBackground(gameState.currentBackground);
    }
  }, [gameState.currentBackground, gameEngine]);

  // Función para manejar el cambio de tab con toggle
  const handleTabChange = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab('map');
    } else {
      setActiveTab(tab);
    }
  };

  // Handler para confirmar el boss
  const handleBossConfirm = () => {
    if (gameEngine) {
      gameEngine.startWave(useGameStore.getState().gameState.currentWave);
    }
  };

  // Determinar si mostrar el panel lateral
  const showSidePanel = activeTab === 'character' || activeTab === 'inventory';
  const isInventoryPanel = activeTab === 'inventory';

  // Mostrar overlay pre-boss cuando la siguiente wave es boss y el juego está pausado
  const showBossOverlay = gameState.isInBossWave && !gameState.isFighting;

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Game HUD */}
      <GameHUD />

      {/* PIXI.js Canvas — always full-width on mobile, 2/3 on sm+ when side panel is open */}
      <canvas
        ref={canvasRef}
        className={`absolute top-12 left-0 transition-all duration-300 w-full ${
          showSidePanel ? 'sm:w-2/3' : ''
        } ${isInventoryPanel ? 'sm:left-auto sm:right-0' : ''}`}
        style={{ height: 'calc(100dvh - 108px)' }}
      />

      {/* Loading overlay — visible until PIXI assets finish loading */}
      {!isEngineReady && (
        <div
          className="absolute top-12 left-0 right-0 z-20 flex items-center justify-center bg-gray-900 transition-opacity duration-500"
          style={{ height: 'calc(100dvh - 108px)' }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <p className="text-gray-300 text-xl animate-pulse">Cargando partida...</p>
            <p className="text-yellow-400 text-sm mt-2">AFK RPG</p>
          </div>
        </div>
      )}

      {/* Overlay pre-boss — pausa antes del boss */}
      {showBossOverlay && activeTab === 'map' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-red-600 rounded-xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="text-5xl mb-4">⚔️</div>
            <h2 className="text-red-400 font-bold text-2xl mb-2">¡Atención!</h2>
            <p className="text-white font-semibold text-lg mb-1">
              Wave {gameState.currentWave} — Boss
            </p>
            <p className="text-gray-300 text-sm mb-6">
              ¿Listo para enfrentar al Boss?
              <br />
              <span className="text-yellow-400 text-xs">
                Si mueres, volverás a la wave {Math.floor((gameState.currentWave - 1) / 10) * 10 + 1}
              </span>
            </p>
            <button
              onClick={handleBossConfirm}
              className="w-full py-3 bg-red-600 active:bg-red-800 text-white font-bold text-lg rounded-lg transition-colors"
            >
              ¡Enfrentar al Boss!
            </button>
          </div>
        </div>
      )}

      {/* Character Panel */}
      {activeTab === 'character' && (
        <div className="panel-overlay panel-overlay-right bg-gray-900/95 border-gray-700 sm:border-l overflow-y-auto">
          <CharacterPanel />
        </div>
      )}

      {/* Inventory Panel */}
      {activeTab === 'inventory' && (
        <div className="panel-overlay panel-overlay-left bg-gray-900/95 border-gray-700 sm:border-r overflow-y-auto">
          <InventoryPanel />
        </div>
      )}

      {/* Full Screen Content for Map and Settings */}
      {!showSidePanel && (
        <div className="absolute top-12 left-0 right-0 bottom-14 overflow-y-auto">
          {activeTab === 'map' && (
            <div className="absolute top-4 left-4 z-10">
              <MapPanel />
            </div>
          )}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      )}

      {/* Offline rewards modal */}
      {offlineRewards && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60">
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="text-4xl mb-3">🌙</div>
            <h2 className="text-yellow-400 font-bold text-xl mb-4">¡Recompensas Offline!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-yellow-300 text-2xl font-bold">+{offlineRewards.xp} XP</p>
              <p className="text-yellow-500 text-2xl font-bold">+{offlineRewards.gold} 🪙</p>
            </div>
            <button
              onClick={() => setOfflineRewards(null)}
              className="w-full py-3 bg-yellow-600 active:bg-yellow-800 text-white font-bold text-lg rounded-lg transition-colors"
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
};

export default AFKRPGGame;

