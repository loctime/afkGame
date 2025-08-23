# 🎮 AFK RPG - Juego de Rol Automático

Un juego de rol automático (AFK) desarrollado con **Next.js**, **PIXI.js** y **Zustand**. Combina gráficos 2D con un sistema de combate automático, progresión de personaje y gestión de recursos.

![AFK RPG Game](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PIXI.js](https://img.shields.io/badge/PIXI.js-7.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🚀 Características Principales

### 🎯 **Sistema de Combate Automático**
- **Combate AFK**: El personaje lucha automáticamente contra enemigos
- **Sistema de Skills**: 3 habilidades iniciales con cooldowns y costos de mana
- **IA Inteligente**: Prioriza curación cuando la salud está baja
- **Progresión de Olas**: Enemigos más difíciles en cada ola

### 🎨 **Gráficos y Efectos Visuales**
- **Sprites Animados**: Personaje alien con 4 animaciones (idle, run, hit, dead)
- **Fondos Parallax**: 4 fondos diferentes con efecto de profundidad
- **Monstruos Dinámicos**: 50 sprites de monstruos que cambian según el nivel
- **Efectos Visuales**: Brillo, resplandor y efectos de color según el estado

### 👤 **Sistema de Personaje**
- **Estadísticas**: Fuerza, Destreza, Inteligencia, Vitalidad
- **Niveles**: Sistema de experiencia con puntos de habilidad
- **Recursos**: Salud y Mana con regeneración automática
- **Equipamiento**: Sistema completo de armas, armaduras y artefactos

### 🎒 **Inventario y Equipamiento**
- **16 Slots de Equipo**: Organizados en 4 filas
- **Sistema de Rareza**: Common, Rare, Epic, Legendary
- **Auto-Equipamiento**: Función para equipar automáticamente el mejor equipo
- **Gestión de Items**: Inventario con capacidad ilimitada

### 🎪 **Sistema de Skills**
- **Ataque Básico**: Sin costo de mana, sin cooldown
- **Bola de Fuego**: Daño mágico con costo de mana
- **Curación**: Restauración de salud automática
- **Mejoras**: Sistema de niveles para cada habilidad

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Gráficos**: PIXI.js 7.3 (WebGL/Canvas)
- **Estado**: Zustand (Gestión de estado)
- **Estilos**: Tailwind CSS
- **Persistencia**: IndexedDB (idb-keyval)
- **Animaciones**: PIXI.js AnimatedSprite

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd juegueteclaude
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 🎮 Cómo Jugar

### **Inicio Rápido**
1. **Crear Personaje**: El juego inicia con un alien nivel 1
2. **Activar AFK**: Presiona el botón "Start AFK" para comenzar
3. **Observar Combate**: El personaje luchará automáticamente
4. **Gestionar Recursos**: Usa el panel de personaje para mejorar stats

### **Sistema de Olas**
- **Olas 1-9**: Enemigos normales, progresión automática
- **Ola 10**: Jefe de fase, requiere confirmación manual
- **Fases**: Cada 10 olas forman una fase completa

### **Gestión de Recursos**
- **Puntos de Habilidad**: Se obtienen al subir de nivel
- **Oro**: Se gana derrotando enemigos
- **Experiencia**: Progresión automática en combate

## 🎨 Assets y Recursos

### **Sprites del Personaje**
```
assets/sprites/Alien/Without Light Outline/Fames/
├── Alien_IDLE_1-4.png    # Animación de reposo
├── Alien_RUN_1-4.png     # Animación de ataque
├── Alien_HIT_1-2.png     # Animación de daño
└── Alien_DEAD.png        # Animación de muerte
```

### **Monstruos**
```
assets/sprites/monsters/
├── PNG/Icon1-48.png      # 48 monstruos principales
└── Bonus/PNG/Icon49-50.png # 2 monstruos especiales
```

### **Fondos**
```
assets/background/PNG/
├── background 1/         # Fondo 1 con 5 capas parallax
├── background 2/         # Fondo 2 con 5 capas parallax
├── background 3/         # Fondo 3 con 5 capas parallax
└── background 4/         # Fondo 4 con 5 capas parallax
```

### **Skills**
```
assets/skills/
├── PNG/Icon1-48.png      # 48 iconos de habilidades
└── Bonus/PNG/Icon49-50.png # 2 iconos especiales
```

## 🏗️ Estructura del Proyecto

```
juegueteclaude/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── game/             # Lógica del juego
│   │   └── GameEngine.ts # Motor principal con PIXI.js
│   ├── panels/           # Paneles de UI
│   │   ├── CharacterPanel.tsx
│   │   ├── InventoryPanel.tsx
│   │   ├── MapPanel.tsx
│   │   └── SettingsPanel.tsx
│   └── ui/               # Componentes de UI
│       ├── BottomNav.tsx
│       ├── GameHUD.tsx
│       ├── SkillsPanel.tsx
│       └── BackgroundSelector.tsx
├── stores/               # Gestión de estado
│   └── gameStore.ts      # Store principal con Zustand
├── types/                # Tipos TypeScript
│   └── game.ts           # Interfaces del juego
├── utils/                # Utilidades
│   └── itemGenerator.ts  # Generador de items
├── assets/               # Assets del juego
│   ├── background/       # Fondos con parallax
│   ├── sprites/          # Sprites de personajes y monstruos
│   └── skills/           # Iconos de habilidades
└── public/               # Assets públicos
    └── assets/           # Copia de assets para web
```

## 🎯 Características Técnicas

### **Motor de Juego (GameEngine.ts)**
- **PIXI.js Application**: Renderizado WebGL/Canvas
- **Game Loop**: 60 FPS con delta time
- **Sprite Management**: Gestión automática de sprites
- **Animation System**: Sistema de animaciones basado en frames
- **Parallax Backgrounds**: Fondos con efecto de profundidad

### **Sistema de Estado (gameStore.ts)**
- **Zustand Store**: Estado global del juego
- **Persistencia**: Guardado automático en IndexedDB
- **Offline Rewards**: Recompensas por tiempo offline
- **Skill Management**: Sistema completo de habilidades

### **UI Components**
- **Responsive Design**: Adaptable a diferentes pantallas
- **Real-time Updates**: Actualización en tiempo real
- **Interactive Panels**: Paneles modales y desplegables
- **Visual Feedback**: Indicadores de estado y progreso

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
# Subir carpeta .next a Netlify
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎮 Controles

### **Teclado**
- **Espacio**: Activar/Desactivar AFK
- **ESC**: Cerrar paneles
- **F11**: Pantalla completa

### **Mouse**
- **Click**: Interactuar con UI
- **Scroll**: Navegar en paneles
- **Drag**: Mover elementos (futuro)

## 🔧 Configuración

### **Variables de Entorno**
```env
NEXT_PUBLIC_GAME_VERSION=1.0.0
NEXT_PUBLIC_DEBUG_MODE=false
```

### **Configuración de PIXI.js**
```typescript
// En GameEngine.ts
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight - 120,
  backgroundColor: 0x2a2a4a,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});
```

## 🐛 Solución de Problemas

### **Problemas Comunes**

1. **Assets no cargan**
   - Verificar que los archivos estén en `public/assets/`
   - Revisar rutas en el código

2. **Rendimiento lento**
   - Reducir resolución en dispositivos móviles
   - Desactivar efectos visuales pesados

3. **Guardado no funciona**
   - Verificar permisos de IndexedDB
   - Limpiar caché del navegador

### **Debug Mode**
```typescript
// Activar en gameStore.ts
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
```

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

## 📝 Roadmap

### **Versión 1.1**
- [ ] Sistema de misiones
- [ ] Más tipos de enemigos
- [ ] Efectos de sonido
- [ ] Música de fondo

### **Versión 1.2**
- [ ] Sistema de clanes
- [ ] PvP automático
- [ ] Eventos especiales
- [ ] Logros

### **Versión 2.0**
- [ ] Modo multijugador
- [ ] Sistema de comercio
- [ ] Crafting avanzado
- [ ] Dungeons automáticos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- **PIXI.js Team** por el motor de gráficos
- **Zustand** por la gestión de estado
- **Next.js Team** por el framework
- **Comunidad de sprites** por los assets

---

⭐ **¡Si te gusta el proyecto, dale una estrella!**