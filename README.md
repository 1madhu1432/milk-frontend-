# MilkERP Frontend

MilkERP is a multi-tenant ERP platform for modern dairy farms and milk distribution networks. This repository contains the standalone React + Vite + TypeScript frontend web application.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS + Lucide Icons
- **Routing:** React Router v7
- **Authentication:** Google OAuth 2.0 (`@react-oauth/google`) + JWT bearer tokens
- **Charts:** Recharts

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
```bash
npm run build
npm run preview
```

