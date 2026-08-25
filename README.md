<p align="center">
  <img src="assets/readme-cover.png" width="100%" alt="Juno safely identifies and clears unnecessary Mac cache files" />
</p>

<p align="center">
  <img src="juno-icon.png" width="160" alt="Juno" />
</p>

<h1 align="center">Juno</h1>

<p align="center">
  <strong>Your cute dino companion that cleans and optimises your Mac.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-blue" />
  <img src="https://img.shields.io/badge/electron-33-brightgreen" />
  <img src="https://img.shields.io/badge/react-18-61dafb" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

Juno is a native macOS desktop app that scans known cache directories, shows how much space each is using, and helps you safely reclaim disk space — all with the help of a friendly little dinosaur.

## Features

- **Smart cache scanning** — automatically finds and sizes 30+ cache directories from popular apps (Chrome, Slack, Discord, Spotify, Xcode, Docker, npm, Homebrew, and more)
- **Disk overview bar** — visualises total, used, freed, and free space at a glance
- **Safety classification** — each cache is tagged as **safe to clear** (green) or **clean in app** (yellow) with instructions, so you never delete something you shouldn't
- **Ask AI** — click any cache item to get an instant AI-powered explanation of what's in the folder and whether it's safe to delete. Supports Claude API or local models via Ollama (Gemma 4, Llama, Mistral, etc.)
- **One-click cleanup** — select caches, confirm, and Juno handles the rest. Extra confirmation for large deletions (>50 GB)
- **Dark theme** — beautiful dark UI that matches macOS, with smooth animations and a frameless window

## Caches Juno Scans

| Category | Apps |
|---|---|
| Browsers | Chrome (Service Worker, GPU cache) |
| Communication | Slack, Discord, Zoom |
| Dev tools | Cursor, Xcode (DerivedData, Archives, iOS DeviceSupport, CoreSimulator) |
| AI apps | Claude, ChatGPT |
| Media | Descript, Spotify |
| Package managers | npm, Yarn, pnpm, pip, Homebrew, Gradle, Cargo |
| Containers | Docker (VM disk, group containers) |
| Productivity | Notion, Notion Mail, Canva |
| System | Trash, Google shared caches, Microsoft Edge updater |

## Getting Started

### Prerequisites

- macOS 12+
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/deewang/juno-mac-cleaner-agent.git
cd juno-mac-cleaner-agent
npm install
npm run dev
```

### Build a .dmg

```bash
npm run build
```

The universal DMG (Apple Silicon + Intel) will be in `release/Juno-1.0.0-universal.dmg`.

## Ask AI Setup

Juno can call an LLM to explain what each cache folder contains and whether it's safe to delete.

**Option A — Claude API (cloud):**
1. Open Juno → click the gear icon
2. Select "Claude API" → paste your [Anthropic API key](https://console.anthropic.com/)
3. Click any cache → AI auto-answers "Is it safe to delete this?"

**Option B — Ollama (local, free):**
1. Install [Ollama](https://ollama.com) and pull a model: `ollama pull gemma4`
2. Open Juno → gear icon → select "Ollama (Local)"
3. Set the model name (e.g. `gemma4`, `llama3.1`, `mistral`)

## Tech Stack

- **Electron** — native macOS desktop wrapper
- **React + Vite** — fast frontend with hot reload
- **Node.js** `fs` / `child_process` — disk scanning (`du -sk`), deletion (`rm -rf`), disk info (`df`)
- **electron-builder** — .dmg packaging (universal binary)
- **IPC architecture** — secure `contextIsolation` with a preload bridge; API keys never touch the renderer

## Project Structure

```
├── electron/
│   ├── main.js          # Electron main process + IPC handlers
│   ├── preload.js       # Secure bridge (diskAPI)
│   ├── scanner.js       # Cache scanning, deletion, disk info
│   ├── ai.js            # Claude API + Ollama integration
│   └── settings.js      # Persistent settings (API key, provider)
├── src/
│   ├── App.jsx          # Main app shell
│   ├── components/
│   │   ├── DiskBar.jsx      # Disk usage visualisation
│   │   ├── CacheList.jsx    # Sorted cache list with toolbar
│   │   ├── CacheItem.jsx    # Individual cache row
│   │   ├── ActionBar.jsx    # Bottom action bar
│   │   ├── ConfirmModal.jsx # Deletion confirmation + success
│   │   ├── AskAIModal.jsx   # AI chat with auto-ask + follow-ups
│   │   └── SettingsModal.jsx# API key + Ollama config
│   ├── hooks/useDiskData.js # Scanning + deletion hook
│   └── utils/format.js     # Byte formatting helpers
├── build/
│   ├── make_icon.swift  # Generates Juno icon via CoreGraphics
│   └── icon.icns        # Compiled macOS icon
└── package.json
```

## License

MIT

---

<p align="center">
  Built with help from Claude Code<br/>
  <sub>🦕 Juno says: keep your Mac clean!</sub>
</p>
