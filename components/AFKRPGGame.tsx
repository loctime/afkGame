'use client';

import React, { useEffect, useState } from 'react';
import AFKRPGGame from './game/AFKRPGGame';
import { useGameStore } from '../stores/gameStore';
import { generateInitialItems } from '../utils/itemGenerator';

export default function AFKRPGApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      // Add some initial items for testing
      setTimeout(() => {
        if (useGameStore.getState().inventory.length === 0) {
          const items = generateInitialItems();
          items.forEach(item => useGameStore.getState().addItem(item));
        }
        setIsInitialized(true);
      }, 1000);
    }
  }, [isInitialized]);
  
  return (
    <div className="min-h-screen bg-gray-900">
      <AFKRPGGame />
    </div>
  );
}