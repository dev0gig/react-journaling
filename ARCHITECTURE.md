# 🏗️ Architektur-Übersicht: Zwei PWAs auf einer Domain

## 📊 Domain-Struktur

```
https://dev0gig.github.io/
│
├── 📱 PWA 1 (Root)
│   ├── Scope: "/"
│   ├── Service Worker: /sw.js (scope: "/")
│   ├── Cookies: path=/
│   └── Manifest: /manifest.json
│       └── "scope": "/"
│
└── 📱 PWA 2 (Subfolder)
    ├── URL: /react-journaling/
    ├── Scope: "/react-journaling/"
    ├── Service Worker: /react-journaling/sw.js (scope: "/react-journaling/")
    ├── Cookies: path=/react-journaling
    └── Manifest: /react-journaling/manifest.json
        └── "scope": "./"  (resolves to "/react-journaling/")
```

---

## 🔄 Request Flow

### Root PWA Request
```
User navigates to: https://dev0gig.github.io/
                              ↓
                    Service Worker (scope: "/")
                              ↓
                    Checks cache for "/"
                              ↓
                    Serves cached or fetches
```

### Subfolder PWA Request
```
User navigates to: https://dev0gig.github.io/react-journaling/
                              ↓
                    Service Worker (scope: "/react-journaling/")
                              ↓
                    Checks cache for "/react-journaling/"
                              ↓
                    Serves cached or fetches
```

**Wichtig:** Die Service Worker arbeiten unabhängig voneinander!

---

## 🍪 Cookie-Isolation

### Root PWA Cookies
```javascript
document.cookie = "sessionId=abc123; path=/; SameSite=Strict";
```
**Gültig für:**
- ✅ `https://dev0gig.github.io/`
- ✅ `https://dev0gig.github.io/react-journaling/` (geerbt)
- ✅ Alle Subpfade

### Subfolder PWA Cookies
```javascript
document.cookie = "journalSession=xyz789; path=/react-journaling; SameSite=Strict";
```
**Gültig für:**
- ❌ `https://dev0gig.github.io/` (NICHT verfügbar)
- ✅ `https://dev0gig.github.io/react-journaling/`
- ✅ Alle Subpfade von `/react-journaling/`

**Isolation:** Subfolder-Cookies sind NICHT für Root verfügbar!

---

## 📦 Build & Deployment Flow

### Root PWA (`dev0gig.github.io`)
```
┌─────────────────┐
│  Source Code    │
│  (Vite/React)   │
└────────┬────────┘
         │
         ├─ vite.config.ts: base: '/'
         ├─ package.json: homepage: 'https://dev0gig.github.io/'
         │
         ↓
┌─────────────────┐
│  npm run build  │
│  (dist folder)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  npm run deploy │
│  (gh-pages pkg) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  GitHub Pages   │
│  (main branch)  │
│  URL: /         │
└─────────────────┘
```

### Subfolder PWA (`react-journaling`)
```
┌─────────────────┐
│  Source Code    │
│  (Vite/React)   │
└────────┬────────┘
         │
         ├─ vite.config.ts: base: '/react-journaling/'
         ├─ package.json: homepage: 'https://dev0gig.github.io/react-journaling'
         ├─ manifest.json: scope: './'
         │
         ↓
┌─────────────────┐
│  npm run build  │
│  (dist folder)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  npm run deploy │
│  (gh-pages pkg) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  GitHub Pages   │
│  (gh-pages br.) │
│  URL: /react-   │
│       journaling│
└─────────────────┘
```

---

## 🎯 Scope-Hierarchie

```
Browser PWA Manager
│
├── PWA: "Dev0Gig Dashboard"
│   ├── Scope: https://dev0gig.github.io/
│   ├── Can control: ALL paths under /
│   └── Manifest: /manifest.json
│       └── "scope": "/"
│
└── PWA: "Knowledge Journal"
    ├── Scope: https://dev0gig.github.io/react-journaling/
    ├── Can control: ONLY /react-journaling/* paths
    └── Manifest: /react-journaling/manifest.json
        └── "scope": "./" → resolves to "/react-journaling/"
```

**Warum funktioniert das?**
- Der Browser erkennt zwei verschiedene Scopes
- Jede PWA hat ihre eigene Manifest-Datei mit unterschiedlichem Scope
- Service Worker sind auf ihren jeweiligen Scope beschränkt

