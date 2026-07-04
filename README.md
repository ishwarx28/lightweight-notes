# Lightweight Notes

A modern, responsive note-taking web app built with **React**, **Vite**, and **Lucide React**. Features tag-based organisation, instant search, pin/archive, auto-save, and full mobile support.

## ✨ Features

- **Create & Edit** — Full editor with auto-save (debounced)
- **Organise** — Tags with autocomplete, colour accents, pin/unpin
- **Search** — Instant full-text search across titles, content, and tags
- **Sort** — Newest, oldest, or most recently updated
- **Archive** — Keep notes out of the way without deleting them
- **Delete** — With confirmation modal
- **Mobile-first** — Responsive design with bottom-sheet dialogs and touch-friendly interactions
- **Icons only** — Clean UI using Lucide React icons (no emojis)
- **Persistence** — All data saved to `localStorage`

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/          # Sidebar, Header, Layout wrapper
│   ├── NoteCard.jsx     # Card with preview, tags, actions
│   ├── NoteEditor.jsx   # Full editor with auto-save
│   ├── SearchBar.jsx    # Debounced search input
│   ├── TagBadge.jsx     # Tag chip with remove
│   ├── EmptyState.jsx   # Zero-state placeholder
│   ├── Modal.jsx        # Confirmation dialog
│   └── ErrorBoundary.jsx
├── contexts/            # React Context (NotesContext)
├── hooks/               # Custom hooks
│   ├── useLocalStorage.js
│   ├── useDebounce.js
│   └── useNotes.js
├── pages/               # Route-level pages
│   ├── AllNotesPage.jsx
│   ├── NoteDetailPage.jsx
│   ├── ArchivedPage.jsx
│   └── TagPage.jsx
├── utils/               # Helpers
│   ├── filterNotes.js
│   ├── formatDate.js
│   └── generateId.js
├── App.jsx              # Router + providers
├── index.css            # Global styles & CSS variables
└── main.jsx             # Entry point
```

## 🧭 Routes

| Path | Page |
|------|------|
| `/` | All Notes (home) |
| `/note/new` | Create a new note |
| `/note/:id` | View / edit a note |
| `/archived` | Archived notes |
| `/tag/:tagName` | Notes filtered by tag |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `Cmd+N` | Create a new note |

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| [React](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [React Router](https://reactrouter.com) | Client-side routing |
| [Lucide React](https://lucide.dev) | Icon library |
| CSS Modules | Scoped styling |
| `localStorage` | Data persistence |

## 📄 License

MIT
