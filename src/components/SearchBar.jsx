import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

export function SearchBar({ value, onChange, placeholder = 'Search notes…' }) {
  return (
    <div className={styles.searchBar}>
      <Search size={18} className={styles.searchIcon} />
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
