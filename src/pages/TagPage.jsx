import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tags } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useNotes } from '../hooks/useNotes';
import { filterNotes } from '../utils/filterNotes';
import styles from './AllNotesPage.module.css';

export function TagPage() {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const { notes, search, sort, deleteNote, archiveNote, pinNote } = useNotes();
  const [deleteId, setDeleteId] = useState(null);

  const filtered = filterNotes(notes, { search, sort, archived: false, tag: tagName });

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteNote(deleteId);
      setDeleteId(null);
    }
  };

  if (!tagName) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={Tags}
            title="Select a tag"
            description="Choose a tag from the sidebar to filter notes."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <Tags size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {tagName}
        </h1>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={Tags}
            title="No notes with this tag"
            description="Add this tag to a note to see it here."
          />
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPin={pinNote}
              onArchive={archiveNote}
              onDelete={handleDelete}
              onClick={() => navigate(`/note/${note.id}`)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete note"
        footer={
          <>
            <button className="btnSecondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btnDanger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        Are you sure you want to delete this note? This action cannot be undone.
      </Modal>
    </div>
  );
}
