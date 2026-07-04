import { NavLink } from 'react-router-dom';
import { FileText, Archive, Tags, PenSquare } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import styles from './Sidebar.module.css';

export function Sidebar({ isOpen, onClose }) {
  const { allTags } = useNotes();

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <PenSquare size={20} />
          </div>
          <span className={styles.logoText}>Lightweight Notes</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
            onClick={onClose}
          >
            <FileText size={18} />
            All Notes
          </NavLink>
          <NavLink
            to="/archived"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
            onClick={onClose}
          >
            <Archive size={18} />
            Archived
          </NavLink>

          {allTags.length > 0 && (
            <div className={styles.tagSection}>
              <div className={styles.tagSectionLabel}>
                <Tags size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Tags
              </div>
              {allTags.map((tag) => (
                <NavLink
                  key={tag}
                  to={`/tag/${encodeURIComponent(tag)}`}
                  className={({ isActive }) =>
                    `${styles.tagLink} ${isActive ? styles.tagLinkActive : ''}`
                  }
                  onClick={onClose}
                >
                  {tag}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className={styles.footer}>
          &copy; created by Wizzle
        </div>
      </aside>
    </>
  );
}
