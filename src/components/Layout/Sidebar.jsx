import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Star, Clock, Archive, Trash2, Tag, Plus,
  Search, Sun, Moon, Monitor, ChevronUp,
} from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { useTheme } from '../../hooks/useTheme';
import styles from './Sidebar.module.css';

const TAG_COLORS = {
  work: '#6366F1',
  ideas: '#10B981',
  personal: '#F59E0B',
  projects: '#8B5CF6',
  learning: '#3B82F6',
};

function getTagColor(tag) {
  const key = tag.toLowerCase();
  return TAG_COLORS[key] || '#6B7280';
}

export function Sidebar({ sidebarOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { allTags, notes, setSelectedNoteId, addNote, setSearch, setSort } = useNotes();
  const { mode, setMode } = useTheme();
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef(null);

  const currentPath = location.pathname;
  const currentSearch = location.search;

  const isActive = (path) => {
    if (path === '/') return currentPath === '/' && !currentSearch.includes('view=');
    return currentPath.startsWith(path);
  };

  const isViewActive = (view) => {
    return currentSearch.includes(`view=${view}`);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      setShowTagInput(false);
      setNewTagName('');
    }
  };

  // Close theme menu on outside click
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handler = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [themeMenuOpen]);

  const handleNewNote = () => {
    const newNote = addNote();
    setSelectedNoteId(newNote.id);
    navigate('/');
    onClose?.();
  };

  const getNoteCount = (filterFn) => {
    return notes.filter(filterFn).length;
  };

  const getTagCount = (tag) => {
    return notes.filter((n) => n.tags.includes(tag) && !n.archived).length;
  };

  const navigateTo = (path, view) => {
    setSearch('');
    if (view) {
      navigate(`${path}?view=${view}`);
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { path: '/', icon: FileText, label: 'All Notes', count: getNoteCount((n) => !n.archived), active: currentPath === '/' && !currentSearch.includes('view=') },
    { path: '/?view=favorites', icon: Star, label: 'Favorites', count: getNoteCount((n) => n.pinned && !n.archived), active: isViewActive('favorites') },
    { path: '/?view=recent', icon: Clock, label: 'Recent', active: isViewActive('recent') },
    { path: '/archived', icon: Archive, label: 'Archived', count: getNoteCount((n) => n.archived), active: currentPath === '/archived' },
    { path: '/?view=trash', icon: Trash2, label: 'Trash', active: isViewActive('trash') },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* ── Logo ── */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v16.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h6.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V3.6c0-.4-.2-.8-.5-1.1-.3-.3-.7-.5-1.1-.5z" />
            <path d="M9 7h6" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
          </svg>
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>Light-weight</span>
          <span className={styles.logoSubtitle}>Notes</span>
        </div>
      </div>

      {/* ── Search Shortcut ── */}
      <button
        className={styles.searchHint}
        onClick={() => {
          setSelectedNoteId(null);
          navigate('/');
          // Focus will be handled by a ref in the center column
          setTimeout(() => {
            const searchInput = document.querySelector('[data-search-input]');
            if (searchInput) searchInput.focus();
          }, 100);
          onClose?.();
        }}
      >
        <Search size={14} />
        <span>Quick search</span>
        <kbd className={styles.shortcut}>⌘K</kbd>
      </button>

      {/* ── New Note Button ── */}
      <button className={styles.newNoteBtn} onClick={handleNewNote}>
        <Plus size={16} />
        <span>New Note</span>
      </button>

      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
            onClick={() => {
              setSelectedNoteId(null);
              setSort('newest');
              if (item.path.includes('?')) {
                const [p, q] = item.path.split('?');
                navigate(`${p}?${q}`);
              } else {
                navigate(item.path);
              }
              onClose?.();
            }}
          >
            <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
            <span className={styles.navLabel}>{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className={styles.navCount}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Tags Section ── */}
      <div className={styles.tagSection}>
        <div className={styles.tagSectionHeader}>
          <Tag size={14} />
          <span>Tags</span>
        </div>

        <div className={styles.tagList}>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`${styles.tagItem} ${currentPath === `/tag/${encodeURIComponent(tag)}` ? styles.tagItemActive : ''}`}
              onClick={() => {
                setSelectedNoteId(null);
                navigate(`/tag/${encodeURIComponent(tag)}`);
                onClose?.();
              }}
            >
              <span
                className={styles.tagDot}
                style={{ backgroundColor: getTagColor(tag) }}
              />
              <span className={styles.tagLabel}>{tag}</span>
              <span className={styles.tagCount}>{getTagCount(tag)}</span>
            </button>
          ))}
        </div>

        {showTagInput ? (
          <div className={styles.tagInputWrap}>
            <input
              className={styles.tagInput}
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
                if (e.key === 'Escape') setShowTagInput(false);
              }}
              placeholder="Tag name…"
              autoFocus
              onBlur={() => {
                if (!newTagName.trim()) setShowTagInput(false);
              }}
            />
          </div>
        ) : (
          <button className={styles.addTagBtn} onClick={() => setShowTagInput(true)}>
            <Plus size={14} />
            <span>Add Tag</span>
          </button>
        )}
      </div>

      {/* ── Spacer ── */}
      <div className={styles.spacer} />

      {/* ── Theme Toggle ── */}
      <div className={styles.themeSection} ref={themeMenuRef}>
        <button
          className={styles.themeBtn}
          onClick={() => setThemeMenuOpen((v) => !v)}
        >
          {mode === 'dark' ? <Moon size={15} /> : mode === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
          <span className={styles.themeLabel}>
            {mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System'}
          </span>
          <ChevronUp size={14} className={`${styles.themeArrow} ${themeMenuOpen ? styles.themeArrowOpen : ''}`} />
        </button>

        {themeMenuOpen && (
          <div className={styles.themeMenu}>
            <button
              className={`${styles.themeMenuItem} ${mode === 'light' ? styles.themeMenuItemActive : ''}`}
              onClick={() => { setMode('light'); setThemeMenuOpen(false); }}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              className={`${styles.themeMenuItem} ${mode === 'dark' ? styles.themeMenuItemActive : ''}`}
              onClick={() => { setMode('dark'); setThemeMenuOpen(false); }}
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
            <button
              className={`${styles.themeMenuItem} ${mode === 'system' ? styles.themeMenuItemActive : ''}`}
              onClick={() => { setMode('system'); setThemeMenuOpen(false); }}
            >
              <Monitor size={14} />
              <span>System</span>
            </button>
          </div>
        )}
      </div>

      </aside>
    </>
  );
}
