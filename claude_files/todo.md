# 📋 TODO - AFK RPG Game

## 🚀 Fase 1: MVP (✅ Completado)

- [x] Setup Next.js 14 + TypeScript
- [x] Integración PixiJS
- [x] Estado global con Zustand
- [x] Sistema de combate básico
- [x] Progresión de oleadas (1-9 → Boss 10)
- [x] UI responsive para móvil
- [x] Persistencia con IndexedDB
- [x] Sistema de stats (STR, DEX, INT, VIT)
- [x] Inventario básico
- [x] Sistema de equipamiento

## 🎯 Fase 2: Características Avanzadas

### Sistema de Mascotas
- [ ] Crear interfaz Pet con tipos
- [ ] Implementar sistema de captura de mascotas
- [ ] Mascotas activas que ayudan en combate
- [ ] Sistema de evolución de mascotas
- [ ] UI para gestionar mascotas

### Habilidades Especiales
- [ ] 3 habilidades activas con cooldown
- [ ] Sistema de mana y regeneración
- [ ] Efectos visuales para habilidades
- [ ] Desbloqueo de habilidades por nivel

### Sistema de Drops Mejorado
- [ ] Más variedad de items
- [ ] Sistema de crafting
- [ ] Items únicos y legendarios
- [ ] Sistema de mejora de items

### Múltiples Mapas
- [ ] Bosque (actual) - Niveles 1-50
- [ ] Cueva - Niveles 51-100
- [ ] Castillo - Niveles 101-150
- [ ] Sistema de progresión entre mapas

## 🎨 Fase 3: Polish & Optimización

### Assets Visuales
- [ ] Sprites pixel-art para personaje
- [ ] Sprites para enemigos (Goblin, Orc, Troll, Boss)
- [ ] Sprites para items y equipamiento
- [ ] Sprites para mascotas
- [ ] Efectos de partículas para combate

### Sonidos y Música
- [ ] Música de fondo para cada mapa
- [ ] Efectos de sonido para combate
- [ ] Sonidos de UI y navegación
- [ ] Sistema de audio con controles

### Animaciones
- [ ] Animaciones de ataque
- [ ] Animaciones de daño
- [ ] Animaciones de nivel up
- [ ] Transiciones suaves entre pantallas

### Optimización
- [ ] Lazy loading de componentes
- [ ] Optimización de sprites con atlases
- [ ] Compresión de assets
- [ ] Cache inteligente

## 🌐 Fase 4: Multiplayer (Futuro)

### Backend
- [ ] API REST con Next.js API routes
- [ ] Base de datos PostgreSQL
- [ ] Autenticación con NextAuth.js
- [ ] Sincronización de progreso

### Características Sociales
- [ ] Rankings globales
- [ ] Guilds/Clanes
- [ ] Chat en tiempo real
- [ ] Eventos especiales

### Anti-Cheat
- [ ] Validación de datos en servidor
- [ ] Detección de modificaciones
- [ ] Sistema de reportes
- [ ] Moderación automática

## 🔧 Mejoras Técnicas

### Arquitectura
- [ ] Separar lógica de juego en /core
- [ ] Implementar sistema ECS-lite
- [ ] Web Workers para cálculos pesados
- [ ] Service Workers para cache offline

### Testing
- [ ] Tests unitarios con Jest
- [ ] Tests de integración
- [ ] Tests E2E con Playwright
- [ ] Tests de rendimiento

### DevOps
- [ ] CI/CD con GitHub Actions
- [ ] Despliegue automático
- [ ] Monitoreo de errores
- [ ] Analytics de uso

## 📱 Características Móviles

### PWA
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Instalación en home screen
- [ ] Notificaciones push

### Optimización Móvil
- [ ] Touch controls optimizados
- [ ] Gestos personalizados
- [ ] Modo landscape/portrait
- [ ] Optimización de batería

## 🎮 Gameplay

### Balance
- [ ] Ajustar fórmulas de daño
- [ ] Balancear drops y XP
- [ ] Sistema de prestigio
- [ ] Eventos temporales

### Contenido
- [ ] Más tipos de enemigos
- [ ] Bosses únicos
- [ ] Quests y misiones
- [ ] Logros y recompensas

## 📊 Analytics y Métricas

- [ ] Tracking de eventos
- [ ] Métricas de retención
- [ ] Análisis de comportamiento
- [ ] A/B testing

## 🔒 Seguridad

- [ ] Validación de entrada
- [ ] Sanitización de datos
- [ ] Rate limiting
- [ ] Protección contra XSS/CSRF

---

## 🎯 Prioridades Actuales

1. **Sistema de Mascotas** - Implementar mascotas básicas
2. **Habilidades** - 3 habilidades activas
3. **Sprites** - Reemplazar placeholders con sprites reales
4. **Optimización** - Mejorar rendimiento en móvil

## 📝 Notas de Desarrollo

- Mantener compatibilidad con dispositivos low-end
- Priorizar experiencia móvil
- Código limpio y bien documentado
- Testing continuo en diferentes dispositivos
