import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useNotes } from '../../hooks/useNotes';
import styles from './Layout.module.css';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setSearch } = useNotes();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Clear search when navigating between main sections
  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = location.pathname;
    prevPathRef.current = curr;

    // Only clear when switching between top-level pages (not note detail)
    const prevSection = prev.split('/')[1] || 'home';
    const currSection = curr.split('/')[1] || 'home';
    if (prevSection !== currSection) {
      setSearch('');
    }
  }, [location.pathname, setSearch]);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