---

## 🔐 Sicherheits-Isolation

| Feature | Root PWA | Subfolder PWA | Isoliert? |
|---------|----------|---------------|-----------|
| Service Worker | `/sw.js` | `/react-journaling/sw.js` | ✅ Ja |
| Cache Storage | `root-cache-v1` | `knowledge-journal-cache-v2` | ✅ Ja |
| Cookies (Subfolder) | ❌ Nicht verfügbar | ✅ Verfügbar | ✅ Ja |
| Cookies (Root) | ✅ Verfügbar | ✅ Verfügbar (geerbt) | ⚠️ Teilweise |
| LocalStorage | Geteilt (gleiche Origin) | Geteilt (gleiche Origin) | ❌ Nein |
| SessionStorage | Geteilt (gleiche Origin) | Geteilt (gleiche Origin) | ❌ Nein |
| IndexedDB | Geteilt (gleiche Origin) | Geteilt (gleiche Origin) | ❌ Nein |

**Wichtig:** 
- Cookies können durch Pfad isoliert werden
- LocalStorage, SessionStorage und IndexedDB teilen sich die gleiche Origin
- Verwenden Sie unterschiedliche Präfixe für Storage-Keys!

---

## 🧩 Manifest-Scope Auflösung

### Root PWA Manifest
```json
{
  "start_url": "/",
  "scope": "/"
}
```
**Auflösung:**
- `start_url`: `https://dev0gig.github.io/`
- `scope`: `https://dev0gig.github.io/`

### Subfolder PWA Manifest
```json
{
  "start_url": "./",
  "scope": "./"
}
```
**Manifest-URL:** `https://dev0gig.github.io/react-journaling/manifest.json`

**Auflösung:**
- `start_url`: `https://dev0gig.github.io/react-journaling/`
- `scope`: `https://dev0gig.github.io/react-journaling/`

**Warum relative Pfade?**
- `./` wird relativ zur Manifest-URL aufgelöst
- Flexibler bei Änderungen des Subfolder-Namens
- Funktioniert auch lokal beim Testen

---

## 📱 Installation Flow

### Benutzer installiert Root PWA
```
1. User besucht: https://dev0gig.github.io/
2. Browser liest: /manifest.json
3. Browser prüft: scope = "/"
4. Browser zeigt: "Install App" Button
5. User klickt: Install
6. PWA wird installiert mit Scope: "/"
```

### Benutzer installiert Subfolder PWA
```
1. User besucht: https://dev0gig.github.io/react-journaling/
2. Browser liest: /react-journaling/manifest.json
3. Browser prüft: scope = "./" → "/react-journaling/"
4. Browser vergleicht: Scope unterscheidet sich von Root PWA
5. Browser zeigt: "Install App" Button (separate Installation!)
6. User klickt: Install
7. PWA wird installiert mit Scope: "/react-journaling/"
```

**Beide PWAs können parallel installiert sein!**

---

## 🔍 Debugging-Tipps

### Chrome DevTools

#### Application Tab
```
Application
├── Manifest
│   └── Prüfen: start_url, scope, name
├── Service Workers
│   └── Prüfen: Scope, Status
├── Cache Storage
│   └── Prüfen: Cache-Name, gespeicherte URLs
└── Cookies
    └── Prüfen: Path, Domain
```

#### Console Befehle
```javascript
// Service Worker Info
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => console.log('Scope:', reg.scope));
});

// Alle Cookies anzeigen
console.log(document.cookie);

// Cache-Inhalt prüfen
caches.keys().then(names => console.log('Caches:', names));
```

---

## 🎨 Visuelle Darstellung

```
┌─────────────────────────────────────────────────────────┐
│                 dev0gig.github.io                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PWA 1: Dashboard                               │   │
│  │  Scope: /                                       │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  Service Worker (/)                     │   │   │
│  │  │  • Cache: root-cache                    │   │   │
│  │  │  • Cookies: path=/                      │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PWA 2: Knowledge Journal                      │   │
│  │  Scope: /react-journaling/                     │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  Service Worker (/react-journaling/)   │   │   │
│  │  │  • Cache: knowledge-journal-cache       │   │   │
│  │  │  • Cookies: path=/react-journaling      │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Erstellt am:** 2025-11-21  
**Version:** 1.0
