import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, ArrowUpDown } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { useNotes } from '../../hooks/useNotes';
import styles from './Header.module.css';

export function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const { search, setSearch, sort, setSort } = useNotes();

  const sortOptions = [
    { value: 'newest', label: 'Newest', short: 'New' },
    { value: 'oldest', label: 'Oldest', short: 'Old' },
    { value: 'updated', label: 'Recent', short: 'Rec' },
  ];

  const currentSort = sortOptions.find((o) => o.value === sort) || sortOptions[0];

  const cycleSort = () => {
    const idx = sortOptions.findIndex((o) => o.value === sort);
    const next = sortOptions[(idx + 1) % sortOptions.length];
    setSort(next.value);
  };

  // Keyboard shortcut: Ctrl+N / Cmd+N to create a new note
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/note/new');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <header className={styles.header}>
      {onMenuToggle && (
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
      )}

      <SearchBar value={search} onChange={setSearch} />

      <div className={styles.rightSection}>
        <button className={styles.sortBtn} onClick={cycleSort} title={`Sort: ${currentSort.label}`}>
          <ArrowUpDown size={14} />
          <span className={styles.sortLabel}>{currentSort.label}</span>
          <span className={styles.sortLabelShort}>{currentSort.short}</span>
        </button>

        <button
          className={styles.newBtn}
          onClick={() => navigate('/note/new')}
          title="New Note"
        >
          <Plus size={16} />
          <span className={styles.newBtnLabel}>New Note</span>
        </button>
      </div>
    </header>
  );
}
