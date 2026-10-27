# 🎮 Story Guessing Game - Frontend

The frontend client for Story Guessing Game, built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Socket.IO Client**.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create or update `.env` in this directory:
```env
# Leave empty to automatically use the Vite proxy (works with ngrok & localhost)
VITE_BACKEND_URL=""
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Sharing via Ngrok

1. Run ngrok pointing to Vite:
   ```bash
   ngrok http 5173
   ```
2. In `vite.config.ts`, add your ngrok domain to `server.allowedHosts`:
   ```ts
   server: {
     allowedHosts: ["your-subdomain.ngrok-free.dev"],
     // ... proxy configuration
   }
   ```
3. Restart Vite (`npm run dev`).
4. Share the ngrok URL with your friends!

---

## 🏗️ Build for Production

```bash
npm run build
```
The compiled assets will be placed in the `dist/` directory.
