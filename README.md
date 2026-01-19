# Krisandi Dashboard Apps

A production-ready app launcher portal that unifies web apps and localhost tools into one beautiful dashboard.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Krisandi+Dashboard+Apps)

## ✨ Features

- **Card-based Dashboard**: Clean, responsive grid layout for all your apps
- **Support for Web & Local Apps**: Works with hosted URLs and localhost development servers
- **Smart Type Detection**: Automatically detects if URL is local or web-based
- **Search & Filter**: Find apps quickly with search, type filters, and tag filters
- **Keyboard Shortcuts**: Press `/` to search, `n` to add new app
- **CRUD Operations**: Add, edit, delete, and duplicate apps
- **Pin Favorites**: Pin important apps to the top
- **Import/Export**: Backup and restore your app list as JSON
- **Dark Theme**: Beautiful dark mode UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Krisandi-dashboard-apps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

### Adding Apps

1. Press `n` or click the "Add App" button
2. Fill in the app details:
   - **Name**: The display name for your app
   - **URL**: The full URL (e.g., `https://example.com` or `http://localhost:3001`)
   - **Description**: Optional brief description
   - **Icon**: Emoji (🚀) or Lucide icon name (e.g., `rocket`, `database`)
   - **Tags**: Comma-separated tags for filtering
3. Click "Add App"

### App Type Detection

The type is automatically detected from the URL:
- URLs containing `localhost` or `127.0.0.1` → **Local** (amber badge)
- All other URLs → **Web** (blue badge)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search box |
| `n` | Open "Add App" modal |

### Filtering & Sorting

- **Search**: Filter by name, URL, description, or tags
- **Type Filter**: Show All, Web only, or Local only
- **Tags Filter**: Click on tags to filter
- **Pinned Only**: Show only pinned apps
- **Sort**: Pinned First, Name A-Z, or Recently Updated

### Export / Import

- **Export**: Click the download button to save all apps as JSON
- **Import**: Click the upload button to load apps from a JSON file
  - Duplicate URLs (by URL) will be skipped

## 🗂️ Project Structure

```
Krisandi-dashboard-apps/
├── app/
│   ├── api/
│   │   ├── apps/
│   │   │   ├── route.ts        # GET all, POST new
│   │   │   ├── [id]/route.ts   # PATCH, DELETE
│   │   │   ├── export/route.ts # Export JSON
│   │   │   └── import/route.ts # Import JSON
│   │   └── tags/route.ts       # GET all tags
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── AppCard.tsx
│   ├── AppGrid.tsx
│   ├── AppFormModal.tsx
│   ├── DeleteConfirmDialog.tsx
│   └── Header.tsx
├── lib/
│   ├── db.ts                   # JSON storage layer
│   ├── types.ts                # TypeScript types
│   ├── validators.ts           # Zod schemas
│   └── utils.ts                # Utilities
├── data/
│   └── apps.json               # App data storage
└── README.md
```

## 🌐 Deployment Notes

### Local Development
The app runs on `localhost:3000` by default. All app data is stored in `data/apps.json`.

### Production Deployment
When deployed to the web:
- All features work normally
- **Local app links** (localhost URLs) will only work when users are browsing from their own machine
- This is expected behavior — you don't need to expose local ports publicly

### Recommended Platforms
- Vercel (recommended for Next.js)
- Netlify
- Docker container

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Validation**: Zod
- **Notifications**: Sonner

## 📝 API Reference

### GET /api/apps
Returns all apps.
```json
{ "apps": [...] }
```

### POST /api/apps
Create a new app.
```json
// Request
{ "name": "My App", "url": "https://example.com", "tags": ["dev"], "description": "...", "icon": "🚀", "isPinned": false }

// Response
{ "app": {...} }
```

### PATCH /api/apps/:id
Update an app.

### DELETE /api/apps/:id
Delete an app.

### GET /api/tags
Get all unique tags.

### GET /api/apps/export
Download apps as JSON file.

### POST /api/apps/import
Import apps from JSON.
```json
{ "apps": [...], "strategy": "skip" | "replace" }
```

## 📋 Manual Test Checklist

- [ ] View empty dashboard with "Add App" button
- [ ] Add a new web app (e.g., https://google.com)
- [ ] Add a new local app (e.g., http://localhost:8080)
- [ ] Click card to open URL in new tab
- [ ] Edit an existing app
- [ ] Delete an app with confirmation
- [ ] Duplicate an app
- [ ] Pin/unpin an app
- [ ] Search by name, URL, tags
- [ ] Filter by type (Web/Local)
- [ ] Filter by tags
- [ ] Export apps to JSON
- [ ] Import apps from JSON
- [ ] Keyboard shortcut "/" focuses search
- [ ] Keyboard shortcut "n" opens add modal
- [ ] Mobile responsive layout

## 📄 License

MIT
