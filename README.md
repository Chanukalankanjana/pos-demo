# 🛒 POS System Frontend

A modern, responsive Point of Sale (POS) and Restaurant Management frontend built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It includes a dashboard, POS terminal, inventory, staff and attendance, accounting, analytics, CRM, multi-branch support, QR menu, and settings screens.

📖 Refer to `DESCRIPTION.md` for a deeper architectural overview and feature breakdown.

## 🚀 Tech Stack
- ⚛️ React 18 + TypeScript
- ⚡ Vite 5 (build/dev server)
- 🎨 Tailwind CSS + shadcn/ui + Radix Primitives
- 🧭 React Router DOM
- 🔄 TanStack Query (ready for API data fetching)
- 📊 Recharts, Lucide Icons, date-fns

## 📋 Requirements
- 📦 Node.js 18+ and npm

## ⚡ Quick Start
```bash
git clone 
cd POS-System
npm install
npm run dev
```

🌐 The app will start on a local Vite dev server (default `http://localhost:5173`).

## 🛠️ Scripts
- `npm run dev`: 🔥 Start the development server
- `npm run build`: 📦 Production build
- `npm run build:dev`: 🔧 Development-optimized build
- `npm run preview`: 👀 Preview the production build locally
- `npm run lint`: ✅ Run ESLint

## 📁 Project Structure
```
POS-System/
  public/                 # 🖼️ Static assets (logo, images, icons)
  src/
    components/
      Dashboard/          # 📊 Dashboard widgets (e.g., StatCard)
      Layout/             # 🏗️ App shell (DashboardLayout, Sidebar)
      ui/                 # 🎨 shadcn/ui primitives
    hooks/                # 🪝 Reusable hooks
    lib/                  # 🔧 Utilities (pdf, general utils)
    pages/                # 📄 Route-level screens (POS, Inventory, etc.)
    App.tsx               # 🎯 Root routes and layout composition
    main.tsx              # 🚀 App bootstrap
  index.html              # 📝 Vite entry HTML
  tailwind.config.ts      # ⚙️ Tailwind configuration
  vite.config.ts          # ⚙️ Vite configuration
```

### 🗺️ Notable Route Screens
Located under `src/pages`:
- 📊 `Dashboard.tsx`
- 💳 `POS.tsx`
- 📦 `Inventory.tsx`
- 👥 `Staff.tsx`, `Attendance.tsx`
- 💰 `Accounting.tsx`
- 📈 `Analytics.tsx`
- 🤝 `CRM.tsx`
- 🏢 `MultiBranch.tsx`
- 📱 `QRMenu.tsx`
- ⚙️ `Settings.tsx`

## 🎨 Styling & UI
- 🎯 Tailwind CSS for utilities and theming
- 🧩 shadcn/ui components in `src/components/ui` for consistent UX
- 🎭 Icons from `lucide-react`

## 🔌 Data Layer
This frontend is API-agnostic by default. Integrate your backend by wiring React Query to your endpoints, defining types, and mapping responses to UI components.

## 🏗️ Building & Deployment
```bash
npm run build
npm run preview
```
📦 The `dist/` folder contains the production assets. Deploy to any static host or CDN (e.g., Netlify, Vercel, S3 + CloudFront, Nginx).

## 🤝 Contributing
1. 🍴 Fork and clone the repo
2. 🌿 Create a feature branch
3. 💬 Commit with clear messages
4. 🔀 Open a PR describing changes and testing notes

✨ **Happy coding!** Built with ❤️ for modern restaurant management.

💡 **Powered by Vizualabs**
