# 📘 Anleitung: Zwei unabhängige PWAs auf GitHub Pages hosten

Diese Anleitung erklärt, wie Sie zwei voneinander unabhängige Progressive Web Apps (PWAs) auf GitHub Pages unter derselben Top-Level-Domain (TLD) hosten können.

## 📋 Ausgangslage und Variablen

Für diese Anleitung verwenden wir folgende Variablen:

- **[[TLD_URL]]**: `https://dev0gig.github.io/`
- **[[SUBFOLDER_NAME]]**: `react-journaling`
- **[[SUBFOLDER_URL]]**: `https://dev0gig.github.io/react-journaling`

---

## 🎯 Ziel

Zwei vollständig getrennte PWAs mit:
- ✅ Separaten PWA-Scopes (ermöglicht unabhängige Installation)
- ✅ Getrennten Service Workers
- ✅ Isolierten Cookies
- ✅ Unabhängigen Manifesten

---

## 1️⃣ Hauptprojekt (PWA 1) auf der Root-Domain

### Repository: `dev0gig.github.io`
### URL: `https://dev0gig.github.io/`

### Konfiguration

#### 📄 `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',  // ← Root-Pfad für die Haupt-PWA
  plugins: [react()],
  // ... weitere Konfigurationen
});
```

#### 📄 `package.json`
```json
{
  "name": "dev0gig-main",
  "homepage": "https://dev0gig.github.io/",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist -b main",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 📄 `public/manifest.json`
```json
{
  "short_name": "Dev0Gig",
  "name": "Dev0Gig Dashboard",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

#### 📄 Cookie-Handling (z.B. in `index.tsx` oder `App.tsx`)
```typescript
// Cookies explizit auf Root-Domain setzen
document.cookie = "sessionId=abc123; path=/; SameSite=Strict";
```

#### 📄 Service Worker Registrierung
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered (Root):', registration.scope);
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}
```

### Deployment
```bash
npm install
npm run build
npm run deploy
```

---

## 2️⃣ Unterordner-Projekt (PWA 2) im Subdirectory

### Repository: `react-journaling`
### URL: `https://dev0gig.github.io/react-journaling`

### ⚠️ **KRITISCH**: PWA-Manifest Konfiguration

Die korrekte Konfiguration des Manifests ist **der Schlüssel** zur Trennung der beiden PWAs!

#### 📄 `public/manifest.json`
```json
{
  "short_name": "Journal",
  "name": "Knowledge Journal",
  "icons": [
    {
      "src": "icons/book.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "theme_color": "#201f24",
  "background_color": "#201f24"
}
```

**🔑 Wichtig:**
- `"start_url": "./"` - Relative URL zum Unterordner
- `"scope": "./"` - **Extrem wichtig!** Begrenzt die PWA auf den Unterordner
- Ohne korrekten `scope` würde die PWA den gesamten Domain-Bereich beanspruchen

#### 📄 `vite.config.ts`
```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/react-journaling/',  // ← Unterordner-Pfad
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
```

#### 📄 `package.json`
```json
{
  "name": "journaling",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "homepage": "https://dev0gig.github.io/react-journaling",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.29.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "gh-pages": "^6.3.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

#### 📄 Cookie-Handling in `index.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ⚠️ Cookies explizit auf Unterordner-Pfad setzen
document.cookie = "journalSession=xyz789; path=/react-journaling; SameSite=Strict";

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = new URL('sw.js', window.location.href);
    
    // ⚠️ Scope auf Unterordner begrenzen
    navigator.serviceWorker.register(swUrl.href, { 
      scope: '/react-journaling/' 
    })
      .then(registration => {
        console.log('SW registered (Subfolder):', registration.scope);
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 📄 `sw.js` - Service Worker Anpassungen

**⚠️ WICHTIG:** Die `sw.js` Datei **MUSS** im `public/` Ordner liegen, damit Vite sie korrekt in den Build kopiert!

Der Service Worker muss die Unterordner-Pfade berücksichtigen:

```javascript
const CACHE_NAME = 'knowledge-journal-cache-v2';
const BASE_PATH = '/react-journaling';

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/icons/book.png`,
  `${BASE_PATH}/manifest.json`,
  // ... weitere Assets mit BASE_PATH
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching essential assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache assets:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Nur Requests innerhalb des Scopes behandeln
  if (!request.url.includes(BASE_PATH)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Network failed, serving from cache');
          return caches.match(`${BASE_PATH}/`);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return networkResponse;
        })
        .catch(error => {
          console.error('[Service Worker] Fetch failed:', request.url, error);
        });
      })
  );
});
```

#### 📄 `index.html` - Manifest-Link prüfen
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Knowledge Journal</title>
  
  <!-- ⚠️ Manifest-Link mit relativem Pfad -->
  <link rel="manifest" href="/react-journaling/manifest.json">
  
  <!-- PWA Meta-Tags -->
  <meta name="theme-color" content="#201f24">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
  <!-- Icon -->
  <link rel="icon" type="image/png" href="/react-journaling/icons/book.png">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>
```

