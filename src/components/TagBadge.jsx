import { X } from 'lucide-react';
import styles from './TagBadge.module.css';

export function TagBadge({ tag, onRemove, onClick }) {
  const cls = [styles.badge];
  if (onRemove) cls.push(styles.badgeRemovable);
  if (onClick) cls.push(styles.badgeClickable);

  return (
    <span
      className={cls.join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && e.key === 'Enter' && onClick()}
    >
      {tag}
      {onRemove && (
        <button
          className={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          aria-label={`Remove tag ${tag}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
