# 🌌 Michael Avilés — Cosmic 3D Portfolio & Systems Portal

> Interactive 3D WebGL Portfolio & Systems Architecture Portal designed for high-impact web presence, deployed seamlessly on Vercel.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-00f5ff?style=for-the-badge&logo=threedotjs&logoColor=black)](https://threejs.org/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural_FX-8b5cf6?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![No Build Step](https://img.shields.io/badge/Build_Step-Zero_Config_ESM-10b981?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

## ⚡ Overview

This portal serves as the primary interactive gateway for **Michael Antony Avilés** (DevOps Lead & Systems Engineer), featuring:

- **GPU 3D Cosmic Galaxy:** Procedurally generated 4-branch spiral galaxy rendered in WebGL using **Three.js** with interactive mouse/touch parallax and warp acceleration effect (*Warp Pulse*).
- **Native Sci-Fi Audio Synthesizer:** Pure procedural sound engine built with the **Web Audio API** (drone ambient + reactive UI chirps, muted by default for browser compliance).
- **Interactive Sci-Fi HUD:** Real-time telemetry (Bogotá COT clock, mission status, warp engine status, sound toggle).
- **Enterprise Showcase:** Deep dives into mission-critical systems:
  - **Systime:** Enterprise ecosystem for automotive dealerships (.NET 10, Azure SQL, GitHub Actions, Quiter ERP integration, Android).
  - **Sysmed / Ingest:** Biomedical tracking platform with Hexagonal Architecture, TypeScript, CASL RBAC, BullMQ/Redis, and PostgreSQL.
  - **Blazor & MAUI Clean Architecture:** DDD reference architecture in .NET.
  - **RPA & Low-Level Automation:** Native Win32 and Playwright screen automation bots.
- **Embedded Interactive CV:** Built-in modal viewer for [`cv_template.html`](cv_template.html) with 1-click print/PDF export.

---

## 🛠️ Tech Stack & Architecture

- **Rendering Engine:** [Three.js](https://threejs.org/) (via native browser ES Modules / Import Maps)
- **Audio Engine:** Native Web Audio API (`AudioContext`, `BiquadFilter`, `OscillatorNode`)
- **Structure:** Semantic HTML5, Modern CSS (Glassmorphism, CSS Custom Properties, Responsive Flexbox/Grid)
- **Deployment:** Instant static hosting on [Vercel](https://vercel.com) via `vercel.json`

---

## 🚀 Local Development

Since this project uses native modern ES Modules, no build step (`npm run build`) is required:

```bash
# Serve locally using any static web server (e.g. VS Code Live Server, python, or npx serve)
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

---

## 🌐 Deploy to Vercel

Import this repository directly into [Vercel](https://vercel.com) with standard static preset. Zero build commands needed.
