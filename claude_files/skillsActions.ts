import { Skill } from '../types/game';
import { GameStore } from './types';

export const createSkillsActions = (set: any, get: () => GameStore) => ({
  addSkill: (skill: Skill) => set((state: GameStore) => ({
    skills: [...state.skills, skill]
  })),
  
  upgradeSkill: (skillId: string) => set((state: GameStore) => {
    const skillIndex = state.skills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) return {};
    
    const skill = state.skills[skillIndex];
    if (skill.level >= skill.maxLevel) return {};
    
    const newSkills = [...state.skills];
    newSkills[skillIndex] = {
      ...skill,
      level: skill.level + 1,
      damage: skill.damage ? skill.damage + (skill.damage * 0.2) : skill.damage,
      heal: skill.heal ? skill.heal + (skill.heal * 0.2) : skill.heal,
      manaCost: skill.manaCost + (skill.manaCost * 0.1)
    };
    
    return { skills: newSkills };
  }),
  
  useSkill: (skillId: string) => {
    const state = get();
    const skill = state.skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0) return false;
    
    if (state.player.mp < skill.manaCost) return false;
    
    set((state: GameStore) => {
      const skillIndex = state.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) return {};
      
      const newSkills = [...state.skills];
      newSkills[skillIndex] = {
        ...skill,
        currentCooldown: skill.cooldown
      };
      
      let playerUpdate: Partial<typeof state.player> = {
        mp: state.player.mp - skill.manaCost
      };
      
      // Aplicar efectos del skill
      if (skill.type === 'heal' && skill.heal) {
        playerUpdate = {
          ...playerUpdate,
          hp: Math.min(state.player.maxHp, state.player.hp + skill.heal)
        };
      }
      
      return {
        skills: newSkills,
        player: {
          ...state.player,
          ...playerUpdate
        }
      };
    });
    
    return true;
  },
  
  updateSkillCooldowns: (deltaTime: number) => set((state: GameStore) => {
    const newSkills = state.skills.map(skill => ({
      ...skill,
      currentCooldown: Math.max(0, skill.currentCooldown - deltaTime)
    }));
    
    return { skills: newSkills };
  }),
});
