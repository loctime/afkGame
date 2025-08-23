# Motor de Juego Modular - AFK RPG

Este directorio contiene el motor de juego modular refactorizado para el AFK RPG. La estructura se ha dividido en módulos especializados para mejorar la mantenibilidad y escalabilidad del código.

## Estructura de Archivos

### Archivos Principales

- **`GameEngine.ts`** - Clase principal del motor de juego que coordina todos los managers
- **`AFKRPGGame.tsx`** - Componente React principal que integra el motor con la UI
- **`index.ts`** - Archivo de exportaciones para facilitar las importaciones

### Managers Modulares

#### `PlayerManager.ts`
- **Responsabilidad**: Gestión del jugador y sus animaciones
- **Funcionalidades**:
  - Configuración y animación del sprite del alien
  - Efectos visuales (resplandor, pulso, brillo)
  - Cambio de animaciones (idle, run, hit, dead)
  - Gestión de efectos de visibilidad

#### `EnemyManager.ts`
- **Responsabilidad**: Gestión de enemigos y su comportamiento
- **Funcionalidades**:
  - Creación de sprites de enemigos según el nivel
  - Generación de nombres y estadísticas de enemigos
  - Spawn de oleadas de enemigos
  - Movimiento de enemigos hacia el jugador

#### `SkillEffectManager.ts`
- **Responsabilidad**: Efectos visuales de habilidades y combate
- **Funcionalidades**:
  - Efectos de ataques básicos
  - Efectos de habilidades especiales (bola de fuego, fragmento de hielo, rayo)
  - Efectos de curación
  - Animaciones de impacto y explosiones

#### `BackgroundManager.ts`
- **Responsabilidad**: Gestión de fondos y efectos parallax
- **Funcionalidades**:
  - Carga de capas de fondo con parallax
  - Cambio de fondos
  - Efectos de movimiento parallax
  - Configuración de velocidad de parallax

#### `CombatManager.ts`
- **Responsabilidad**: Lógica de combate y uso de habilidades
- **Funcionalidades**:
  - Simulación de combate automático
  - Uso inteligente de habilidades
  - Gestión de daño y curación
  - Completado de oleadas

## Ventajas de la Refactorización

### 1. **Separación de Responsabilidades**
Cada manager tiene una responsabilidad específica y bien definida, lo que facilita el mantenimiento y la depuración.

### 2. **Código Más Legible**
El archivo principal `GameEngine.ts` se redujo de 1164 líneas a aproximadamente 200 líneas, siendo mucho más fácil de entender.

### 3. **Facilidad de Testing**
Cada módulo puede ser probado de forma independiente, mejorando la cobertura de pruebas.

### 4. **Escalabilidad**
Agregar nuevas funcionalidades es más sencillo, ya que se pueden crear nuevos managers o extender los existentes sin afectar otros módulos.

### 5. **Reutilización**
Los managers pueden ser reutilizados en otros proyectos o componentes.

## Uso de los Managers

### Inicialización
```typescript
// En GameEngine.ts
this.backgroundManager = new BackgroundManager(this.app, this.gameContainer);
this.playerManager = new PlayerManager(this.app, this.gameContainer);
this.enemyManager = new EnemyManager(this.app, this.gameContainer);
this.skillEffectManager = new SkillEffectManager(this.gameContainer);
this.combatManager = new CombatManager(this.store, this.skillEffectManager, this.playerManager);
```

### Acceso a Managers
```typescript
// Métodos públicos para acceder a los managers
public getPlayerManager() { return this.playerManager; }
public getEnemyManager() { return this.enemyManager; }
public getSkillEffectManager() { return this.skillEffectManager; }
public getBackgroundManager() { return this.backgroundManager; }
```

## Flujo de Datos

1. **GameEngine** coordina todos los managers
2. **CombatManager** maneja la lógica de combate usando **SkillEffectManager** y **PlayerManager**
3. **EnemyManager** actualiza las posiciones de los enemigos
4. **BackgroundManager** actualiza el parallax basado en la posición del jugador
5. **PlayerManager** maneja las animaciones y efectos del jugador

## Extensibilidad

Para agregar nuevas funcionalidades:

1. **Nuevas habilidades**: Extender `SkillEffectManager` con nuevos métodos de efectos
2. **Nuevos tipos de enemigos**: Modificar `EnemyManager` para incluir nuevos sprites y comportamientos
3. **Nuevos fondos**: Agregar métodos en `BackgroundManager` para cargar nuevos assets
4. **Nuevas animaciones**: Extender `PlayerManager` con nuevas animaciones

## Consideraciones de Rendimiento

- Cada manager se actualiza solo cuando es necesario
- Los efectos visuales se limpian automáticamente para evitar memory leaks
- El game loop principal coordina las actualizaciones de manera eficiente

## Mantenimiento

Para mantener el código:

1. **Modificaciones menores**: Trabajar directamente en el manager correspondiente
2. **Nuevas características**: Crear nuevos managers o extender los existentes
3. **Refactorización**: Los managers están diseñados para ser independientes entre sí
4. **Testing**: Cada manager puede ser probado de forma aislada
