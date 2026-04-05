import { Player, GameState, RenderState, Equipment, Skill } from '../types/game';

export const initialPlayer: Player = {
  id: 'player1',
  level: 1,
  xp: 0,
  xpToNext: 100,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  gold: 0,
  stats: { str: 10, dex: 10, int: 10, vit: 10 },
  unallocatedPoints: 0,
};

export const initialGameState: GameState = {
  currentWave: 1,
  currentPhase: 1,
  isInBossWave: false,
  isFighting: false,
  isAfk: true, // Activar AFK por defecto
  lastPlayTime: Date.now(),
  totalPlayTime: 0,
  currentBackground: 1,
  activeStatusEffects: [],
};

export const initialRenderState: RenderState = {
  enemies: [],
};

export const initialEquipment: Equipment = {
  // Primera fila
  pet: undefined,
  necklace: undefined,
  helmet: undefined,
  wings: undefined,
  
  // Segunda fila
  weapon: undefined,
  bracelet1: undefined,
  chest: undefined,
  bracelet2: undefined,
  shield: undefined,
  
  // Tercera fila
  gloves: undefined,
  ring1: undefined,
  pants: undefined,
  ring2: undefined,
  boots: undefined,
  
  // Cuarta fila
  artifact1: undefined,
  artifact2: undefined,
};

export const initialSkills: Skill[] = [
  {
    id: 'basic_attack',
    name: 'Ataque Básico',
    icon: '/assets/skills/Icon1.png',
    type: 'attack',
    damage: 25,
    manaCost: 0,
    cooldown: 0,
    currentCooldown: 0,
    description: 'Un ataque básico con tu arma',
    level: 1,
    maxLevel: 10
  },
  {
    id: 'fire_ball',
    name: 'Bola de Fuego',
    icon: '/assets/skills/Icon2.png',
    type: 'attack',
    damage: 50,
    manaCost: 20,
    cooldown: 3,
    currentCooldown: 0,
    description: 'Lanza una bola de fuego que quema a los enemigos',
    level: 1,
    maxLevel: 5
  },
  {
    id: 'ice_shard',
    name: 'Fragmento de Hielo',
    icon: '/assets/skills/Icon4.png',
    type: 'attack',
    damage: 40,
    manaCost: 15,
    cooldown: 2,
    currentCooldown: 0,
    description: 'Lanza un fragmento de hielo que congela al enemigo',
    level: 1,
    maxLevel: 5
  },
  {
    id: 'lightning_bolt',
    name: 'Rayo',
    icon: '/assets/skills/Icon5.png',
    type: 'attack',
    damage: 60,
    manaCost: 30,
    cooldown: 4,
    currentCooldown: 0,
    description: 'Invoca un rayo que golpea instantáneamente',
    level: 1,
    maxLevel: 5
  },
  {
    id: 'heal',
    name: 'Curación',
    icon: '/assets/skills/Icon3.png',
    type: 'heal',
    heal: 30,
    manaCost: 25,
    cooldown: 5,
    currentCooldown: 0,
    description: 'Restaura tu salud',
    level: 1,
    maxLevel: 5
  }
];
