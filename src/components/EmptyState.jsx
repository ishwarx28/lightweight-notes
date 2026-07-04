import styles from './EmptyState.module.css';

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <div className={styles.iconWrapper}>
          <Icon size={32} />
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
