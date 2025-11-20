# 📚 Knowledge Journal PWA - Deployment Dokumentation

## 🎯 Überblick

Dieses Projekt ist eine Progressive Web App (PWA), die als **Subfolder-PWA** unter `https://dev0gig.github.io/react-journaling/` deployed wird. Es existiert **unabhängig** von der Root-PWA auf `https://dev0gig.github.io/`.

## 📁 Dokumentation

Diese Repository enthält drei wichtige Dokumentationsdateien:

### 1. 📘 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
**Vollständige Schritt-für-Schritt-Anleitung**
- Detaillierte Konfiguration für Root- und Subfolder-PWA
- Erklärung aller Konfigurationsdateien
- Fehlerbehebung und Testing
- Verallgemeinerte Vorlage für andere Projekte

### 2. ✅ [PWA_DEPLOYMENT_CHECKLIST.md](./PWA_DEPLOYMENT_CHECKLIST.md)
**Quick-Reference Checkliste**
- Schnellübersicht aller wichtigen Konfigurationen
- Deployment-Schritte
- Testing-Checkliste
- Häufige Probleme und Lösungen

### 3. 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Architektur-Übersicht**
- Visuelle Darstellung der Domain-Struktur
- Request Flow und Cookie-Isolation
- Build & Deployment Flow
- Debugging-Tipps

---

## 🚀 Quick Start

### Voraussetzungen
- Node.js installiert
- Git installiert
- GitHub Account mit Zugriff auf `dev0gig.github.io` und `react-journaling` Repositories

### Installation
```bash
# Repository klonen
git clone https://github.com/dev0gig/react-journaling.git
cd react-journaling

# Dependencies installieren
npm install
```

### Lokale Entwicklung
```bash
# Development Server starten
npm run dev

# Öffne http://localhost:3000
```

### Deployment
```bash
# Build erstellen
npm run build

# Auf GitHub Pages deployen
npm run deploy
```

---

## 🔑 Kritische Konfigurationen

### ⚠️ Wichtigste Einstellung: Manifest Scope

Die **kritischste** Konfiguration für eine unabhängige Subfolder-PWA ist der `scope` in der `manifest.json`:

```json
{
  "scope": "./"
}
```

**Ohne diese Einstellung wird die PWA NICHT als separate App erkannt!**

### Weitere wichtige Konfigurationen

| Datei | Einstellung | Wert |
|-------|-------------|------|
| `vite.config.ts` | `base` | `/react-journaling/` |
| `package.json` | `homepage` | `https://dev0gig.github.io/react-journaling` |
| `manifest.json` | `scope` | `./` |
| `manifest.json` | `start_url` | `./` |
| `index.tsx` | SW Scope | `/react-journaling/` |
| `index.tsx` | Cookie Path | `/react-journaling` |
| `sw.js` | `BASE_PATH` | `/react-journaling` |

---

## 📋 Deployment Checklist

Vor jedem Deployment:

- [ ] `vite.config.ts`: `base: '/react-journaling/'` ✓
- [ ] `package.json`: `homepage` korrekt gesetzt ✓
- [ ] `manifest.json`: `scope: './'` vorhanden ✓
- [ ] `index.tsx`: Service Worker Scope gesetzt ✓
- [ ] `sw.js`: `BASE_PATH` korrekt ✓
- [ ] `index.html`: Relative Pfade für Manifest und Icons ✓

Nach dem Deployment:

- [ ] PWA ist installierbar
- [ ] Service Worker registriert sich korrekt
- [ ] Keine 404 Fehler in der Console
- [ ] Offline-Funktionalität funktioniert
- [ ] Manifest wird korrekt erkannt

---

## 🧪 Testing

### Browser DevTools (F12)

1. **Manifest prüfen**
   - Application → Manifest
   - `scope` sollte `/react-journaling/` sein

2. **Service Worker prüfen**
   - Application → Service Workers
   - Scope: `/react-journaling/`
   - Status: "activated and running"

3. **Cache prüfen**
   - Application → Cache Storage
   - Cache: `knowledge-journal-cache-v2`
   - URLs haben `/react-journaling/` Präfix

4. **Console prüfen**
   - Keine Fehler
   - "Service Worker registered successfully with scope: /react-journaling/"

### PWA Installation testen

1. Öffne `https://dev0gig.github.io/react-journaling/`
2. Browser zeigt "Install App" Button
3. Installiere die PWA
4. Öffne die installierte App
5. Prüfe, dass sie unabhängig läuft

---

## 🐛 Fehlerbehebung

### Problem: PWA wird nicht als installierbar erkannt

**Lösung:**
1. Prüfe `"scope": "./"` in `manifest.json`
2. Leere Browser-Cache (DevTools → Application → Clear storage)
3. Deregistriere Service Worker und lade neu

### Problem: 404 Fehler bei Assets

**Lösung:**
1. Prüfe `base: '/react-journaling/'` in `vite.config.ts`
2. Prüfe relative Pfade in `index.html`
3. Rebuild: `npm run build`

### Problem: Service Worker registriert sich nicht

**Lösung:**
1. Prüfe Console auf Fehler
2. Prüfe Scope-Parameter in `index.tsx`
3. Stelle sicher, dass `sw.js` korrekt deployed wurde

---

## 📚 Weitere Ressourcen

- [Vite Documentation](https://vitejs.dev/)
- [PWA Manifest Specification](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## 🤝 Projekt-Struktur

```
react-journaling/
├── public/
│   ├── icons/
│   │   └── book.png
│   └── manifest.json          # PWA Manifest mit scope: "./"
├── src/
│   ├── App.tsx
│   └── ...
├── index.html                 # Relative Pfade für Manifest
├── index.tsx                  # SW Registrierung mit Scope
├── sw.js                      # Service Worker mit BASE_PATH
├── vite.config.ts             # base: '/react-journaling/'
├── package.json               # homepage + deploy scripts
├── DEPLOYMENT_GUIDE.md        # Vollständige Anleitung
├── PWA_DEPLOYMENT_CHECKLIST.md # Quick Reference
├── ARCHITECTURE.md            # Architektur-Übersicht
└── README.md                  # Diese Datei
```

---

## 📝 Notizen

### Warum zwei separate PWAs?

- **Unabhängige Installation**: Benutzer können beide Apps separat installieren
- **Getrennte Scopes**: Keine Konflikte zwischen Service Workern
- **Cookie-Isolation**: Subfolder-Cookies sind nicht für Root verfügbar
- **Separate Caches**: Jede PWA hat ihren eigenen Cache

### Wichtige Konzepte

1. **Scope**: Definiert den Gültigkeitsbereich einer PWA
2. **Service Worker Scope**: Begrenzt, welche Requests der SW kontrolliert
3. **Cookie Path**: Begrenzt, wo Cookies verfügbar sind
4. **Base Path**: Vite-Konfiguration für Asset-Pfade

---

## 🔄 Workflow

```
Code ändern → npm run build → npm run deploy → Testen
```

---

## 📞 Support

Bei Problemen:
1. Prüfe die [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Nutze die [PWA_DEPLOYMENT_CHECKLIST.md](./PWA_DEPLOYMENT_CHECKLIST.md)
3. Siehe [ARCHITECTURE.md](./ARCHITECTURE.md) für technische Details

---

**Projekt:** Knowledge Journal PWA  
**URL:** https://dev0gig.github.io/react-journaling/  
**Letzte Aktualisierung:** 2025-11-21  
**Version:** 1.0