### Deployment
```bash
cd /path/to/react-journaling
npm install
npm run build
npm run deploy
```

---

## 3️⃣ GitHub Pages Konfiguration

### Für das Hauptprojekt (`dev0gig.github.io`)
1. Repository Settings → Pages
2. Source: `gh-pages` branch (oder `main` branch)
3. Folder: `/ (root)`
4. Save

### Für das Unterordner-Projekt (`react-journaling`)
1. Repository Settings → Pages
2. Source: `gh-pages` branch
3. Folder: `/ (root)`
4. Save

**Wichtig:** Das `gh-pages` Package deployed automatisch in den `gh-pages` Branch.

---

## 4️⃣ Fehlerbehebung und Testing

### Problem: PWA wird nicht als separate App erkannt

**Lösung:**
1. **Manifest-Scope prüfen**: Stellen Sie sicher, dass `"scope": "./"` in der `manifest.json` des Unterordners gesetzt ist
2. **Browser-Cache leeren**: 
   - Chrome: DevTools → Application → Clear storage
   - Firefox: DevTools → Storage → Clear all
3. **Service Worker deregistrieren**:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister());
   });
   ```
4. **Root-PWA deinstallieren**: Wenn die Root-PWA bereits installiert ist, deinstallieren Sie diese vor der Installation der Subfolder-PWA

### Problem: Assets werden nicht geladen (404 Fehler)

**Lösung:**
- Prüfen Sie, ob alle Pfade in `vite.config.ts` korrekt mit `/react-journaling/` beginnen
- Überprüfen Sie die `base`-Konfiguration in Vite
- Testen Sie lokal mit `npm run preview` nach dem Build

### Problem: Service Worker registriert sich nicht

**Lösung:**
- Prüfen Sie den Scope in der Service Worker Registrierung
- Stellen Sie sicher, dass `sw.js` im `public` Ordner liegt oder korrekt kopiert wird
- Überprüfen Sie die Browser-Konsole auf Fehler

### Testing Checklist

- [ ] Beide PWAs können unabhängig installiert werden
- [ ] Service Worker registriert sich mit korrektem Scope
- [ ] Cookies werden nicht zwischen den PWAs geteilt
- [ ] Offline-Funktionalität funktioniert für beide PWAs
- [ ] Assets laden korrekt (keine 404 Fehler)
- [ ] Manifest wird korrekt erkannt (Chrome DevTools → Application → Manifest)

---

## 5️⃣ Zusammenfassung der kritischen Punkte

### ✅ Für die Root-PWA (`dev0gig.github.io`)
- `base: '/'` in `vite.config.ts`
- `"scope": "/"` in `manifest.json`
- `path=/` für Cookies
- Service Worker Scope: `{ scope: '/' }`

### ✅ Für die Subfolder-PWA (`react-journaling`)
- `base: '/react-journaling/'` in `vite.config.ts`
- `"scope": "./"` in `manifest.json` ← **KRITISCH!**
- `path=/react-journaling` für Cookies
- Service Worker Scope: `{ scope: '/react-journaling/' }`
- Alle Asset-Pfade im Service Worker mit `BASE_PATH` präfixen

---

## 6️⃣ Verallgemeinerte Vorlage

Um diese Anleitung für andere Projekte zu verwenden, ersetzen Sie:

| Variable | Beispiel | Ihre Werte |
|----------|----------|------------|
| `[[TLD_URL]]` | `https://dev0gig.github.io/` | Ihre Root-Domain |
| `[[SUBFOLDER_NAME]]` | `react-journaling` | Ihr Unterordner-Name |
| `[[SUBFOLDER_URL]]` | `https://dev0gig.github.io/react-journaling` | Vollständige Subfolder-URL |

---

## 📚 Weitere Ressourcen

- [Vite Base Path Configuration](https://vitejs.dev/config/shared-options.html#base)
- [PWA Manifest Specification](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Erstellt am:** 2025-11-21  
**Version:** 1.0
