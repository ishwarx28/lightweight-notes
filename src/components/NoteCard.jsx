import { Pin, PinOff, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { TagBadge } from './TagBadge';
import { formatDate } from '../utils/formatDate';
import styles from './NoteCard.module.css';

export function NoteCard({ note, onPin, onArchive, onDelete, onClick }) {
  const previewText = note.content
    ? note.content.length > 120
      ? note.content.slice(0, 120) + '…'
      : note.content
    : null;

  const cardClass = [
    styles.card,
    note.archived ? styles.cardArchived : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass} onClick={onClick}>
      {note.color && note.color !== '#ffffff' && (
        <div className={styles.colorAccent} style={{ background: note.color }} />
      )}

      {note.archived && (
        <div className={styles.archivedBadge}>
          <Archive size={10} />
          Archived
        </div>
      )}

      <div className={styles.header}>
        <h3 className={styles.title}>
          {note.title || 'Untitled'}
        </h3>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${note.pinned ? styles.active : ''}`}
            onClick={(e) => { e.stopPropagation(); onPin(note.id); }}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button
            className={styles.actionBtn}
            onClick={(e) => { e.stopPropagation(); onArchive(note.id); }}
            aria-label={note.archived ? 'Unarchive note' : 'Archive note'}
          >
            {note.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            aria-label="Delete note"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className={`${styles.preview} ${!previewText ? styles.previewEmpty : ''}`}>
        {previewText || 'No additional content'}
      </p>

      {note.tags.length > 0 && (
        <div className={styles.tags}>
          {note.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      <div className={styles.meta}>
        <span>{formatDate(note.updatedAt)}</span>
        {note.pinned && <Pin size={12} className={styles.pinnedIcon} />}
      </div>
    </article>
  );
}
