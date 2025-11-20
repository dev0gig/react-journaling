# ✅ PWA Deployment Checklist für Subfolder

## Schnell-Referenz für `react-journaling` auf `dev0gig.github.io/react-journaling`

### 🔧 Konfigurationsdateien

#### ✅ `vite.config.ts`
```typescript
base: '/react-journaling/',
```

#### ✅ `package.json`
```json
"homepage": "https://dev0gig.github.io/react-journaling",
```

#### ✅ `public/manifest.json`
```json
{
  "start_url": "./",
  "scope": "./",    // ← KRITISCH für separate PWA!
  // ...
}
```

#### ✅ `index.html`
```html
<link rel="manifest" href="./manifest.json" />
<link rel="icon" href="./icons/book.png" />
```

#### ✅ `index.tsx`
```typescript
// Cookie mit Subfolder-Pfad
document.cookie = "cookieName=value; path=/react-journaling";

// Service Worker mit Scope
navigator.serviceWorker.register(swUrl.href, { 
  scope: '/react-journaling/' 
});
```

#### ✅ `sw.js`
```javascript
const BASE_PATH = '/react-journaling';

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  // ...
];

// In fetch event:
if (!request.url.includes(BASE_PATH)) {
  return;
}
```

---

## 🚀 Deployment-Schritte

```bash
# 1. Dependencies installieren (falls noch nicht geschehen)
npm install

# 2. Build erstellen
npm run build

# 3. Auf GitHub Pages deployen
npm run deploy
```

---

## 🧪 Testing nach Deployment

### Browser DevTools öffnen (F12)

#### 1. Manifest prüfen
- **Application** → **Manifest**
- Prüfen: `start_url` und `scope` sind korrekt gesetzt

#### 2. Service Worker prüfen
- **Application** → **Service Workers**
- Prüfen: Scope ist `/react-journaling/`
- Status sollte "activated and running" sein

#### 3. Cache prüfen
- **Application** → **Cache Storage**
- Prüfen: `knowledge-journal-cache-v2` existiert
- Prüfen: Assets haben `/react-journaling/` Präfix

#### 4. Cookies prüfen
- **Application** → **Cookies**
- Prüfen: Cookie-Pfad ist `/react-journaling`

#### 5. Console prüfen
- Keine Fehler
- "Service Worker registered successfully with scope: /react-journaling/"

---

## 🐛 Häufige Probleme

### Problem: PWA wird nicht als installierbar erkannt
**Lösung:**
1. Prüfen Sie `"scope": "./"` in `manifest.json`
2. Browser-Cache leeren (DevTools → Application → Clear storage)
3. Service Worker deregistrieren und neu laden

### Problem: 404 Fehler bei Assets
**Lösung:**
1. Prüfen Sie `base: '/react-journaling/'` in `vite.config.ts`
2. Prüfen Sie relative Pfade in `index.html` (`./` statt `/`)
3. Rebuild: `npm run build`

### Problem: Service Worker registriert sich nicht
**Lösung:**
1. Prüfen Sie Console auf Fehler
2. Prüfen Sie Scope-Parameter in `index.tsx`
3. Stellen Sie sicher, dass `sw.js` im `public/` Ordner liegt

### Problem: Cookies werden mit Root-PWA geteilt
**Lösung:**
1. Prüfen Sie Cookie-Pfad: `path=/react-journaling`
2. Löschen Sie alle Cookies und testen Sie erneut

---

## 🔄 Bei Änderungen

Nach Code-Änderungen:

```bash
# 1. Rebuild
npm run build

# 2. Redeploy
npm run deploy

# 3. Im Browser:
# - Hard Reload (Ctrl+Shift+R)
# - Service Worker deregistrieren
# - Cache leeren
```

---

## 📱 PWA Installation testen

1. Öffnen Sie `https://dev0gig.github.io/react-journaling`
2. Browser sollte "Install App" Button anzeigen
3. Installieren Sie die PWA
4. Öffnen Sie die installierte App
5. Prüfen Sie, dass sie unabhängig von der Root-PWA läuft

---

## ✨ Erfolgs-Kriterien

- ✅ PWA kann unabhängig installiert werden
- ✅ Service Worker Scope ist `/react-journaling/`
- ✅ Cookies sind auf `/react-journaling` begrenzt
- ✅ Keine 404 Fehler bei Assets
- ✅ Offline-Funktionalität funktioniert
- ✅ Manifest wird korrekt erkannt
- ✅ Keine Konflikte mit Root-PWA

---

**Letzte Aktualisierung:** 2025-11-21
