import React from 'react';
import { useGameStore } from '../../stores/gameStore';

export const SkillsPanel: React.FC = () => {
  const { skills, upgradeSkill, player } = useGameStore();

  const handleUpgrade = (skillId: string) => {
    upgradeSkill(skillId);
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'attack': return 'text-red-400';
      case 'heal': return 'text-green-400';
      case 'buff': return 'text-blue-400';
      case 'debuff': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getSkillTypeName = (type: string) => {
    switch (type) {
      case 'attack': return 'Ataque';
      case 'heal': return 'Curación';
      case 'buff': return 'Mejora';
      case 'debuff': return 'Debilitar';
      default: return 'Otro';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-4">🎯 Habilidades Activas</h3>
      
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              {/* Icono del skill */}
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              {/* Información del skill */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">{skill.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getSkillTypeColor(skill.type)}`}>
                    {getSkillTypeName(skill.type)}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mt-1">{skill.description}</p>
                
                <div className="flex items-center space-x-3 flex-wrap gap-y-1 mt-2 text-xs text-gray-400">
                  {skill.damage && (
                    <span>Daño: {Math.round(skill.damage)}</span>
                  )}
                  {skill.heal && (
                    <span>Curación: {Math.round(skill.heal)}</span>
                  )}
                  <span>Mana: {skill.manaCost}</span>
                  {skill.cooldown > 0 && (
                    <span>CD: {skill.cooldown}s</span>
                  )}
                </div>
                
                {/* Cooldown actual */}
                {skill.currentCooldown > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((skill.cooldown - skill.currentCooldown) / skill.cooldown) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-red-400">
                      En cooldown: {skill.currentCooldown.toFixed(1)}s
                    </span>
                  </div>
                )}
              </div>
              
              {/* Botón de upgrade */}
              <div className="text-center">
                <div className="text-white text-sm mb-1">
                  Nivel {skill.level}/{skill.maxLevel}
                </div>
                {skill.level < skill.maxLevel && (
                  <button
                    onClick={() => handleUpgrade(skill.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors min-w-[64px]"
                  >
                    Mejorar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Información de recursos */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Mana:</span>
            <span className="text-blue-400 ml-2">{player.mp}/{player.maxMp}</span>
          </div>
          <div>
            <span className="text-gray-400">Salud:</span>
            <span className="text-green-400 ml-2">{player.hp}/{player.maxHp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
