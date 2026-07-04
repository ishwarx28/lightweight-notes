import { X } from 'lucide-react';
import styles from './TagBadge.module.css';

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

export function TagBadge({ tag, onRemove, onClick, size = 'medium' }) {
  const cls = [styles.badge, styles[`badge_${size}`]];
  if (onRemove) cls.push(styles.badgeRemovable);
  if (onClick) cls.push(styles.badgeClickable);

  const color = getTagColor(tag);

  return (
    <span
      className={cls.join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && e.key === 'Enter' && onClick()}
    >
      <span
        className={styles.dot}
        style={{ backgroundColor: color }}
      />
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
          <X size={10} />
        </button>
      )}
    </span>
  );
}
