import { useEffect, useRef, useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NoteEditor } from '../NoteEditor';
import { useNotes } from '../../hooks/useNotes';
import { Menu } from 'lucide-react';
import styles from './Layout.module.css';

export function Layout() {
  const { setSearch, selectedNoteId, setSelectedNoteId } = useNotes();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  // Clear search when navigating between main sections
  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = location.pathname;
    prevPathRef.current = curr;

    const prevSection = prev.split('/')[1] || 'home';
    const currSection = curr.split('/')[1] || 'home';
    if (prevSection !== currSection) {
      setSearch('');
    }
  }, [location.pathname, setSearch]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to focus search
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSelectedNoteId(null);
      // Use window.location for navigation if not already at /
      if (window.location.pathname !== '/' || window.location.search) {
        window.history.pushState({}, '', '/');
      }
      // Small delay to let UI settle, then focus
      requestAnimationFrame(() => {
        const input = document.querySelector('[data-search-input]');
        if (input) {
          input.focus();
          input.select();
        }
      });
    }
  }, [setSelectedNoteId]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.layout}>
      <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.center}>
        {/* Mobile menu toggle */}
        <div className={styles.mobileBar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>
        <Outlet />
      </div>
      <div className={`${styles.right} ${selectedNoteId ? styles.rightOpen : ''}`}>
        {selectedNoteId ? (
          <NoteEditor noteId={selectedNoteId} />
        ) : (
          <div className={styles.emptyDetail}>
            <div className={styles.emptyDetailIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <h3 className={styles.emptyDetailTitle}>Select a note</h3>
            <p className={styles.emptyDetailDesc}>
              Choose a note from the list to view or edit it, or create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
