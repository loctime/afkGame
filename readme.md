# 🎮 AFK RPG Game

Un juego RPG automático infinito construido con Next.js 14, PixiJS y TypeScript.

## 🚀 Características

- **Sistema AFK**: Combate automático con recompensas offline
- **Progresión Infinita**: Oleadas de enemigos + Bosses cada 10 niveles
- **Inventario Completo**: Armas, armaduras, runas y mascotas
- **Sistema de Stats**: STR, DEX, INT, VIT con puntos distribuibles
- **Persistencia Local**: Guardado automático con IndexedDB
- **Responsive Mobile**: Optimizado para dispositivos móviles
- **Bajo Consumo**: Renderizado eficiente con PixiJS
- **Interfaz Compacta**: Información del área en dropdown para mejor uso del espacio

## 🎯 Gameplay

### Sistema de Oleadas
- **Oleadas 1-9**: Enemigos automáticos
- **Oleada 10**: Boss (botón manual)
- **Oleadas 11-19**: Enemigos automáticos
- **Oleada 20**: Boss (botón manual)
- **Progresión**: Si ganas boss → siguiente rango, si pierdes → reset al inicio del rango

### Progresión del Jugador
- **Niveles Infinitos**: XP acumulativa
- **Stats Distribuibles**: STR, DEX, INT, VIT
- **Reset System**: -100 niveles manteniendo stats asignados
- **Equipamiento**: Arma, armadura, 3 runas
- **Mascotas**: Sistema de compañeros

## 🛠️ Tecnologías

- **Next.js 14**: Framework React con App Router
- **PixiJS 7**: Motor gráfico 2D para sprites y animaciones
- **Zustand**: Estado global del juego
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos responsive
- **IndexedDB**: Persistencia local robusta

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd afk-rpg-game

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🎮 Cómo Jugar

1. **Iniciar Combate**: Presiona "Start Wave" para comenzar
2. **Modo AFK**: Activa "AFK ON" para combate automático
3. **Gestionar Stats**: Usa puntos de habilidad en la pestaña "Character"
4. **Equipar Items**: Gestiona inventario en la pestaña "Inventory"
5. **Luchar Bosses**: Presiona "BOSS" cuando aparezca para enfrentar al jefe

## 📁 Estructura del Proyecto

```
afk-rpg-game/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   └── AFKRPGGame.tsx     # Componente principal del juego
├── core/                  # Lógica del juego (futuro)
│   ├── systems/           # Sistemas: combat, xp, drops
│   ├── entities/          # Entidades: player, enemy, item
│   └── balance/           # Configuración de balance
├── assets/                # Sprites y recursos (futuro)
└── public/                # Archivos estáticos
```

## 🔧 Configuración

### Variables de Entorno
```env
# No se requieren variables de entorno para el MVP
```

### Personalización
- **Balance**: Edita las constantes en el componente principal
- **Sprites**: Reemplaza los placeholders con sprites reales
- **Sonidos**: Agrega efectos de sonido (futuro)

## 🚀 Roadmap

### Fase 1: MVP (✅ Completado)
- [x] Sistema de combate básico
- [x] Progresión de oleadas
- [x] UI responsive
- [x] Persistencia local

### Fase 2: Características Avanzadas
- [ ] Sistema de mascotas
- [ ] Habilidades especiales
- [ ] Múltiples mapas
- [ ] Sistema de logros

### Fase 3: Polish & Optimización
- [ ] Sprites pixel-art
- [ ] Efectos de partículas
- [ ] Sonidos y música
- [ ] Animaciones fluidas

### Fase 4: Multiplayer (Futuro)
- [ ] Servidor de ticks
- [ ] Sincronización entre dispositivos
- [ ] Rankings y competencia
- [ ] Anti-cheat

## 🐛 Troubleshooting

### Problemas Comunes

**Error de PixiJS en desarrollo:**
```bash
# Asegúrate de que el navegador soporte WebGL
# Verifica la consola para errores específicos
```

**Error de estructura circular en JSON:**
```bash
# El estado de renderizado (renderState) está separado del estado serializable
# Los objetos de PIXI.js no se guardan para evitar referencias circulares
```

**Problemas de rendimiento en móvil:**
```bash
# Reduce la resolución en dispositivos low-end
# Desactiva efectos visuales pesados
```

**Problemas de guardado:**
```bash
# Verifica que IndexedDB esté habilitado
# Limpia el almacenamiento del navegador si es necesario
```

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o sugerencias:
- Abre un issue en GitHub
- Contacta al desarrollador principal

---

**¡Disfruta jugando AFK RPG! 🎮✨**