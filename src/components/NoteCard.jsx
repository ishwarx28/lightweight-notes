import { Pin, PinOff, Archive, ArchiveRestore, Trash2, RotateCcw } from 'lucide-react';
import { TagBadge } from './TagBadge';
import { formatDate } from '../utils/formatDate';
import styles from './NoteCard.module.css';

export function NoteCard({ note, isSelected, onSelect, onPin, onArchive, onDelete, onRestore, onPermanentDelete }) {
  const previewText = note.content
    ? note.content.length > 100
      ? note.content.slice(0, 100) + '…'
      : note.content
    : null;

  const cardClass = [
    styles.card,
    isSelected ? styles.cardSelected : '',
    note.archived ? styles.cardArchived : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClass}
      onClick={() => onSelect(note.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(note.id)}
    >
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.titleRow}>
            {note.pinned && <Pin size={12} className={styles.pinnedIcon} />}
            <h3 className={styles.title}>
              {note.title || 'Untitled'}
            </h3>
          </div>
          <div className={styles.actions}>
            {note.trashed ? (
              <>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => { e.stopPropagation(); onRestore?.(note.id); }}
                  aria-label="Restore note"
                  title="Restore"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(note.id); }}
                  aria-label="Delete permanently"
                  title="Delete permanently"
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              <>
                <button
                  className={`${styles.actionBtn} ${note.pinned ? styles.active : ''}`}
                  onClick={(e) => { e.stopPropagation(); onPin(note.id); }}
                  aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                >
                  {note.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => { e.stopPropagation(); onArchive(note.id); }}
                  aria-label={note.archived ? 'Unarchive note' : 'Archive note'}
                >
                  {note.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  aria-label="Move to trash"
                  title="Move to trash"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {previewText && (
          <p className={`${styles.preview} ${!previewText ? styles.previewEmpty : ''}`}>
            {previewText}
          </p>
        )}

        <div className={styles.bottom}>
          <div className={styles.meta}>
            {note.tags.length > 0 && (
              <div className={styles.tags}>
                {note.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} size="small" />
                ))}
              </div>
            )}
            <span className={styles.date}>{formatDate(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
