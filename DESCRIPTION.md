## 📋 POS System Frontend — Description

This repository contains the frontend for a modern Point of Sale (POS) and Restaurant Management interface. It is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. The app provides a responsive dashboard, POS terminal, inventory and staff management, analytics, accounting, CRM, and multi-branch views, designed for real-world retail and F&B workflows.

### 🎯 Goals
- ⚡ Deliver a fast, reliable, and pleasant operator experience at the counter.
- 📊 Provide managers with clear reporting and controls across branches.
- 🧩 Keep the UI systemized and extensible with component-driven development.

### ✨ Key Features
- 📈 **Dashboard** with KPI cards and charts
- 💳 **POS screen** for quick order building and payments
- 📦 **Inventory tracking** and product catalog views
- 👥 **Staff management** and attendance
- 💰 **Accounting** and reports
- 🤝 **CRM** and customer insights
- 📊 **Analytics** with visualizations
- 🏢 **Multi-branch** switching and aggregation
- 📱 **QR Menu** for self-serve experiences
- ⚙️ **Settings** for system configuration and theming

### 🏗️ Architecture Overview
- ⚛️ React + TypeScript app bootstrapped with Vite for fast dev/build.
- 🎨 UI built with Tailwind CSS and shadcn/ui primitives.
- 🧭 Routing with `react-router-dom`.
- 🔄 State and server data ready via `@tanstack/react-query` (extensible for APIs).
- 🔧 Utility layer in `src/lib` for shared helpers and PDF export utilities.
- 🧱 Componentized layout with a reusable `DashboardLayout` and `Sidebar`.

### 📂 Directory Highlights
- 📄 `src/pages` — Route-level screens (Dashboard, POS, Inventory, etc.)
- 🎨 `src/components/ui` — Reusable UI primitives (shadcn/ui)
- 🏗️ `src/components/Layout` — Application shell components
- 📊 `src/components/Dashboard` — Dashboard-specific widgets (e.g., `StatCard`)
- 🔧 `src/lib` — Utilities and helpers (PDF, general utils)
- 🖼️ `public` — Static assets (logo, product images, icons)

### 🔌 Data and API
This frontend is API-agnostic by default. Integrate with your backend by wiring React Query hooks to your endpoints, adding types, and mapping data to the existing UI. Authentication, role-based access, and offline support can be introduced as needed.

### 🎨 Theming & Design System
- 🎯 Tailwind CSS for utility-first styling
- 🧩 shadcn/ui for accessible headless components
- 🎭 Icons via `lucide-react`

### 🛠️ Build & Tooling
- 🔥 Dev server: `npm run dev`
- 📦 Production build: `npm run build`
- 👀 Preview build: `npm run preview`
- ✅ Linting: `npm run lint`

### 🚀 Extensibility Notes
- ➕ Add new pages under `src/pages` and register routes.
- 🧩 Keep reusable pieces in `src/components`.
- 🔧 Centralize cross-cutting helpers in `src/lib`.
- 🎨 Prefer composable UI primitives from `src/components/ui` for consistency.

💡 **Powered by Vizualabs** — Building innovative solutions for modern businesses.
