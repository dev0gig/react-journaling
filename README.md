<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📚 Knowledge Journal - Progressive Web App

Eine KI-gestützte Journaling-Anwendung, die als Progressive Web App (PWA) auf GitHub Pages gehostet wird.

**🌐 Live App:** [https://dev0gig.github.io/react-journaling/](https://dev0gig.github.io/react-journaling/)

**🎨 AI Studio:** [https://ai.studio/apps/drive/1hR8onoq8gwZLPjRJAVYXowKzBVpvbdn_](https://ai.studio/apps/drive/1hR8onoq8gwZLPjRJAVYXowKzBVpvbdn_)

---

## 🚀 Features

- 📝 **KI-gestütztes Journaling** mit Google Gemini API
- 💾 **Offline-fähig** durch Service Worker
- 📱 **Installierbar** als eigenständige PWA
- 🎨 **Modernes UI** mit Tailwind CSS
- 🔒 **Datenschutz** - Alle Daten lokal gespeichert
- 🌙 **Dark Mode** Design

---

## 📋 Quick Start

### Voraussetzungen
- Node.js (v16 oder höher)
- npm oder yarn
- Gemini API Key ([hier erhalten](https://aistudio.google.com/app/apikey))

### Lokale Entwicklung

1. **Repository klonen:**
   ```bash
   git clone https://github.com/dev0gig/react-journaling.git
   cd react-journaling
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **API Key konfigurieren:**
   - Erstelle eine `.env.local` Datei im Projektverzeichnis
   - Füge deinen Gemini API Key hinzu:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Development Server starten:**
   ```bash
   npm run dev
   ```
   Die App läuft nun auf [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment auf GitHub Pages

Diese App ist als **unabhängige Subfolder-PWA** konfiguriert und läuft unter `dev0gig.github.io/react-journaling`.

### Deployment durchführen

```bash
# Build erstellen und deployen
npm run deploy
```

Das war's! Die App wird automatisch auf GitHub Pages veröffentlicht.

### 📚 Deployment-Dokumentation

Für detaillierte Informationen zum PWA-Deployment siehe:

- **[📘 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Vollständige Schritt-für-Schritt-Anleitung
- **[✅ PWA_DEPLOYMENT_CHECKLIST.md](./PWA_DEPLOYMENT_CHECKLIST.md)** - Quick Reference Checkliste
- **[🏗️ ARCHITECTURE.md](./ARCHITECTURE.md)** - Technische Architektur-Übersicht
- **[🔧 CHANGELOG_PWA_CONFIG.md](./CHANGELOG_PWA_CONFIG.md)** - Änderungsprotokoll

---

## 🛠️ Verfügbare Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet den Development Server (Port 3000) |
| `npm run build` | Erstellt einen Production Build |
| `npm run preview` | Vorschau des Production Builds |
| `npm run deploy` | Deployed die App auf GitHub Pages |

---

## 📱 PWA Installation

Die App kann als eigenständige Progressive Web App installiert werden:

1. Öffne [https://dev0gig.github.io/react-journaling/](https://dev0gig.github.io/react-journaling/)
2. Klicke auf den "Install App" Button in deinem Browser
3. Die App wird als eigenständige Anwendung installiert
4. Funktioniert auch offline!

---

## 🏗️ Technologie-Stack

- **Framework:** React 19.2.0
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS
- **KI-Integration:** Google Gemini API
- **PWA:** Service Worker, Web App Manifest
- **Deployment:** GitHub Pages (gh-pages)
- **Sprache:** TypeScript

---

## 📂 Projekt-Struktur

```
react-journaling/
├── public/
│   ├── icons/              # PWA Icons
│   ├── manifest.json       # PWA Manifest (scope: "./")
│   └── sw.js               # Service Worker (MUSS im public/ Ordner sein!)
├── components/             # React Komponenten
├── services/               # API Services
├── utils/                  # Utility Funktionen
├── App.tsx                 # Haupt-App-Komponente
├── index.tsx               # Entry Point + SW Registrierung
├── vite.config.ts          # Vite Konfiguration
└── package.json            # Dependencies & Scripts
```

---

## 🔧 Konfiguration

### PWA-Konfiguration

Diese App ist als **Subfolder-PWA** konfiguriert:

- **Base Path:** `/react-journaling/`
- **Scope:** `./` (resolves to `/react-journaling/`)
- **Service Worker Scope:** `/react-journaling/`
- **Cookie Path:** `/react-journaling`

Siehe [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) für Details.

---

## 🐛 Fehlerbehebung

### App lädt nicht nach Deployment

1. Prüfe die Browser-Konsole auf Fehler
2. Leere den Browser-Cache
3. Deregistriere den Service Worker (DevTools → Application → Service Workers)
4. Lade die Seite neu (Ctrl+Shift+R)

### PWA wird nicht als installierbar erkannt

1. Prüfe das Manifest (DevTools → Application → Manifest)
2. Stelle sicher, dass HTTPS verwendet wird (GitHub Pages nutzt automatisch HTTPS)
3. Prüfe, dass alle Icons verfügbar sind

### Weitere Hilfe

Siehe [PWA_DEPLOYMENT_CHECKLIST.md](./PWA_DEPLOYMENT_CHECKLIST.md) für häufige Probleme und Lösungen.

---

## 📄 Lizenz

Dieses Projekt ist Teil des dev0gig Portfolios.

---

## 🤝 Beitragen

Dies ist ein persönliches Projekt, aber Feedback und Vorschläge sind willkommen!

---

## 📞 Support & Dokumentation

- **Live App:** [https://dev0gig.github.io/react-journaling/](https://dev0gig.github.io/react-journaling/)
- **AI Studio:** [https://ai.studio/apps/drive/1hR8onoq8gwZLPjRJAVYXowKzBVpvbdn_](https://ai.studio/apps/drive/1hR8onoq8gwZLPjRJAVYXowKzBVpvbdn_)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **GitHub Repository:** [https://github.com/dev0gig/react-journaling](https://github.com/dev0gig/react-journaling)

---

**Letzte Aktualisierung:** 2025-11-21  
**Version:** 1.0  
**Status:** ✅ Live auf GitHub Pages
