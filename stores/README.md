# Game Store - Estructura Refactorizada

Este directorio contiene el store del juego refactorizado en módulos más pequeños y manejables.

## Estructura de Archivos

### `gameStore.ts`
Archivo principal que combina todos los módulos y crea el store de Zustand.

### `types.ts`
Define la interfaz `GameStore` que describe toda la estructura del store.

### `initialState.ts`
Contiene todos los valores iniciales del estado del juego:
- `initialPlayer`: Estado inicial del jugador
- `initialGameState`: Estado inicial del juego
- `initialRenderState`: Estado inicial de renderizado
- `initialEquipment`: Equipamiento inicial
- `initialSkills`: Habilidades iniciales

### `playerActions.ts`
Acciones relacionadas con el jugador:
- `updatePlayerStats`: Actualizar estadísticas del jugador
- `levelUp`: Subir de nivel
- `gainXp`: Ganar experiencia
- `takeDamage`: Recibir daño
- `heal`: Curar al jugador

### `gameStateActions.ts`
Acciones relacionadas con el estado del juego:
- `setWave`: Establecer la oleada actual
- `startBossFight`: Iniciar pelea de jefe
- `winBossFight`: Ganar pelea de jefe
- `loseBossFight`: Perder pelea de jefe
- `toggleAfk`: Alternar modo AFK

### `inventoryActions.ts`
Acciones relacionadas con inventario y equipamiento:
- `addItem`: Agregar item al inventario
- `equipItem`: Equipar un item
- `unequipItem`: Desequipar un item
- `autoEquipAll`: Equipar automáticamente todos los items

### `skillsActions.ts`
Acciones relacionadas con habilidades:
- `addSkill`: Agregar nueva habilidad
- `upgradeSkill`: Mejorar habilidad
- `useSkill`: Usar habilidad
- `updateSkillCooldowns`: Actualizar cooldowns

### `persistenceActions.ts`
Acciones relacionadas con persistencia de datos:
- `saveGame`: Guardar partida
- `loadGame`: Cargar partida
- `calculateOfflineRewards`: Calcular recompensas offline

## Beneficios de la Refactorización

1. **Mantenibilidad**: Cada módulo tiene una responsabilidad específica
2. **Legibilidad**: Código más fácil de leer y entender
3. **Testabilidad**: Cada módulo puede ser testeado independientemente
4. **Reutilización**: Los módulos pueden ser reutilizados en otros contextos
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar otros módulos

## Uso

```typescript
import { useGameStore } from './stores/gameStore';

// En un componente
const { player, gainXp, equipItem } = useGameStore();
```

## Migración

La refactorización mantiene la misma API pública, por lo que no es necesario cambiar el código existente que usa el store.
