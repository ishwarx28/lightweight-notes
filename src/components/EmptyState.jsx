import styles from './EmptyState.module.css';

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <div className={styles.iconWrapper}>
          <Icon size={28} />
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
