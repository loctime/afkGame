# 🚀 Instalación Rápida - AFK RPG Game

## 📋 Requisitos Previos

- **Node.js**: Versión 18.0.0 o superior
- **npm**: Incluido con Node.js
- **Navegador**: Chrome, Firefox, Safari, Edge (con soporte WebGL)

## ⚡ Instalación en 3 Pasos

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar en Desarrollo
```bash
npm run dev
```

### 3. Abrir en Navegador
Abre tu navegador y ve a: `http://localhost:3000`

## 🎮 Cómo Jugar

1. **Iniciar**: Presiona "Start Wave" para comenzar el combate
2. **AFK Mode**: Activa "AFK ON" para combate automático
3. **Gestionar Stats**: Usa la pestaña "Character" para asignar puntos
4. **Inventario**: Equipa items en la pestaña "Inventory"
5. **Bosses**: Presiona "BOSS" cuando aparezca para enfrentar al jefe

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en modo producción
npm run lint         # Verificar código con ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 📱 Compatibilidad

- ✅ **Desktop**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- ✅ **Tablet**: iPad, Android tablets
- ⚠️ **Legacy**: IE11 no soportado

## 🐛 Solución de Problemas

### Error: "Module not found"
```bash
# Limpiar cache e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error: "WebGL not supported"
- Actualiza tu navegador
- Verifica que WebGL esté habilitado
- En Chrome: chrome://flags → "WebGL 2.0" → Enabled

### Error: "IndexedDB not available"
- Verifica que no estés en modo incógnito
- Habilita el almacenamiento local en tu navegador

### Rendimiento lento en móvil
- Cierra otras aplicaciones
- Reduce la resolución del juego
- Usa un navegador más reciente

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta .next a Netlify
```

### GitHub Pages
```bash
npm run build
npm run export
# Subir carpeta out a GitHub Pages
```

## 📞 Soporte

Si tienes problemas:
1. Verifica que Node.js sea versión 18+
2. Revisa la consola del navegador (F12)
3. Abre un issue en GitHub
4. Contacta al desarrollador

---

**¡Disfruta tu AFK RPG! 🎮✨**
