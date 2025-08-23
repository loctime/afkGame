# Archivos necesarios para el proyecto Next.js completo

## 📁 Estructura del proyecto:
```
afk-rpg-game/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── AFKRPGGame.tsx (el archivo principal)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## 📄 **1. app/layout.tsx**
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFK RPG Game',
  description: 'Un juego RPG automático increíble',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
```

## 📄 **2. app/page.tsx**
```tsx
import AFKRPGGame from '../components/AFKRPGGame';

export default function Home() {
  return <AFKRPGGame />;
}
```

## 📄 **3. app/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 26, 26, 46;
  --background-end-rgb: 17, 17, 35;
}

/* Disable text selection for game elements */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Custom scrollbar for mobile */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 2px;
}
```

## 📄 **4. tsconfig.json**
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 📄 **5. tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}
```

## 📄 **6. postcss.config.js**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 📄 **7. next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Configuración para PIXI.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
```

## 🚀 **Comandos para crear el proyecto:**

```bash
# 1. Crear directorio y archivos
mkdir afk-rpg-game
cd afk-rpg-game

# 2. Inicializar package.json
npm init -y

# 3. Instalar dependencias
npm install next@14.0.0 react@^18.2.0 react-dom@^18.2.0 typescript@^5.2.2

# 4. Instalar dependencias adicionales
npm install pixi.js@^7.3.2 zustand@^4.4.7 idb-keyval@^6.2.1 lucide-react@^0.294.0

# 5. Instalar Tailwind
npm install -D tailwindcss@^3.3.0 postcss@^8.4.31 autoprefixer@^10.4.16

# 6. Configurar Tailwind
npx tailwindcss init -p

# 7. Crear estructura de carpetas
mkdir -p app components

# 8. Crear los archivos de configuración
# (copiar el contenido de arriba en cada archivo)

# 9. Ejecutar
npm run dev
```

## ⚡ **Opción Rápida - Solo copia estos archivos:**
1. **package.json** (ya lo tienes)
2. **El componente principal** (ya lo tienes) 
3. Los **6 archivos de configuración** de arriba

¿Quieres que te genere una versión simplificada que funcione con menos archivos, o prefieres tener la estructura completa de Next.js? 🤔